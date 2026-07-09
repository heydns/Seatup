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
  Eye,
  Edit,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import CreateEventWizard from '@/components/modals/CreateEventWizard';

/**
 * OrganizerAdminDashboard — Prio 1 Marchand : Dashboard + Créer événement
 * ─────────────────────────────────────────────────────────────────────────
 * Branché sur Supabase (events + reservations + organizers).
 * Bouton "Créer un événement" → wizard 3 étapes.
 */

interface EventRow {
  id: string;
  title: string;
  event_date: string;
  location_name: string;
  status: string;
  total_tickets: number;
  sold_tickets: number;
  original_price: number;
  our_price: number;
  is_published: boolean;
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
        .select('id, title, event_date, location_name, status, total_tickets, sold_tickets, original_price, our_price, is_published')
        .eq('organizer_id', organizerId)
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

  const totalRevenue = events.reduce((s, e) => s + e.sold_tickets * e.our_price, 0);
  const totalSold = events.reduce((s, e) => s + e.sold_tickets, 0);
  const upcomingEvents = events.filter((e) => new Date(e.event_date) > new Date()).length;
  const totalCapacity = events.reduce((s, e) => s + e.total_tickets, 0);
  const fillRate = totalCapacity > 0 ? Math.round((totalSold / totalCapacity) * 100) : 0;
  const avgPrice = events.length > 0
    ? Math.round(events.reduce((s, e) => s + e.our_price, 0) / events.length)
    : 0;

  const filteredEvents = events.filter((e) =>
    e.title.toLowerCase().includes(search.toLowerCase())
  );

  // Fake sales trend for now (à brancher sur reservations agrégées plus tard)
  const salesTrend = [
    { mois: 'Jan', ca: Math.round(totalRevenue * 0.10) },
    { mois: 'Fév', ca: Math.round(totalRevenue * 0.15) },
    { mois: 'Mar', ca: Math.round(totalRevenue * 0.18) },
    { mois: 'Avr', ca: Math.round(totalRevenue * 0.20) },
    { mois: 'Mai', ca: Math.round(totalRevenue * 0.17) },
    { mois: 'Jun', ca: Math.round(totalRevenue * 0.20) },
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
          <Button variant="outline" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Déconnexion
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex flex-wrap gap-3">
          <Button variant="hero" size="lg" onClick={() => setWizardOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Créer un événement
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Chiffre d'affaires</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Euro className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument text-brand">{totalRevenue.toLocaleString('fr-FR')} €</div>
              <p className="text-xs text-muted-foreground">Total généré</p>
            </CardContent>
          </Card>

          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Billets vendus</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <TrendingUp className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument text-brand">{totalSold.toLocaleString('fr-FR')}</div>
              <p className="text-xs text-muted-foreground">Cumul depuis lancement</p>
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
              <p className="text-xs text-muted-foreground">Par billet</p>
            </CardContent>
          </Card>

          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Événements actifs</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument text-brand">{upcomingEvents}</div>
              <p className="text-xs text-muted-foreground">
                À venir · Taux de remplissage : {fillRate}%
              </p>
            </CardContent>
          </Card>
        </div>

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
                    <TableHead>Actions</TableHead>
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
                          <div className="flex gap-1">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
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

      {organizerId && (
        <CreateEventWizard
          open={wizardOpen}
          onOpenChange={setWizardOpen}
          organizerId={organizerId}
          organizerName={organizer?.name ?? 'Mon organisation'}
          onSuccess={loadData}
        />
      )}
    </div>
  );
};

export default OrganizerAdminDashboard;
