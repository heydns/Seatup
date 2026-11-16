/**
 * MerchantActivityPanel — Données d'activité agrégées pour organisateur (V1)
 * ─────────────────────────────────────────────────────────────────────────
 * User story V1 : "Consulter les données d'activité de son organisation"
 *
 * Objectif : première brique de "Sales Intelligence" avec des données
 * agrégées et anonymisées (pas de PII des bénéficiaires visible).
 *
 * KPIs affichés :
 *   - Bénéficiaires uniques ayant acheté (sur la période)
 *   - Nouveaux acheteurs vs récurrents
 *   - Revenu moyen par acheteur
 *   - Vues publiques (vitrine) vs vues loggué (comparaison acquisition)
 *   - Top CSE clients par volume d'achats
 */

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, UserPlus, Repeat, Euro, Eye, EyeOff, Building2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import type { PeriodRange } from '@/components/PeriodFilter';

interface Props {
  organizerId: string;
  period: PeriodRange;
}

interface ActivityData {
  uniqueBuyers: number;
  newBuyers: number;
  repeatBuyers: number;
  avgRevenuePerBuyer: number;
  totalRevenue: number;
  publicViews: number;
  authenticatedViews: number;
  topCseClients: Array<{ name: string; buyers: number; revenue: number }>;
}

const EMPTY: ActivityData = {
  uniqueBuyers: 0,
  newBuyers: 0,
  repeatBuyers: 0,
  avgRevenuePerBuyer: 0,
  totalRevenue: 0,
  publicViews: 0,
  authenticatedViews: 0,
  topCseClients: [],
};

