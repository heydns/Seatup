import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Users,
  UserCheck,
  UserX,
  Ticket,
  Wallet,
  Search,
  Plus,
  LogOut,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import AddBeneficiaryModal from '@/components/modals/AddBeneficiaryModal';
import RechargeWalletModal from '@/components/modals/RechargeWalletModal';
import BeneficiaryDetailModal, { type Beneficiary } from '@/components/modals/BeneficiaryDetailModal';

/**
 * CSEAdminDashboard — Prio 1 CSE #8 : Tableau de bord Admin CSE
 * ─────────────────────────────────────────────────────────────────────────
 * Branché sur Supabase (profiles + cse_companies + reservations + events).
 * Boutons Ajouter bénéficiaire, Recharger cagnotte, clic bénéficiaire → fiche.
 */

interface CseCompany {
  id: string;
  name: string;
  total_budget: number;
  consumed_budget: number;
}

const COLORS = ['hsl(221,100%,61%)', 'hsl(336,71%,46%)', '#A4E034', '#F1640B', '#2D3E73'];

const CSEAdminDashboard = () => {
  const { userProfile, signOut } = useAuth();
  const [company, setCompany] = useState<CseCompany | null>(null);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [topSports, setTopSports] = useState<{ sport: string; count: number }[]>([]);
  const [topClubs, setTopClubs] = useState<{ name: string; count: number }[]>([]);
  const [ticketsCount, setTicketsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [rechargeOpen, setRechargeOpen] = useState(false);
  const [selectedBen, setSelectedBen] = useState<Beneficiary | null>(null);

  const cseCompanyId = (userProfile as any)?.cse_company_id;

  const loadData = async () => {
    if (!cseCompanyId) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const { data: comp } = await supabase
        .from('cse_companies')
        .select('id, name, total_budget, consumed_budget')
        .eq('id', cseCompanyId)
        .maybeSingle();
      setCompany(comp as CseCompany | null);

      const { data: bens } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, is_activated, allocated_budget, consumed_budget, last_activity, created_at')
        .eq('cse_company_id', cseCompanyId)
        .eq('role', 'beneficiary')
        .order('created_at', { ascending: false });

      setBeneficiaries((bens as Beneficiary[]) ?? []);

      if (bens && bens.length > 0) {
        const benIds = bens.map((b: any) => b.id);
        const { data: reservs } = await supabase
          .from('reservations')
          .select('quantity, event:events(sport, organizer:organizers(name))')
          .in('beneficiary_id', benIds)
          .eq('status', 'confirmed');

        if (reservs) {
          const sportMap: Record<string, number> = {};
          const clubMap: Record<string, number> = {};
          let totalTix = 0;
          for (const r of reservs as any[]) {
            const sport = r.event?.sport ?? 'Autre';
            const club = r.event?.organizer?.name ?? '—';
            sportMap[sport] = (sportMap[sport] ?? 0) + r.quantity;
            clubMap[club] = (clubMap[club] ?? 0) + r.quantity;
            totalTix += r.quantity;
          }
          setTicketsCount(totalTix);
          setTopSports(
            Object.entries(sportMap)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([sport, count]) => ({ sport, count }))
          );
          setTopClubs(
            Object.entries(clubMap)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([name, count]) => ({ name, count }))
          );
        }
      }
    } catch (err) {
      console.error('Load CSE data:', err);
      toast.error('Erreur chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [cseCompanyId]);

  const filteredBens = useMemo(() => {
    if (!search.trim()) return beneficiaries;
    const q = search.toLowerCase();
    return beneficiaries.filter(
      (b) =>
        (b.first_name?.toLowerCase() ?? '').includes(q) ||
        (b.last_name?.toLowerCase() ?? '').includes(q) ||
        b.email.toLowerCase().includes(q)
    );
  }, [beneficiaries, search]);

  const activeCount = beneficiaries.filter((b) => b.is_activated).length;
  const inactiveCount = beneficiaries.length - activeCount;
  const budgetRemaining = (company?.total_budget ?? 0) - (company?.consumed_budget ?? 0);
  const budgetUsagePct = company?.total_budget
    ? Math.round((company.consumed_budget / company.total_budget) * 100)
    : 0;

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) toast.error('Erreur déconnexion');
  };

  if (!cseCompanyId && !loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-8">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Aucun CSE rattaché</CardTitle>
            <CardDescription>
              Votre profil n'est pas encore lié à une entreprise CSE. Contactez votre
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
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Espace CSE</p>
            <h1 className="text-2xl md:text-3xl font-monument text-brand mt-1">
              {company?.name ?? userProfile?.company_name ?? 'Mon CSE'}
            </h1>
            <p className="text-sm text-muted-foreground">
              Bonjour {userProfile?.first_name}, gérez vos bénéficiaires et votre budget
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
          <Button variant="hero" size="lg" onClick={() => setAddOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Ajouter un bénéficiaire
          </Button>
          <Button variant="sport" size="lg" onClick={() => setRechargeOpen(true)} className="gap-2">
            <Wallet className="h-4 w-4" />
            Recharger la cagnotte
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Bénéficiaires</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument text-brand">{beneficiaries.length}</div>
              <p className="text-xs text-muted-foreground">Rattachés à votre CSE</p>
            </CardContent>
          </Card>

          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Actifs</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <UserCheck className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument text-brand">{activeCount}</div>
              <p className="text-xs text-muted-foreground">
                {beneficiaries.length > 0
                  ? `${Math.round((activeCount / beneficiaries.length) * 100)}% d'activation`
                  : '—'}
              </p>
            </CardContent>
          </Card>

          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Non connectés</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <UserX className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument text-brand">{inactiveCount}</div>
              <p className="text-xs text-muted-foreground">À relancer</p>
            </CardContent>
          </Card>

          <Card className="card-sport">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium text-brand">Billets achetés</CardTitle>
              <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center">
                <Ticket className="h-4 w-4 text-white" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-monument text-brand">{ticketsCount}</div>
              <p className="text-xs text-muted-foreground">Cumul depuis lancement</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-gradient-primary text-white border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="flex items-center gap-2 text-sm opacity-90">
                  <Wallet className="h-4 w-4" />
                  Cagnotte globale
                </p>
                <p className="mt-3 text-4xl font-monument">
                  {(company?.consumed_budget ?? 0).toLocaleString('fr-FR')} €{' '}
                  <span className="text-xl opacity-70">
                    / {(company?.total_budget ?? 0).toLocaleString('fr-FR')} €
                  </span>
                </p>
                <p className="mt-1 text-sm opacity-90">
                  {budgetUsagePct}% utilisée · Restant : {budgetRemaining.toLocaleString('fr-FR')} €
                </p>
              </div>
            </div>
            <div className="mt-5 h-2 w-full rounded-full bg-white/20 overflow-hidden">
              <div
                className="h-full rounded-full bg-[#A4E034] transition-all"
                style={{ width: `${budgetUsagePct}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {topSports.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <Card className="card-sport">
              <CardHeader>
                <CardTitle className="font-monument text-brand text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Sports les plus populaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={topSports.map((s) => ({ name: s.sport, value: s.count }))}>
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis hide />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {topSports.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card className="card-sport">
              <CardHeader>
                <CardTitle className="font-monument text-brand text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Clubs les plus populaires
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart
                    data={topClubs.map((c) => ({ name: c.name.slice(0, 15), value: c.count }))}
                    layout="vertical"
                  >
                    <XAxis type="number" hide />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} width={110} />
                    <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb' }} />
                    <Bar dataKey="value" fill="hsl(221,100%,61%)" radius={[0, 8, 8, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="card-sport">
          <CardHeader>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <CardTitle className="font-monument text-brand">
                  Vos bénéficiaires ({filteredBens.length})
                </CardTitle>
                <CardDescription>Cliquez sur une ligne pour ouvrir la fiche</CardDescription>
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
            {filteredBens.length === 0 ? (
              <p className="text-center py-8 text-muted-foreground text-sm">
                {beneficiaries.length === 0
                  ? 'Aucun bénéficiaire pour le moment. Ajoutez votre premier collaborateur avec le bouton ci-dessus.'
                  : 'Aucun résultat pour cette recherche.'}
              </p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Budget</TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead>Dernière activité</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBens.map((b) => (
                    <TableRow
                      key={b.id}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedBen(b)}
                    >
                      <TableCell className="font-medium">
                        {b.first_name ?? '—'} {b.last_name ?? ''}
                      </TableCell>
                      <TableCell className="text-sm">{b.email}</TableCell>
                      <TableCell>
                        <span className="text-sm">
                          {(b.consumed_budget ?? 0)} / {(b.allocated_budget ?? 0)} €
                        </span>
                      </TableCell>
                      <TableCell>
                        {b.is_activated ? (
                          <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                            Actif
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-amber-600 border-amber-300">
                            Non activé
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {b.last_activity
                          ? new Date(b.last_activity).toLocaleDateString('fr-FR')
                          : 'Jamais'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {cseCompanyId && (
        <>
          <AddBeneficiaryModal
            open={addOpen}
            onOpenChange={setAddOpen}
            cseCompanyId={cseCompanyId}
            onSuccess={loadData}
          />
          <RechargeWalletModal
            open={rechargeOpen}
            onOpenChange={setRechargeOpen}
            cseCompanyId={cseCompanyId}
            currentBudget={company?.total_budget ?? 0}
            onSuccess={loadData}
          />
          <BeneficiaryDetailModal
            open={selectedBen !== null}
            onOpenChange={(o) => !o && setSelectedBen(null)}
            beneficiary={selectedBen}
          />
        </>
      )}
    </div>
  );
};

export default CSEAdminDashboard;
