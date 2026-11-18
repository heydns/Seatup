/**
 * MerchantBuyers — Page "Mes acheteurs" côté Organisateur (V1.5)
 * ─────────────────────────────────────────────────────────────────────────
 * Liste tous les acheteurs des events de l'organizer authentifié, avec :
 *   - Filtre par période (PeriodFilter)
 *   - Recherche par nom/email/CSE/event
 *   - Export CSV pour alimenter le CRM externe du club
 *   - RGPD : seules les données strictement nécessaires sont exposées
 *     (pas de date de naissance, pas de données enfants, etc.)
 *
 * Demande client : Jean-Christophe Cariou (Les Jokers) pour intégrer les
 * acheteurs SeatUp dans leur CRM club.
 */

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft,
  Search,
  Download,
  Users,
  Loader2,
  Mail,
  Calendar,
  Building2,
  TrendingUp,
  Euro,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { PeriodFilter, defaultPeriod, type PeriodRange } from '@/components/PeriodFilter';
import { Header } from '@/components/Header';
import { toast } from 'sonner';

interface BuyerRow {
  reservation_id: string;
  user_id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  cse_name: string | null;
  event_id: string;
  event_title: string;
  event_date: string;
  quantity: number;
  total_amount: number;
  status: string;
  purchased_at: string;
}

