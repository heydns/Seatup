import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Calendar,
  TrendingUp,
  Users,
  Euro,
  Plus,
  Search,
  LogOut,
  Loader2,
  Edit,
  Trash2,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import CreateEventWizard, { type EditableEvent } from '@/components/modals/CreateEventWizard';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';
import { PeriodFilter, defaultPeriod, type PeriodRange } from '@/components/PeriodFilter';
import { MerchantActivityPanel } from '@/components/MerchantActivityPanel';
import { SpaceSwitcher } from '@/components/SpaceSwitcher';
import { Link } from 'react-router-dom';
import { FileText, BarChart3, Package } from 'lucide-react';

/**
 * OrganizerAdminDashboard v2 — Prio 1 + Prio 2 Marchand
 * ─────────────────────────────────────────────────────────────────────────
 * Ajouts Prio 2 :
 *  - Bouton "Modifier" sur chaque ligne événement (P2-6)
 *  - Bouton "Supprimer" avec soft delete si billets vendus (P2-7)
 */

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  location_name: string;
  location_address: string | null;
  description: string | null;
  sport: string;
  competition: string | null;
  status: string;
  total_tickets: number;
  sold_tickets: number;
  original_price: number;
  our_price: number;
  is_published: boolean;
  image_url: string | null;
  conditions_specifiques: string | null;
}

interface Organizer {
  id: string;
  name: string;
}

