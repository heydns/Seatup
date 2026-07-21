import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
  PieChart, Pie, Legend,
} from 'recharts';
import { ArrowLeft, MousePointer, Eye, ShoppingCart, Ticket, TrendingUp, Loader2, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { PeriodFilter, defaultPeriod, type PeriodRange } from '@/components/PeriodFilter';

/**
 * MerchantStats — Prio 3 Marchand : Statistiques
 * ─────────────────────────────────────────────────────────────────────────
 * KPIs marketing + funnel de conversion + tops events + résumé financier.
 */

interface EventStats {
  id: string;
  title: string;
  views: number;
  clicks: number;
  addToCart: number;
  purchases: number;
  revenue: number;
}

const COLORS = ['hsl(221,100%,61%)', 'hsl(336,71%,46%)', '#A4E034', '#F1640B', '#2D3E73'];

const MerchantStats = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodRange>(defaultPeriod);
  const [loading, setLoading] = useState(true);
  const [eventStats, setEventStats] = useState<EventStats[]>([]);

  const organizerId = (userProfile as any)?.organizer_id;

  useEffect(() => {
    const load = async () => {
      if (!organizerId) return;
      setLoading(true);

      const { data: events } = await supabase
        .from('events')
        .select('id, title, sold_tickets, our_price')
        .eq('organizer_id', organizerId);

      if (!events) { setLoading(false); return; }

      const eventIds = events.map((e: any) => e.id);
      let analyticsQuery = supabase
        .from('event_analytics')
        .select('event_id, action_type')
        .in('event_id', eventIds);

      if (period.from) analyticsQuery = analyticsQuery.gte('created_at', period.from.toISOString());
      if (period.to) analyticsQuery = analyticsQuery.lte('created_at', period.to.toISOString());

      const { data: analytics } = await analyticsQuery;

      const statsByEvent: Record<string, EventStats> = {};
      for (const ev of events as any[]) {
        statsByEvent[ev.id] = {
          id: ev.id,
          title: ev.title,
          views: 0,
          clicks: 0,
          addToCart: 0,
          purchases: ev.sold_tickets,
          revenue: ev.sold_tickets * ev.our_price,
        };
      }

      for (const a of (analytics ?? []) as any[]) {
        const s = statsByEvent[a.event_id];
        if (!s) continue;
        if (a.action_type === 'view') s.views++;
        else if (a.action_type === 'click') s.clicks++;
        else if (a.action_type === 'add_to_cart') s.addToCart++;
      }

      setEventStats(Object.values(statsByEvent));
      setLoading(false);
    };
    load();
  }, [organizerId, period]);

  const totalViews = eventStats.reduce((s, e) => s + e.views, 0);
  const totalClicks = eventStats.reduce((s, e) => s + e.clicks, 0);
  const totalAddToCart = eventStats.reduce((s, e) => s + e.addToCart, 0);
  const totalPurchases = eventStats.reduce((s, e) => s + e.purchases, 0);
  const totalRevenue = eventStats.reduce((s, e) => s + e.revenue, 0);
  const conversionRate = totalViews > 0 ? Math.round((totalPurchases / totalViews) * 100) : 0;

  const topViewed = [...eventStats].sort((a, b) => b.views - a.views).slice(0, 5);
  const topPurchased = [...eventStats].sort((a, b) => b.purchases - a.purchases).slice(0, 5);

  // Funnel data
  const funnelData = [
    { stage: 'Vues', count: totalViews, pct: 100 },
    { stage: 'Clics', count: totalClicks, pct: totalViews > 0 ? Math.round((totalClicks / totalViews) * 100) : 0 },
    { stage: 'Ajouts panier', count: totalAddToCart, pct: totalViews > 0 ? Math.round((totalAddToCart / totalViews) * 100) : 0 },
    { stage: 'Achats', count: totalPurchases, pct: totalViews > 0 ? Math.round((totalPurchases / totalViews) * 100) : 0 },
  ];

  const hasData = totalViews > 0 || totalPurchases > 0;

  if (!organizerId) return <div className="p-8 text-center text-muted-foreground">Non autorisé</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-monument text-brand">Statistiques</h1>
              <p className="text-sm text-muted-foreground">
                Analysez vos performances marketing et vos ventes
              </p>
            </div>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        {loading ? (
          <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
        ) : !hasData ? (
          <Card className="card-sport">
            <CardContent className="py-16 text-center">
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Aucune statistique disponible pour cette période.</p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* KPIs top */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
              <Card className="card-sport">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-brand">Vues</CardTitle>
                  <Eye className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{totalViews.toLocaleString('fr-FR')}</div>
                  <p className="text-xs text-muted-foreground">Fiches consultées</p>
                </CardContent>
              </Card>

              <Card className="card-sport">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-brand">Clics</CardTitle>
                  <MousePointer className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{totalClicks.toLocaleString('fr-FR')}</div>
                  <p className="text-xs text-muted-foreground">Interactions</p>
                </CardContent>
              </Card>

              <Card className="card-sport">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium text-brand">Achats</CardTitle>
                  <Ticket className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{totalPurchases.toLocaleString('fr-FR')}</div>
                  <p className="text-xs text-muted-foreground">Billets confirmés</p>
                </CardContent>
              </Card>

              <Card className="card-sport bg-gradient-primary text-white border-0">
                <CardHeader className="pb-2 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-medium opacity-90">Taux de conversion</CardTitle>
                  <TrendingUp className="h-4 w-4 text-white" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument">{conversionRate}%</div>
                  <p className="text-xs opacity-80">Achats / Vues</p>
                </CardContent>
              </Card>
            </div>

            {/* Funnel */}
            <Card className="card-sport">
              <CardHeader>
                <CardTitle className="font-monument text-brand">Funnel de conversion</CardTitle>
                <CardDescription>Parcours utilisateur : vue → clic → panier → achat</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {funnelData.map((step, i) => {
                    const icons = [Eye, MousePointer, ShoppingCart, Ticket];
                    const Icon = icons[i];
                    return (
                      <div key={step.stage}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-primary" />
                            <span className="font-medium text-sm">{step.stage}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="font-semibold">{step.count.toLocaleString('fr-FR')}</span>
                            <span className="text-muted-foreground w-12 text-right">{step.pct}%</span>
                          </div>
                        </div>
                        <div className="h-8 w-full bg-muted rounded-lg overflow-hidden">
                          <div
                            className="h-full rounded-lg transition-all flex items-center justify-end pr-2"
                            style={{
                              width: `${step.pct}%`,
                              background: `linear-gradient(90deg, ${COLORS[i]} 0%, ${COLORS[i]}dd 100%)`,
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Tops */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <Card className="card-sport">
                <CardHeader>
                  <CardTitle className="font-monument text-brand flex items-center gap-2">
                    <Trophy className="h-4 w-4" />
                    Top événements les plus consultés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topViewed.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucune vue.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topViewed.map((e) => ({ name: e.title.slice(0, 20), value: e.views }))} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
                        <Tooltip contentStyle={{ borderRadius: 8 }} />
                        <Bar dataKey="value" radius={[0, 8, 8, 0]}>
                          {topViewed.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>

              <Card className="card-sport">
                <CardHeader>
                  <CardTitle className="font-monument text-brand flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    Top événements les plus consommés
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {topPurchased.filter((e) => e.purchases > 0).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-8">Aucun achat.</p>
                  ) : (
                    <ResponsiveContainer width="100%" height={220}>
                      <BarChart data={topPurchased.filter((e) => e.purchases > 0).map((e) => ({ name: e.title.slice(0, 20), value: e.purchases }))} layout="vertical">
                        <XAxis type="number" hide />
                        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} width={140} />
                        <Tooltip contentStyle={{ borderRadius: 8 }} />
                        <Bar dataKey="value" fill="hsl(221,100%,61%)" radius={[0, 8, 8, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Résumé financier par event */}
            <Card className="card-sport">
              <CardHeader>
                <CardTitle className="font-monument text-brand">Résumé financier par événement</CardTitle>
                <CardDescription>Ventes et revenus détaillés</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {eventStats.filter((e) => e.purchases > 0).sort((a, b) => b.revenue - a.revenue).map((e) => (
                    <div key={e.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{e.title}</p>
                        <p className="text-xs text-muted-foreground">{e.purchases} billets · {e.views} vues</p>
                      </div>
                      <span className="font-monument text-brand font-semibold ml-4">
                        {e.revenue.toLocaleString('fr-FR')} €
                      </span>
                    </div>
                  ))}
                  {eventStats.filter((e) => e.purchases > 0).length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">Aucune vente sur la période.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MerchantStats;
