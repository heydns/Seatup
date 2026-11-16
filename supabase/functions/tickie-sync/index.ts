// ═══════════════════════════════════════════════════════════════════════════
// Supabase Edge Function : tickie-sync
// ═══════════════════════════════════════════════════════════════════════════
// Récupère les events depuis l'API Tickie (Vivenu) et les sync dans la table
// `events` de Seatup avec external_source='tickie'.
//
// Mode V1 : "display + redirect"
//   - Les events Tickie sont affichés dans le catalogue SeatUp
//   - Le CTA Réserver redirige vers la billetterie du club (Les Jokers)
//   - mode_distribution = 'checkout_external'
//
// À déclencher :
//   - Manuellement via POST (admin SeatUp)
//   - Cron quotidien à 6h via pg_cron (Supabase Pro requis)
//
// Variables d'env :
//   - TICKIE_API_KEY : clé API Tickie (fournie par Maiolini)
//   - SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY
//
// Deploy :
//   npx supabase functions deploy tickie-sync
// ═══════════════════════════════════════════════════════════════════════════

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const TICKIE_BASE_URL = 'https://vivenu.com/api';

interface TickieEvent {
  _id: string;
  name: string;
  description?: string;
  start: string;  // ISO date
  end?: string;
  locationName?: string;
  locationCity?: string;
  locationCountry?: string;
  image?: string;
  tickets?: Array<{
    _id: string;
    name: string;
    price: number;
    amount?: number;
  }>;
  url?: string;
  underShops?: string[];
  [key: string]: unknown;
}

const JOKERS_SELLER_ID = 'JC_CARIOU_LES_JOKERS'; // Placeholder — à mettre à jour avec le vrai sellerId Tickie
const JOKERS_ORGANIZER_NAME = 'Les Jokers';
const DEFAULT_REDIRECT_URL = 'https://lesjokers.net/billetterie';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TICKIE_API_KEY = Deno.env.get('TICKIE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!TICKIE_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'TICKIE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(
        JSON.stringify({ error: 'Supabase config missing' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // 1. Récupérer les events depuis l'API Tickie
    const now = new Date().toISOString();
    const params = new URLSearchParams({
      start: now,  // uniquement futurs
      top: '100',
      sortDir: '1',
    });

    const tickieRes = await fetch(`${TICKIE_BASE_URL}/events?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${TICKIE_API_KEY}`,
        'Content-Type': 'application/json',
      },
    });

    if (!tickieRes.ok) {
      const errText = await tickieRes.text();
      console.error('[tickie-sync] API error:', tickieRes.status, errText);
      return new Response(
        JSON.stringify({ error: 'Tickie API error', status: tickieRes.status, details: errText }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const tickieData = await tickieRes.json();
    const tickieEvents: TickieEvent[] = Array.isArray(tickieData) ? tickieData : (tickieData.events ?? []);

    console.log(`[tickie-sync] Fetched ${tickieEvents.length} events from Tickie`);

    // 2. Trouver (ou créer) l'organizer "Les Jokers" dans notre DB
    let { data: organizer } = await supabaseClient
      .from('organizers')
      .select('id')
      .eq('name', JOKERS_ORGANIZER_NAME)
      .maybeSingle();

    if (!organizer) {
      const { data: newOrganizer, error: orgError } = await supabaseClient
        .from('organizers')
        .insert({
          name: JOKERS_ORGANIZER_NAME,
          description: 'Club partenaire SeatUp (via Tickie)',
          sport: 'Handball',
        })
        .select('id')
        .single();

      if (orgError || !newOrganizer) {
        console.error('[tickie-sync] Could not create organizer:', orgError);
        return new Response(
          JSON.stringify({ error: 'Could not create organizer', details: orgError }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      organizer = newOrganizer;
    }

    // 3. Upsert chaque event Tickie dans notre table events
    const stats = { created: 0, updated: 0, errors: 0 };

    for (const te of tickieEvents) {
      try {
        // Calcule le prix mini depuis les tickets
        const minPrice = te.tickets?.length
          ? Math.min(...te.tickets.map((t) => t.price || 0))
          : 0;

        // Stock total (somme des `amount` par ticket type)
        const totalTickets = te.tickets?.reduce((sum, t) => sum + (t.amount ?? 0), 0) ?? 0;

        // URL de redirection : utilise l'URL Tickie ou fallback
        const redirectUrl = te.url || DEFAULT_REDIRECT_URL;

        const eventPayload = {
          title: te.name,
          description: te.description ?? '',
          event_date: te.start,
          location_name: te.locationName ?? 'Lieu à préciser',
          location_city: te.locationCity ?? '',
          location_address: te.locationCountry
            ? `${te.locationCity ?? ''}, ${te.locationCountry}`.trim()
            : te.locationCity ?? '',
          original_price: minPrice,
          our_price: minPrice, // Pas de remise CSE sur events Tickie (checkout externe)
          total_tickets: totalTickets,
          sold_tickets: 0,
          image_url: te.image ?? null,
          external_link: redirectUrl,
          external_source: 'tickie',
          external_id: te._id,
          external_url: redirectUrl,
          mode_distribution: 'checkout_external',
          is_published: true,
          is_public_visible: true,
          organizer_id: organizer.id,
          sport: 'Handball', // TODO : détecter dynamiquement
          updated_at: new Date().toISOString(),
        };

        // Upsert sur (external_source, external_id)
        const { data: existing } = await supabaseClient
          .from('events')
          .select('id')
          .eq('external_source', 'tickie')
          .eq('external_id', te._id)
          .maybeSingle();

        if (existing) {
          const { error } = await supabaseClient
            .from('events')
            .update(eventPayload)
            .eq('id', existing.id);
          if (error) {
            console.error('[tickie-sync] Update error:', error);
            stats.errors++;
          } else {
            stats.updated++;
          }
        } else {
          const { error } = await supabaseClient.from('events').insert(eventPayload);
          if (error) {
            console.error('[tickie-sync] Insert error:', error);
            stats.errors++;
          } else {
            stats.created++;
          }
        }
      } catch (err) {
        console.error('[tickie-sync] Event mapping error:', err);
        stats.errors++;
      }
    }

    console.log('[tickie-sync] Done:', stats);

    return new Response(
      JSON.stringify({
        success: true,
        totalFetched: tickieEvents.length,
        ...stats,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('[tickie-sync] Unexpected error:', err);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: String(err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