export const MerchantActivityPanel = ({ organizerId, period }: Props) => {
  const [data, setData] = useState<ActivityData>(EMPTY);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        // 1. Récupère les events du marchand
        const { data: events } = await supabase
          .from('events')
          .select('id')
          .eq('organizer_id', organizerId);

        if (!events || events.length === 0) {
          setData(EMPTY);
          setLoading(false);
          return;
        }

        const eventIds = events.map((e: any) => e.id);

        // 2. Reservations sur la période
        let resQuery = supabase
          .from('reservations')
          .select('user_id, total_amount, created_at, event_id, status')
          .in('event_id', eventIds)
          .in('status', ['confirmed', 'completed']);

        if (period.from) resQuery = resQuery.gte('created_at', period.from.toISOString());
        if (period.to) resQuery = resQuery.lte('created_at', period.to.toISOString());

        const { data: reservations } = await resQuery;

        if (!reservations || reservations.length === 0) {
          // Pas de réservations, on peut quand même avoir des vues
          const analyticsData = await fetchAnalytics(eventIds, period);
          setData({ ...EMPTY, ...analyticsData });
          setLoading(false);
          return;
        }

        // 3. Calcule les KPIs
        const buyersMap = new Map<string, { count: number; revenue: number; firstPurchase: string }>();
        reservations.forEach((r: any) => {
          const existing = buyersMap.get(r.user_id);
          if (existing) {
            existing.count++;
            existing.revenue += r.total_amount ?? 0;
            if (r.created_at < existing.firstPurchase) existing.firstPurchase = r.created_at;
          } else {
            buyersMap.set(r.user_id, {
              count: 1,
              revenue: r.total_amount ?? 0,
              firstPurchase: r.created_at,
            });
          }
        });

        const uniqueBuyers = buyersMap.size;
        const repeatBuyers = Array.from(buyersMap.values()).filter((b) => b.count > 1).length;

        // Nouveaux acheteurs : ceux dont le 1er achat est dans la période
        // (vérifier qu'ils n'ont aucune autre réservation historique avant)
        let newBuyers = 0;
        const buyerIds = Array.from(buyersMap.keys());
        if (buyerIds.length > 0) {
          const { data: oldRes } = await supabase
            .from('reservations')
            .select('user_id')
            .in('user_id', buyerIds)
            .in('event_id', eventIds)
            .in('status', ['confirmed', 'completed'])
            .lt('created_at', period.from?.toISOString() ?? '1970-01-01');

          const oldBuyerIds = new Set((oldRes ?? []).map((r: any) => r.user_id));
          newBuyers = buyerIds.filter((id) => !oldBuyerIds.has(id)).length;
        }

        const totalRevenue = Array.from(buyersMap.values()).reduce((sum, b) => sum + b.revenue, 0);
        const avgRevenuePerBuyer = uniqueBuyers > 0 ? totalRevenue / uniqueBuyers : 0;

        // 4. Top CSE clients
        const buyerProfiles = await supabase
          .from('profiles')
          .select('id, cse_company_id')
          .in('id', buyerIds);

        const cseIds = Array.from(
          new Set((buyerProfiles.data ?? []).map((p: any) => p.cse_company_id).filter(Boolean))
        );

        const { data: cseCompanies } = cseIds.length > 0
          ? await supabase.from('cse_companies').select('id, name').in('id', cseIds)
          : { data: [] };

        const cseById = new Map((cseCompanies ?? []).map((c: any) => [c.id, c.name]));
        const cseStats = new Map<string, { buyers: Set<string>; revenue: number }>();

        (buyerProfiles.data ?? []).forEach((p: any) => {
          if (!p.cse_company_id) return;
          if (!cseStats.has(p.cse_company_id)) {
            cseStats.set(p.cse_company_id, { buyers: new Set(), revenue: 0 });
          }
          const stat = cseStats.get(p.cse_company_id)!;
          stat.buyers.add(p.id);
          const buyerData = buyersMap.get(p.id);
          if (buyerData) stat.revenue += buyerData.revenue;
        });

        const topCseClients = Array.from(cseStats.entries())
          .map(([id, stat]) => ({
            name: (cseById.get(id) as string) ?? 'CSE inconnu',
            buyers: stat.buyers.size,
            revenue: stat.revenue,
          }))
          .sort((a, b) => b.revenue - a.revenue)
          .slice(0, 5);

        // 5. Analytics vues publiques vs loggué
        const analyticsData = await fetchAnalytics(eventIds, period);

        setData({
          uniqueBuyers,
          newBuyers,
          repeatBuyers,
          avgRevenuePerBuyer,
          totalRevenue,
          publicViews: analyticsData.publicViews,
          authenticatedViews: analyticsData.authenticatedViews,
          topCseClients,
        });
      } catch (err) {
        console.error('[MerchantActivityPanel] Load error:', err);
        setData(EMPTY);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [organizerId, period]);

  if (loading) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-monument flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          Activité de mon organisation
        </CardTitle>
        <CardDescription>
          Données agrégées et anonymisées de votre audience sur la période.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* ─── KPIs principaux ─────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <KpiTile
            icon={<Users className="h-5 w-5" />}
            label="Acheteurs uniques"
            value={data.uniqueBuyers}
            color="#3A7BFF"
          />
          <KpiTile
            icon={<UserPlus className="h-5 w-5" />}
            label="Nouveaux"
            value={data.newBuyers}
            color="#16A34A"
          />
          <KpiTile
            icon={<Repeat className="h-5 w-5" />}
            label="Récurrents"
            value={data.repeatBuyers}
            color="#C81D85"
          />
          <KpiTile
            icon={<Euro className="h-5 w-5" />}
            label="Revenu moyen / acheteur"
            value={`${Math.round(data.avgRevenuePerBuyer)}€`}
            color="#EA580C"
          />
        </div>

        {/* ─── Vues publiques vs loggué ─────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
              <Eye className="h-4 w-4" />
              Vues publiques (vitrine)
            </div>
            <div className="text-2xl font-monument font-bold">{data.publicViews}</div>
            <div className="text-xs text-muted-foreground mt-1">Visiteurs non loggués</div>
          </div>
          <div className="rounded-lg bg-primary/5 p-4">
            <div className="flex items-center gap-2 text-sm text-primary mb-1">
              <EyeOff className="h-4 w-4" />
              Vues loggué
            </div>
            <div className="text-2xl font-monument font-bold text-primary">{data.authenticatedViews}</div>
            <div className="text-xs text-muted-foreground mt-1">Salariés connectés</div>
          </div>
        </div>

        {/* ─── Top CSE clients ────────────────────────────────── */}
        {data.topCseClients.length > 0 && (
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4 text-primary" />
              Top CSE clients (par revenu)
            </h3>
            <div className="space-y-2">
              {data.topCseClients.map((cse, idx) => (
                <div
                  key={cse.name}
                  className="flex items-center justify-between rounded-lg bg-gray-50 p-3 text-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {idx + 1}
                    </span>
                    <span className="font-medium">{cse.name}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-muted-foreground">
                      {cse.buyers} acheteur{cse.buyers > 1 ? 's' : ''}
                    </span>
                    <span className="font-semibold text-primary">
                      {Math.round(cse.revenue)}€
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {data.uniqueBuyers === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">
            Aucune activité sur cette période.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

// ─── Sous-composants ──────────────────────────────────────────────────

const KpiTile = ({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) => (
  <div className="rounded-lg border p-4">
    <div className="flex items-center gap-2 mb-2" style={{ color }}>
      {icon}
    </div>
    <div className="text-2xl font-monument font-bold">{value}</div>
    <div className="text-xs text-muted-foreground mt-1">{label}</div>
  </div>
);

// Fetch des vues publiques vs authentifiées depuis event_analytics
const fetchAnalytics = async (eventIds: string[], period: PeriodRange) => {
  let query = supabase
    .from('event_analytics')
    .select('public_views, authenticated_views, date')
    .in('event_id', eventIds);

  if (period.from) query = query.gte('date', period.from.toISOString().slice(0, 10));
  if (period.to) query = query.lte('date', period.to.toISOString().slice(0, 10));

  const { data } = await query;

  return (data ?? []).reduce(
    (acc: { publicViews: number; authenticatedViews: number }, row: any) => {
      acc.publicViews += row.public_views ?? 0;
      acc.authenticatedViews += row.authenticated_views ?? 0;
      return acc;
    },
    { publicViews: 0, authenticatedViews: 0 }
  );
};