const MerchantBuyers = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<PeriodRange>(defaultPeriod);
  const [search, setSearch] = useState('');
  const [buyers, setBuyers] = useState<BuyerRow[]>([]);
  const [loading, setLoading] = useState(true);

  const organizerId = (userProfile as any)?.organizer_id;

  useEffect(() => {
    const load = async () => {
      if (!organizerId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        // 1. Récupère les events de l'organizer
        const { data: events } = await supabase
          .from('events')
          .select('id, title, event_date')
          .eq('organizer_id', organizerId);

        if (!events || events.length === 0) {
          setBuyers([]);
          setLoading(false);
          return;
        }

        const eventIds = events.map((e: any) => e.id);
        const eventById = new Map<string, { title: string; event_date: string }>();
        events.forEach((e: any) => eventById.set(e.id, { title: e.title, event_date: e.event_date }));

        // 2. Récupère les réservations des events (sur la période)
        let resvQuery = supabase
          .from('reservations')
          .select('id, user_id, event_id, quantity, total_amount, status, created_at')
          .in('event_id', eventIds)
          .in('status', ['confirmed', 'completed']);

        if (period.from) resvQuery = resvQuery.gte('created_at', period.from.toISOString());
        if (period.to) resvQuery = resvQuery.lte('created_at', period.to.toISOString());

        const { data: reservations } = await resvQuery;

        if (!reservations || reservations.length === 0) {
          setBuyers([]);
          setLoading(false);
          return;
        }

        // 3. Récupère les profiles des acheteurs
        const userIds = Array.from(new Set(reservations.map((r: any) => r.user_id)));
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, first_name, last_name, email, cse_company_id')
          .in('id', userIds);

        const profileById = new Map<string, any>();
        (profiles ?? []).forEach((p: any) => profileById.set(p.id, p));

        // 4. Récupère les CSE pour afficher le nom
        const cseIds = Array.from(
          new Set((profiles ?? []).map((p: any) => p.cse_company_id).filter(Boolean))
        );
        const { data: cseCompanies } = cseIds.length > 0
          ? await supabase.from('cse_companies').select('id, name').in('id', cseIds)
          : { data: [] };
        const cseById = new Map<string, string>();
        (cseCompanies ?? []).forEach((c: any) => cseById.set(c.id, c.name));

        // 5. Combine tout
        const rows: BuyerRow[] = reservations.map((r: any) => {
          const profile = profileById.get(r.user_id) ?? {};
          const event = eventById.get(r.event_id) ?? { title: 'Event inconnu', event_date: '' };
          return {
            reservation_id: r.id,
            user_id: r.user_id,
            first_name: profile.first_name ?? null,
            last_name: profile.last_name ?? null,
            email: profile.email ?? '',
            cse_name: profile.cse_company_id ? (cseById.get(profile.cse_company_id) ?? null) : null,
            event_id: r.event_id,
            event_title: event.title,
            event_date: event.event_date,
            quantity: r.quantity,
            total_amount: r.total_amount ?? 0,
            status: r.status,
            purchased_at: r.created_at,
          };
        });

        setBuyers(rows);
      } catch (err) {
        console.error('[MerchantBuyers] Load error:', err);
        toast.error('Erreur au chargement des acheteurs');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [organizerId, period]);

  // ─── Filtre par recherche ─────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!search.trim()) return buyers;
    const q = search.toLowerCase();
    return buyers.filter(
      (b) =>
        b.email.toLowerCase().includes(q) ||
        (b.first_name ?? '').toLowerCase().includes(q) ||
        (b.last_name ?? '').toLowerCase().includes(q) ||
        (b.cse_name ?? '').toLowerCase().includes(q) ||
        b.event_title.toLowerCase().includes(q)
    );
  }, [buyers, search]);

  // ─── Agrégats (affichés en KPIs en haut) ──────────────────────────────
  const uniqueBuyers = new Set(filtered.map((b) => b.user_id)).size;
  const totalTickets = filtered.reduce((sum, b) => sum + b.quantity, 0);
  const totalRevenue = filtered.reduce((sum, b) => sum + b.total_amount, 0);

  // ─── Export CSV ──────────────────────────────────────────────────────
  const downloadCsv = () => {
    if (filtered.length === 0) {
      toast.error('Aucune ligne à exporter');
      return;
    }

    // Colonnes RGPD-friendly : pas de données enfants, pas de dates de
    // naissance. Juste les infos nécessaires à un CRM.
    const headers = [
      'Date achat',
      'Prénom',
      'Nom',
      'Email',
      'CSE / Entreprise',
      'Événement',
      'Date événement',
      'Quantité',
      'Montant total (€)',
      'Statut',
    ];

    const escapeCsv = (val: string | number | null) => {
      if (val === null || val === undefined) return '';
      const str = String(val);
      // Si contient virgule, guillemets ou newline → encadrer et doubler les guillemets
      if (/[",\n\r]/.test(str)) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const lines = [
      headers.join(','),
      ...filtered.map((b) =>
        [
          escapeCsv(new Date(b.purchased_at).toLocaleDateString('fr-FR')),
          escapeCsv(b.first_name),
          escapeCsv(b.last_name),
          escapeCsv(b.email),
          escapeCsv(b.cse_name),
          escapeCsv(b.event_title),
          escapeCsv(b.event_date ? new Date(b.event_date).toLocaleDateString('fr-FR') : ''),
          escapeCsv(b.quantity),
          escapeCsv(b.total_amount),
          escapeCsv(b.status),
        ].join(',')
      ),
    ];

    const csv = '﻿' + lines.join('\n'); // BOM UTF-8 pour Excel
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const periodLabel = period.label?.replace(/\s/g, '-').toLowerCase() ?? 'export';
    a.download = `seatup-acheteurs-${periodLabel}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(`${filtered.length} ligne${filtered.length > 1 ? 's' : ''} exportée${filtered.length > 1 ? 's' : ''}`);
  };

  if (!organizerId) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center p-4">
          <Card className="max-w-md">
            <CardHeader>
              <CardTitle>Accès refusé</CardTitle>
              <CardDescription>
                Cette page est réservée aux organisateurs partenaires SeatUp.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" onClick={() => navigate('/')} className="w-full">
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4 space-y-6">
          {/* ─── Breadcrumb + titre ──────────────────────── */}
          <div>
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2 mb-4">
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </Button>
            <div className="flex items-start justify-between flex-wrap gap-3">
              <div>
                <h1 className="text-3xl font-monument text-brand">Mes acheteurs</h1>
                <p className="text-muted-foreground mt-1">
                  Liste des bénéficiaires ayant acheté un billet pour vos événements.
                  Exportez pour alimenter votre CRM.
                </p>
              </div>
              <PeriodFilter value={period} onChange={setPeriod} />
            </div>
          </div>

          {/* ─── KPIs ────────────────────────────────────── */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KpiTile icon={<Users className="h-5 w-5" />} label="Acheteurs uniques" value={uniqueBuyers} color="#3A7BFF" />
            <KpiTile icon={<Mail className="h-5 w-5" />} label="Ventes" value={filtered.length} color="#C81D85" />
            <KpiTile icon={<TrendingUp className="h-5 w-5" />} label="Billets" value={totalTickets} color="#16A34A" />
            <KpiTile icon={<Euro className="h-5 w-5" />} label="CA" value={`${Math.round(totalRevenue)}€`} color="#EA580C" />
          </div>

          {/* ─── Search + export ────────────────────────── */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher par nom, email, CSE, événement…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="hero" onClick={downloadCsv} disabled={filtered.length === 0} className="gap-2">
              <Download className="h-4 w-4" />
              Exporter CSV ({filtered.length})
            </Button>
          </div>

          {/* ─── Tableau ───────────────────────────────── */}
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="py-16 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Acheteur</TableHead>
                        <TableHead>CSE</TableHead>
                        <TableHead>Événement</TableHead>
                        <TableHead className="text-right">Qté</TableHead>
                        <TableHead className="text-right">Montant</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Date achat</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filtered.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-12">
                            {buyers.length === 0
                              ? 'Aucun achat pour cette période.'
                              : 'Aucun résultat pour cette recherche.'}
                          </TableCell>
                        </TableRow>
                      )}
                      {filtered.map((b) => (
                        <TableRow key={b.reservation_id}>
                          <TableCell>
                            <div className="font-medium">
                              {b.first_name || b.last_name
                                ? `${b.first_name ?? ''} ${b.last_name ?? ''}`.trim()
                                : '—'}
                            </div>
                            <div className="text-xs text-muted-foreground">{b.email}</div>
                          </TableCell>
                          <TableCell>
                            {b.cse_name ? (
                              <span className="inline-flex items-center gap-1 text-sm">
                                <Building2 className="h-3 w-3 text-muted-foreground" />
                                {b.cse_name}
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-medium max-w-[200px] truncate" title={b.event_title}>
                              {b.event_title}
                            </div>
                            {b.event_date && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(b.event_date).toLocaleDateString('fr-FR')}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{b.quantity}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {Math.round(b.total_amount)}€
                          </TableCell>
                          <TableCell>
                            {b.status === 'confirmed' ? (
                              <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmé</Badge>
                            ) : b.status === 'completed' ? (
                              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Terminé</Badge>
                            ) : (
                              <Badge variant="outline">{b.status}</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(b.purchased_at).toLocaleDateString('fr-FR')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>

          {/* ─── Footer RGPD ────────────────────────── */}
          <Card className="bg-muted/30 border-dashed">
            <CardContent className="p-4 text-xs text-muted-foreground">
              <p className="font-medium mb-1">🔒 RGPD — à savoir avant de contacter les acheteurs</p>
              <p>
                Les bénéficiaires ont consenti à partager leurs coordonnées avec les organisateurs
                des événements qu'ils réservent. Vous pouvez les contacter dans le cadre de
                la commande (billet, info événement, service après-vente). Pour toute communication
                marketing non-sollicitée, vous devez obtenir un consentement explicite distinct.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
};

// ─── Sous-composant KPI ────────────────────────────────────────────────

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
  <Card>
    <CardContent className="p-4">
      <div className="flex items-center gap-2 mb-2" style={{ color }}>
        {icon}
      </div>
      <div className="text-2xl font-monument font-bold">{value}</div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </CardContent>
  </Card>
);

export default MerchantBuyers;
