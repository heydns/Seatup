/**
 * SeatupAdminDashboard — Back-office super admin SeatUp (V1)
 * ─────────────────────────────────────────────────────────────────────────
 * Accessible uniquement aux users avec le rôle 'seatup_admin'.
 *
 * Panel simple (pas un gros CRM) pour :
 *   - Vue d'ensemble : nb CSE / nb users / nb events / nb réservations
 *   - Liste des CSE clients avec nb bénéficiaires actifs
 *   - Liste des Organizers avec nb events publiés
 *   - Détail d'un CSE : ses bénéficiaires + budget + activité
 *   - Détail d'un Organizer : ses events + ventes
 *
 * Route : /admin/seatup
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building2,
  Users,
  Calendar,
  Ticket,
  Search,
  ShieldAlert,
  Loader2,
  TrendingUp,
  Euro,
  ChevronRight,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { useUserRoles } from '@/contexts/UserRolesContext';
import { Header } from '@/components/Header';

interface Stats {
  totalCse: number;
  totalBeneficiaries: number;
  totalOrganizers: number;
  totalEvents: number;
  totalReservations: number;
  totalRevenue: number;
}

interface CseRow {
  id: string;
  name: string;
  beneficiariesCount: number;
  totalBudget: number;
  consumedBudget: number;
  activeBeneficiaries: number;
  createdAt: string;
}

interface OrganizerRow {
  id: string;
  name: string;
  sport: string | null;
  eventsCount: number;
  ticketsSold: number;
  revenue: number;
}

interface BeneficiaryRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  allocated_budget: number | null;
  consumed_budget: number | null;
  is_activated: boolean;
  last_activity: string | null;
}

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  sport: string;
  our_price: number;
  total_tickets: number;
  sold_tickets: number;
  is_published: boolean;
}

const SeatupAdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const { hasRole, isLoading: rolesLoading } = useUserRoles();
  const navigate = useNavigate();

  const [stats, setStats] = useState<Stats | null>(null);
  const [cseRows, setCseRows] = useState<CseRow[]>([]);
  const [orgaRows, setOrgaRows] = useState<OrganizerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchCse, setSearchCse] = useState('');
  const [searchOrga, setSearchOrga] = useState('');

  const [selectedCse, setSelectedCse] = useState<CseRow | null>(null);
  const [selectedOrga, setSelectedOrga] = useState<OrganizerRow | null>(null);
  const [cseBeneficiaries, setCseBeneficiaries] = useState<BeneficiaryRow[]>([]);
  const [orgaEvents, setOrgaEvents] = useState<EventRow[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  // ─── Guard : seulement pour les seatup_admin ──────────────────────────
  const isSeatupAdmin = hasRole('seatup_admin');
  const isCheckingAccess = authLoading || rolesLoading;

  useEffect(() => {
    if (isCheckingAccess) return;
    if (!user) {
      navigate('/auth?returnTo=/admin/seatup');
      return;
    }
    if (!isSeatupAdmin) {
      setLoading(false);
      return;
    }
    loadData();
  }, [user, isSeatupAdmin, isCheckingAccess, navigate]);

  // ─── Chargement des stats globales + listes ───────────────────────────
  const loadData = async () => {
    setLoading(true);
    try {
      // Stats globales (counts)
      const [cseRes, benRes, orgaRes, eventsRes, resvRes] = await Promise.all([
        supabase.from('cse_companies').select('id, name, total_budget, consumed_budget, created_at'),
        supabase
          .from('profiles')
          .select('id, cse_company_id, is_activated, allocated_budget, consumed_budget, last_activity, email, first_name, last_name', { count: 'exact' })
          .eq('role', 'beneficiary')
          .is('deleted_at', null),
        supabase.from('organizers').select('id, name, sport'),
        supabase.from('events').select('id, organizer_id, total_tickets, sold_tickets, our_price, is_published, title, event_date, sport'),
        supabase.from('reservations').select('total_amount, status').in('status', ['confirmed', 'completed']),
      ]);

      const cseList = (cseRes.data ?? []) as any[];
      const benList = (benRes.data ?? []) as any[];
      const orgaList = (orgaRes.data ?? []) as any[];
      const eventsList = (eventsRes.data ?? []) as any[];
      const resvList = (resvRes.data ?? []) as any[];

      // Stats
      const totalRevenue = resvList.reduce((sum, r) => sum + (r.total_amount ?? 0), 0);
      setStats({
        totalCse: cseList.length,
        totalBeneficiaries: benList.length,
        totalOrganizers: orgaList.length,
        totalEvents: eventsList.length,
        totalReservations: resvList.length,
        totalRevenue,
      });

      // CSE rows avec nb bénéficiaires actifs
      const cseWithCounts: CseRow[] = cseList.map((c) => {
        const bens = benList.filter((b) => b.cse_company_id === c.id);
        return {
          id: c.id,
          name: c.name,
          beneficiariesCount: bens.length,
          activeBeneficiaries: bens.filter((b) => b.is_activated).length,
          totalBudget: c.total_budget ?? 0,
          consumedBudget: c.consumed_budget ?? 0,
          createdAt: c.created_at,
        };
      });
      setCseRows(cseWithCounts);

      // Organizers rows avec nb events + ventes
      const orgaWithCounts: OrganizerRow[] = orgaList.map((o) => {
        const events = eventsList.filter((e) => e.organizer_id === o.id);
        const ticketsSold = events.reduce((sum, e) => sum + (e.sold_tickets ?? 0), 0);
        const revenue = events.reduce(
          (sum, e) => sum + (e.sold_tickets ?? 0) * (e.our_price ?? 0),
          0
        );
        return {
          id: o.id,
          name: o.name,
          sport: o.sport,
          eventsCount: events.length,
          ticketsSold,
          revenue,
        };
      });
      setOrgaRows(orgaWithCounts);
    } catch (err) {
      console.error('[SeatupAdmin] Load error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ─── Charge le détail d'un CSE (ses bénéficiaires) ────────────────────
  const openCseDetail = async (cse: CseRow) => {
    setSelectedCse(cse);
    setLoadingDetail(true);
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, allocated_budget, consumed_budget, is_activated, last_activity')
        .eq('cse_company_id', cse.id)
        .eq('role', 'beneficiary')
        .is('deleted_at', null)
        .order('last_activity', { ascending: false, nullsFirst: false });
      setCseBeneficiaries((data ?? []) as BeneficiaryRow[]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ─── Charge le détail d'un Organizer (ses events) ──────────────────────
  const openOrgaDetail = async (orga: OrganizerRow) => {
    setSelectedOrga(orga);
    setLoadingDetail(true);
    try {
      const { data } = await supabase
        .from('events')
        .select('id, title, event_date, sport, our_price, total_tickets, sold_tickets, is_published')
        .eq('organizer_id', orga.id)
        .order('event_date', { ascending: false });
      setOrgaEvents((data ?? []) as EventRow[]);
    } finally {
      setLoadingDetail(false);
    }
  };

  // ─── UI : loader ──────────────────────────────────────────────────────
  if (isCheckingAccess || loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </>
    );
  }

  // ─── UI : accès refusé ────────────────────────────────────────────────
  if (!isSeatupAdmin) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center p-4">
          <Card className="max-w-md w-full">
            <CardHeader className="text-center">
              <div className="mx-auto w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center mb-2">
                <ShieldAlert className="h-7 w-7 text-destructive" />
              </div>
              <CardTitle className="font-monument">Accès refusé</CardTitle>
              <CardDescription>
                Cette page est réservée aux super admins SeatUp. Si tu penses y avoir droit,
                contacte Alex.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="hero" className="w-full" onClick={() => navigate('/')}>
                Retour à l'accueil
              </Button>
            </CardContent>
          </Card>
        </div>
      </>
    );
  }

  const filteredCse = cseRows.filter((c) =>
    c.name.toLowerCase().includes(searchCse.toLowerCase())
  );
  const filteredOrga = orgaRows.filter((o) =>
    o.name.toLowerCase().includes(searchOrga.toLowerCase())
  );

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4 space-y-8">
          {/* ─── Titre ────────────────────────────────────────── */}
          <div>
            <h1 className="text-3xl font-monument text-brand mb-2">Back-office SeatUp</h1>
            <p className="text-muted-foreground">
              Vue d'ensemble de l'activité sur la plateforme.
            </p>
          </div>

          {/* ─── Stats globales ──────────────────────────────── */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
              <StatTile icon={<Building2 className="h-4 w-4" />} label="CSE" value={stats.totalCse} color="#3A7BFF" />
              <StatTile icon={<Users className="h-4 w-4" />} label="Bénéficiaires" value={stats.totalBeneficiaries} color="#C81D85" />
              <StatTile icon={<Calendar className="h-4 w-4" />} label="Organisateurs" value={stats.totalOrganizers} color="#16A34A" />
              <StatTile icon={<Calendar className="h-4 w-4" />} label="Événements" value={stats.totalEvents} color="#EA580C" />
              <StatTile icon={<Ticket className="h-4 w-4" />} label="Réservations" value={stats.totalReservations} color="#2D3E73" />
              <StatTile icon={<Euro className="h-4 w-4" />} label="CA cumulé" value={`${Math.round(stats.totalRevenue)}€`} color="#16A34A" />
            </div>
          )}

          {/* ─── Tabs CSE / Organizers ──────────────────────── */}
          <Tabs defaultValue="cse" className="w-full">
            <TabsList className="grid grid-cols-2 w-full md:w-96">
              <TabsTrigger value="cse" className="gap-2">
                <Building2 className="h-4 w-4" />
                CSE ({cseRows.length})
              </TabsTrigger>
              <TabsTrigger value="organizers" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Organisateurs ({orgaRows.length})
              </TabsTrigger>
            </TabsList>

            {/* ═══ Tab CSE ═══════════════════════════════════════════ */}
            <TabsContent value="cse" className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un CSE…"
                    value={searchCse}
                    onChange={(e) => setSearchCse(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Badge variant="outline">{filteredCse.length} résultats</Badge>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom du CSE</TableHead>
                        <TableHead className="text-right">Bénéficiaires</TableHead>
                        <TableHead className="text-right">Actifs</TableHead>
                        <TableHead className="text-right">Budget alloué</TableHead>
                        <TableHead className="text-right">Consommé</TableHead>
                        <TableHead className="text-right">Créé</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredCse.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                            Aucun CSE pour le moment
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredCse.map((cse) => (
                        <TableRow
                          key={cse.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openCseDetail(cse)}
                        >
                          <TableCell className="font-medium">{cse.name}</TableCell>
                          <TableCell className="text-right">{cse.beneficiariesCount}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={cse.activeBeneficiaries > 0 ? 'default' : 'outline'}>
                              {cse.activeBeneficiaries}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{Math.round(cse.totalBudget)}€</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {Math.round(cse.consumedBudget)}€
                          </TableCell>
                          <TableCell className="text-right text-xs text-muted-foreground">
                            {new Date(cse.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>

            {/* ═══ Tab Organizers ════════════════════════════════════ */}
            <TabsContent value="organizers" className="space-y-4 mt-4">
              <div className="flex items-center gap-3">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un organisateur…"
                    value={searchOrga}
                    onChange={(e) => setSearchOrga(e.target.value)}
                    className="pl-9"
                  />
                </div>
                <Badge variant="outline">{filteredOrga.length} résultats</Badge>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Organisateur</TableHead>
                        <TableHead>Sport</TableHead>
                        <TableHead className="text-right">Événements</TableHead>
                        <TableHead className="text-right">Billets vendus</TableHead>
                        <TableHead className="text-right">CA</TableHead>
                        <TableHead className="w-12"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrga.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                            Aucun organisateur pour le moment
                          </TableCell>
                        </TableRow>
                      )}
                      {filteredOrga.map((orga) => (
                        <TableRow
                          key={orga.id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => openOrgaDetail(orga)}
                        >
                          <TableCell className="font-medium">{orga.name}</TableCell>
                          <TableCell>
                            {orga.sport && <Badge variant="outline">{orga.sport}</Badge>}
                          </TableCell>
                          <TableCell className="text-right">{orga.eventsCount}</TableCell>
                          <TableCell className="text-right">{orga.ticketsSold}</TableCell>
                          <TableCell className="text-right font-semibold text-primary">
                            {Math.round(orga.revenue)}€
                          </TableCell>
                          <TableCell>
                            <ChevronRight className="h-4 w-4 text-muted-foreground" />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* ═══ Modal détail CSE ══════════════════════════════════════════ */}
      <Dialog open={!!selectedCse} onOpenChange={(o) => !o && setSelectedCse(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedCse && (
            <>
              <DialogHeader>
                <DialogTitle className="font-monument text-2xl">{selectedCse.name}</DialogTitle>
                <DialogDescription>
                  {selectedCse.beneficiariesCount} bénéficiaires · Budget {Math.round(selectedCse.totalBudget)}€
                </DialogDescription>
              </DialogHeader>
              {loadingDetail ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nom</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead className="text-right">Budget</TableHead>
                      <TableHead className="text-right">Consommé</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead className="text-right">Dernière activité</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cseBeneficiaries.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                          Aucun bénéficiaire
                        </TableCell>
                      </TableRow>
                    )}
                    {cseBeneficiaries.map((ben) => (
                      <TableRow key={ben.id}>
                        <TableCell className="font-medium">
                          {ben.first_name} {ben.last_name}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">{ben.email}</TableCell>
                        <TableCell className="text-right">
                          {Math.round(ben.allocated_budget ?? 0)}€
                        </TableCell>
                        <TableCell className="text-right">
                          {Math.round(ben.consumed_budget ?? 0)}€
                        </TableCell>
                        <TableCell>
                          {ben.is_activated ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Actif</Badge>
                          ) : (
                            <Badge variant="outline">Inactif</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right text-xs text-muted-foreground">
                          {ben.last_activity
                            ? new Date(ben.last_activity).toLocaleDateString('fr-FR')
                            : 'Jamais'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ═══ Modal détail Organizer ═══════════════════════════════════ */}
      <Dialog open={!!selectedOrga} onOpenChange={(o) => !o && setSelectedOrga(null)}>
        <DialogContent className="sm:max-w-3xl max-h-[85vh] overflow-y-auto">
          {selectedOrga && (
            <>
              <DialogHeader>
                <DialogTitle className="font-monument text-2xl">{selectedOrga.name}</DialogTitle>
                <DialogDescription>
                  {selectedOrga.eventsCount} événements · {selectedOrga.ticketsSold} billets vendus ·{' '}
                  {Math.round(selectedOrga.revenue)}€ de CA
                </DialogDescription>
              </DialogHeader>
              {loadingDetail ? (
                <div className="py-12 text-center">
                  <Loader2 className="h-6 w-6 animate-spin text-primary mx-auto" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Événement</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Sport</TableHead>
                      <TableHead className="text-right">Prix</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead className="text-right">Vendus</TableHead>
                      <TableHead>Statut</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orgaEvents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                          Aucun événement
                        </TableCell>
                      </TableRow>
                    )}
                    {orgaEvents.map((ev) => (
                      <TableRow key={ev.id}>
                        <TableCell className="font-medium max-w-xs truncate">{ev.title}</TableCell>
                        <TableCell className="text-xs">
                          {new Date(ev.event_date).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{ev.sport}</Badge>
                        </TableCell>
                        <TableCell className="text-right">{Math.round(ev.our_price)}€</TableCell>
                        <TableCell className="text-right">{ev.total_tickets}</TableCell>
                        <TableCell className="text-right">{ev.sold_tickets}</TableCell>
                        <TableCell>
                          {ev.is_published ? (
                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Publié</Badge>
                          ) : (
                            <Badge variant="outline">Brouillon</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

// ─── Sous-composants ──────────────────────────────────────────────────

const StatTile = ({
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

export default SeatupAdminDashboard;
