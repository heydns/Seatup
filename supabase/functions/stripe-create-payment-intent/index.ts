// ═══════════════════════════════════════════════════════════════════════════
// Supabase Edge Function : stripe-create-payment-intent
// ═══════════════════════════════════════════════════════════════════════════
// Crée un PaymentIntent pour le checkout d'un événement.
// Appelé par le flow "Confirmer la réservation" côté front.
//
// Body (POST JSON) :
//   {
//     event_id: string (UUID),
//     quantity: number,
//     wallet_amount_cents: number,  // Part payée par cagnotte (déduite côté serveur)
//     cb_amount_cents: number,      // Part à payer par CB (créé en Stripe)
//     payment_method_id?: string    // Si l'user veut utiliser une CB sauvegardée
//   }
//
// Retourne :
//   { clientSecret, paymentIntentId, paymentLogId }
//
// Variables d'env :
//   - STRIPE_SECRET_KEY
//   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface RequestBody {
  event_id: string;
  quantity: number;
  wallet_amount_cents: number;
  cb_amount_cents: number;
  payment_method_id?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const STRIPE_SECRET_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!STRIPE_SECRET_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const body: RequestBody = await req.json();
    const { event_id, quantity, wallet_amount_cents, cb_amount_cents, payment_method_id } = body;

    // Validation
    if (!event_id || !quantity || quantity < 1 || quantity > 10) {
      return new Response(
        JSON.stringify({ error: 'Invalid event_id or quantity (1-10)' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (wallet_amount_cents < 0 || cb_amount_cents < 0) {
      return new Response(
        JSON.stringify({ error: 'Negative amounts not allowed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier que l'event existe et récupérer le vrai prix (sécurité : ne pas
    // faire confiance aux montants du client)
    const { data: event, error: eventError } = await supabaseClient
      .from('events')
      .select('id, title, our_price, original_price, total_tickets, sold_tickets, mode_distribution, is_published')
      .eq('id', event_id)
      .single();

    if (eventError || !event) {
      return new Response(
        JSON.stringify({ error: 'Event not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!event.is_published) {
      return new Response(
        JSON.stringify({ error: 'Event is not published' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (event.mode_distribution !== 'checkout_seatup') {
      return new Response(
        JSON.stringify({ error: 'This event does not support SeatUp checkout' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Recalcule le total attendu
    const expectedTotalCents = Math.round(event.our_price * 100) * quantity;
    const providedTotalCents = wallet_amount_cents + cb_amount_cents;
    if (Math.abs(expectedTotalCents - providedTotalCents) > 1) {
      return new Response(
        JSON.stringify({
          error: 'Amount mismatch',
          expected: expectedTotalCents,
          provided: providedTotalCents,
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Vérifier dispos
    const remaining = (event.total_tickets ?? 0) - (event.sold_tickets ?? 0);
    if (quantity > remaining) {
      return new Response(
        JSON.stringify({ error: 'Not enough tickets available', remaining }),
        { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY, {
      apiVersion: '2024-11-20.acacia',
      httpClient: Stripe.createFetchHttpClient(),
    });

    // Récupère le Stripe Customer
    const { data: customer } = await supabaseClient
      .from('stripe_customers')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .maybeSingle();

    // Si pas de part CB, on fait juste un paiement wallet (pas de Stripe)
    if (cb_amount_cents === 0) {
      const { data: paymentLog } = await supabaseClient
        .from('payment_logs')
        .insert({
          user_id: user.id,
          stripe_payment_intent: null,
          amount_cents: expectedTotalCents,
          wallet_amount_cents,
          cb_amount_cents: 0,
          status: 'succeeded', // Wallet-only : confirmé immédiatement
          metadata: { event_id, quantity },
        })
        .select()
        .single();

      return new Response(
        JSON.stringify({
          clientSecret: null,
          paymentIntentId: null,
          paymentLogId: paymentLog?.id,
          walletOnly: true,
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Création du PaymentIntent Stripe pour la part CB
    const paymentIntentParams: Stripe.PaymentIntentCreateParams = {
      amount: cb_amount_cents,
      currency: 'eur',
      metadata: {
        supabase_user_id: user.id,
        event_id,
        quantity: String(quantity),
        wallet_amount_cents: String(wallet_amount_cents),
      },
      automatic_payment_methods: { enabled: true },
    };

    if (customer?.stripe_customer_id) {
      paymentIntentParams.customer = customer.stripe_customer_id;
    }
    if (payment_method_id) {
      paymentIntentParams.payment_method = payment_method_id;
      paymentIntentParams.confirm = true;
      paymentIntentParams.off_session = true;
    }

    const paymentIntent = await stripe.paymentIntents.create(paymentIntentParams);

    // Log le paiement en DB (pending)
    const { data: paymentLog } = await supabaseClient
      .from('payment_logs')
      .insert({
        user_id: user.id,
        stripe_payment_intent: paymentIntent.id,
        amount_cents: expectedTotalCents,
        wallet_amount_cents,
        cb_amount_cents,
        status: 'pending',
        metadata: { event_id, quantity },
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        paymentLogId: paymentLog?.id,
        walletOnly: false,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[stripe-create-payment-intent] Error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