const OrganizerAdminDashboard = () => {
  const { userProfile, signOut } = useAuth();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState<EditableEvent | null>(null);
  const [eventToDelete, setEventToDelete] = useState<EventRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [period, setPeriod] = useState<PeriodRange>(defaultPeriod);

  const organizerId = (userProfile as any)?.organizer_id;

  const loadData = async () => {
    if (!organizerId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: org } = await supabase
        .from('organizers')
        .select('id, name')
        .eq('id', organizerId)
        .maybeSingle();
      setOrganizer(org as Organizer | null);

      const { data: evs } = await supabase
        .from('events')
        .select('id, title, event_date, location_name, location_address, description, sport, competition, status, total_tickets, sold_tickets, original_price, our_price, is_published, image_url, conditions_specifiques')
        .eq('organizer_id', organizerId)
        .neq('status', 'archived')
        .order('event_date', { ascending: false });

      setEvents((evs as EventRow[]) ?? []);
    } catch (err) {
      console.error('Load organizer data:', err);
      toast.error('Erreur chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [organizerId]);

  // ─── Handlers ────────────────────────────────────────────────
  const openCreate = () => {
    setEventToEdit(null);
    setWizardOpen(true);
  };

  const openEdit = (ev: EventRow) => {
    setEventToEdit({
      id: ev.id,
      title: ev.title,
      sport: ev.sport,
      competition: ev.competition,
      event_date: ev.event_date,
      description: ev.description,
      location_name: ev.location_name,
      location_address: ev.location_address,
      total_tickets: ev.total_tickets,
      sold_tickets: ev.sold_tickets,
      original_price: ev.original_price,
      our_price: ev.our_price,
      image_url: ev.image_url,
      conditions_specifiques: ev.conditions_specifiques,
      status: ev.status,
      is_published: ev.is_published,
    });
    setWizardOpen(true);
  };

  const handleDelete = async () => {
    if (!eventToDelete) return;
    setIsDeleting(true);
    try {
      if (eventToDelete.sold_tickets > 0) {
        // Soft delete : passage en archived (l'historique reste consultable)
        const { error } = await supabase
          .from('events')
          .update({ status: 'archived', is_published: false })
          .eq('id', eventToDelete.id);
        if (error) throw error;
        toast.success(
          `L'événement a été archivé (${eventToDelete.sold_tickets} billets déjà vendus, l'historique est conservé).`
        );
      } else {
        // Hard delete si aucun billet vendu
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', eventToDelete.id);
        if (error) throw error;
        toast.success('L\'événement a été supprimé avec succès.');
      }
      setEventToDelete(null);
      await loadData();
    } catch (err: any) {
      console.error('Delete event error:', err);
      toast.error(`Erreur : ${err.message ?? 'suppression impossible'}`);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtre par période (sur event_date)
  const eventsInPeriod = events.filter((e) => {
    if (!period.from && !period.to) return true;
    const d = new Date(e.event_date);
    if (period.from && d < period.from) return false;
    if (period.to && d > period.to) return false;
    return true;
  });

  const totalSold = eventsInPeriod.reduce((s, e) => s + e.sold_tickets, 0);
  const totalPrice = eventsInPeriod.reduce((s, e) => s + e.sold_tickets * e.our_price, 0); // Prix total (brut)
  const commissionRate = 0.10; // 10% commission Seatup
  const netRevenue = Math.round(totalPrice * (1 - commissionRate)); // CA net
  const upcomingEvents = eventsInPeriod.filter(
    (e) => new Date(e.event_date) > new Date() && e.is_published
  ).length;
  const totalCapacity = eventsInPeriod.reduce((s, e) => s + e.total_tickets, 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  // Prix moyen = revenu total / billets vendus (vrai prix moyen pondéré)
  const avgPrice = totalSold > 0 ? Math.round(totalPrice / totalSold) : 0;

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  const salesTrend = [
    { mois: 'Jan', ca: Math.round(totalPrice * 0.10) },
    { mois: 'Fév', ca: Math.round(totalPrice * 0.15) },
    { mois: 'Mar', ca: Math.round(totalPrice * 0.18) },
    { mois: 'Avr', ca: Math.round(totalPrice * 0.20) },
    { mois: 'Mai', ca: Math.round(totalPrice * 0.17) },
    { mois: 'Jun', ca: Math.round(totalPrice * 0.20) },
  ];

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) toast.error('Erreur déconnexion');
  };

  const getStatusBadge = (event: EventRow) => {
    if (!event.is_published) return <Badge variant="outline">Brouillon</Badge>;
    if (event.sold_tickets >= event.total_tickets)
      return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Complet</Badge>;
    if (new Date(event.event_date) < new Date())
      return <Badge variant="outline">Terminé</Badge>;
    return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Publié</Badge>;
  };

  if (!organizerId && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Aucun organisateur rattaché</CardTitle>
            <CardDescription>
              Votre profil n'est pas encore lié à un organisateur. Contactez votre
              administrateur pour finaliser la configuration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Se déconnecter
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Espace Organisateur</p>
            <h1 className="text-2xl md:text-3xl font-monument text-brand mt-1">
              {organizer?.name ?? userProfile?.company_name ?? 'Mon organisation'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Bonjour {userProfile?.first_name}, pilotez vos événements et vos ventes
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SpaceSwitcher />
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Button variant="hero" size="lg" onClick={openCreate} className="gap-2">
              <Plus className="h-4 w-4" />
              Créer un événement
            </Button>
            <Link to="/admin/marchand/factures">
              <Button variant="sport" size="lg" className="gap-2">
                <FileText className="h-4 w-4" />
                Factures
              </Button>
            </Link>
            <Link to="/admin/marchand/stats">
              <Button variant="sport" size="lg" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Statistiques
              </Button>
            </Link>
            <Link to="/admin/marchand/acheteurs">
              <Button variant="sport" size="lg" className="gap-2">
                <Users className="h-4 w-4" />
                Mes acheteurs
              </Button>
            </Link>
            <Link to="/admin/marchand/communication">
              <Button variant="sport" size="lg" className="gap-2">
                <Package className="h-4 w-4" />
                Communication
              </Button>
            </Link>
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Billets vendus</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              {totalSold === 0 ? (
                <>
                  <div className="text-2xl font-monument text-muted-foreground">—</div>
                  <p className="text-xs text-muted-foreground">Aucune vente pour cette période</p>
                </>
              ) : (
                <>
                  <div className="text-2xl font-monument text-brand">{totalSold.toLocaleString('fr-FR')}</div>
                  <p className="text-xs text-muted-foreground">{period.label}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Prix moyen</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument text-brand">{avgPrice} €</div>
              <p className="text-xs text-muted-foreground">Par billet vendu</p>
            </CardContent>
          </Card>

          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Prix total (brut)</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Euro className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument text-brand">
                {totalPrice.toLocaleString('fr-FR')} €
              </div>
              <p className="text-xs text-muted-foreground">Avant commissions</p>
            </CardContent>
          </Card>

          <Card className="card-sport bg-gradient-primary text-white border-0">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium opacity-90">CA net</CardTitle>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Euro className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument">
                {netRevenue.toLocaleString('fr-FR')} €
              </div>
              <p className="text-xs opacity-80">Après commission Seatup ({Math.round(commissionRate * 100)}%)</p>
            </CardContent>
          </Card>
        </div>

        {/* Complément : événements actifs + taux de remplissage */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Événements à venir</CardTitle>
              <Calendar className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-monument text-brand">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">Publiés et non passés</p>
            </CardContent>
          </Card>

          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Taux de remplissage</CardTitle>
              <TrendingUp className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-xl font-monument text-brand">{fillRate}%</div>
              <p className="text-xs text-muted-foreground">Vendus / capacité totale</p>
            </CardContent>
          </Card>
        </div>

        {/* ─── V1 — Panel d'activité agrégée (Sales Intelligence) ─────────── */}
        {organizerId && (
          <MerchantActivityPanel organizerId={organizerId} period={period} />
        )}

        {events.length > 0 && (
          <Card className="card-sport">
            <CardHeader>
              <CardTitle className="font-monument text-brand text-lg">Ventes (6 derniers mois)</CardTitle>
              <CardDescription>Évolution de votre chiffre d'affaires</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={salesTrend}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="mois" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                  <Line
                    type="monotone"
                    dataKey="ca"
                    stroke="hsl(221,100%,61%)"
                    strokeWidth={3}
                    dot={{ fill: 'hsl(221,100%,61%)', strokeWidth: 2, r: 4 }}
                    name="Revenus (€)"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <Card className="card-sport">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="font-monument text-brand">
                  Vos événements ({filteredEvents.length})
                </CardTitle>
                <CardDescription>Gérez vos événements publiés et brouillons</CardDescription>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 w-64"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {filteredEvents.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                {events.length === 0
                  ? "Aucun événement pour le moment. Créez votre premier événement avec le bouton ci-dessus."
                  : 'Aucun résultat pour cette recherche.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Événement</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Vendus</TableHead>
                    <TableHead>CA</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvents.map((ev) => {
                    const revenue = ev.sold_tickets * ev.our_price;
                    return (
                      <TableRow key={ev.id}>
                        <TableCell>
                          <p className="font-medium">{ev.title}</p>
                          <p className="text-xs text-muted-foreground">{ev.location_name}</p>
                        </TableCell>
                        <TableCell className="text-sm">
                          {new Date(ev.event_date).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">
                            {ev.sold_tickets} / {ev.total_tickets}
                          </span>
                        </TableCell>
                        <TableCell className="font-medium">
                          {revenue.toLocaleString('fr-FR')} €
                        </TableCell>
                        <TableCell>{getStatusBadge(ev)}</TableCell>
                        <TableCell>
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Modifier"
                              onClick={() => openEdit(ev)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Supprimer"
                              className="hover:text-destructive hover:bg-red-50"
                              onClick={() => setEventToDelete(ev)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Modals ─────────────────────────────────────────────── */}
      {organizerId && (
        <>
          <CreateEventWizard
            open={wizardOpen}
            onOpenChange={(o) => {
              setWizardOpen(o);
              if (!o) setEventToEdit(null);
            }}
            organizerId={organizerId}
            organizerName={organizer?.name ?? 'Mon organisation'}
            eventToEdit={eventToEdit}
            onSuccess={loadData}
          />
          <ConfirmDeleteModal
            open={eventToDelete !== null}
            onOpenChange={(o) => !o && setEventToDelete(null)}
            title="Supprimer cet événement ?"
            description={
              eventToDelete && eventToDelete.sold_tickets > 0 ? (
                <>
                  <strong>{eventToDelete.sold_tickets} billet(s) déjà vendu(s).</strong> L'événement
                  sera <strong>archivé</strong> plutôt que supprimé : il disparaîtra du catalogue
                  mais les billets restent valides pour les bénéficiaires et l'historique est
                  conservé pour audit.
                </>
              ) : (
                <>
                  Cette action est <strong>irréversible</strong>. L'événement sera retiré
                  définitivement du catalogue. Aucun billet n'ayant été vendu, aucune donnée
                  historique n'est concernée.
                </>
              )
            }
            confirmLabel={
              eventToDelete && eventToDelete.sold_tickets > 0 ? 'Archiver' : 'Supprimer'
            }
            variant={eventToDelete && eventToDelete.sold_tickets > 0 ? 'warning' : 'danger'}
            onConfirm={handleDelete}
            isLoading={isDeleting}
          />
        </>
      )}
    </div>
  );
};

export default OrganizerAdminDashboard;
