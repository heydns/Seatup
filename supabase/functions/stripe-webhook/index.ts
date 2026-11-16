// ═══════════════════════════════════════════════════════════════════════════
// Supabase Edge Function : stripe-webhook
// ═══════════════════════════════════════════════════════════════════════════
// Reçoit les webhooks Stripe (payment_intent.succeeded, etc.) et met à jour
// les payment_logs + confirme les réservations en DB.
//
// Config webhook Stripe (à faire manuellement dans dashboard Stripe une fois
// déployé) :
//   1. Dashboard Stripe → Developers → Webhooks → Add endpoint
//   2. URL : https://<project>.supabase.co/functions/v1/stripe-webhook
//   3. Events à écouter :
//      - payment_intent.succeeded
//      - payment_intent.payment_failed
//      - setup_intent.succeeded (quand une CB est tokenisée avec succès)
//   4. Récupérer le "Signing secret" → Supabase Secrets sous STRIPE_WEBHOOK_SECRET
//
// Deploy :
//   npx supabase functions deploy stripe-webhook --no-verify-jwt
//   (--no-verify-jwt car Stripe appelle sans JWT user)
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
  const STRIPE_WEBHOOK_SECRET = Deno.env.get('STRIPE_WEBHOOK_SECRET');
  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!STRIPE_SECRET_KEY || !STRIPE_WEBHOOK_SECRET || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[stripe-webhook] Missing env vars');
    return new Response('Server config error', { status: 500 });
  }

  const stripe = new Stripe(STRIPE_SECRET_KEY, {
    apiVersion: '2024-11-20.acacia',
    httpClient: Stripe.createFetchHttpClient(),
  });

  const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature header', { status: 400 });
  }

  let event: Stripe.Event;
  const body = await req.text();

  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err) {
    console.error('[stripe-webhook] Signature verification failed:', err);
    return new Response(`Webhook Error: ${err}`, { status: 400 });
  }

  console.log('[stripe-webhook] Received event:', event.type);

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;

        // Marque le payment_log comme succeeded
        await supabaseClient
          .from('payment_logs')
          .update({
            status: 'succeeded',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent', pi.id);

        // TODO V1.5 : créer la réservation en DB automatiquement ici
        // Pour l'instant, le front appelle reserve() après confirmation côté client
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await supabaseClient
          .from('payment_logs')
          .update({
            status: 'failed',
            updated_at: new Date().toISOString(),
          })
          .eq('stripe_payment_intent', pi.id);
        break;
      }

      case 'setup_intent.succeeded': {
        const si = event.data.object as Stripe.SetupIntent;
        const paymentMethodId = si.payment_method as string;
        const customerId = si.customer as string;

        if (paymentMethodId && customerId) {
          // Récupère les détails de la CB
          const pm = await stripe.paymentMethods.retrieve(paymentMethodId);
          const card = pm.card;

          if (card) {
            // Récupère le user_id depuis stripe_customers
            const { data: customer } = await supabaseClient
              .from('stripe_customers')
              .select('user_id')
              .eq('stripe_customer_id', customerId)
              .maybeSingle();

            if (customer?.user_id) {
              // Marque les anciens comme non-default
              await supabaseClient
                .from('payment_methods')
                .update({ is_default: false })
                .eq('user_id', customer.user_id);

              // Insère la nouvelle CB
              await supabaseClient.from('payment_methods').insert({
                user_id: customer.user_id,
                stripe_payment_method: paymentMethodId,
                card_brand: card.brand,
                card_last4: card.last4,
                card_exp_month: card.exp_month,
                card_exp_year: card.exp_year,
                is_default: true,
              });

              // Met à jour default_payment_method sur stripe_customers
              await supabaseClient
                .from('stripe_customers')
                .update({
                  default_payment_method: paymentMethodId,
                  updated_at: new Date().toISOString(),
                })
                .eq('user_id', customer.user_id);
            }
          }
        }
        break;
      }

      default:
        console.log('[stripe-webhook] Unhandled event type:', event.type);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[stripe-webhook] Handler error:', err);
    return new Response('Handler error', { status: 500 });
  }
});
