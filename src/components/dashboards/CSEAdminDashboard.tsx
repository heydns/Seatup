import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  TrendingUp, 
  Users, 
  Euro, 
  BarChart3,
  Settings,
  LogOut,
  Download,
  Plus,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const CSEAdminDashboard = () => {
  const { userProfile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Mock data - in real app, fetch from Supabase
  const budgetData = {
    totalBudget: 50000,
    consumedBudget: 18500,
    remainingBudget: 31500,
    monthlySpending: 6200
  };

  const beneficiaries = [
    {
      id: 1,
      firstName: 'Marie',
      lastName: 'Dupont',
      email: 'marie.dupont@company.com',
      allocatedBudget: 500,
      consumedBudget: 180,
      status: 'active',
      lastActivity: '2024-02-20'
    },
    {
      id: 2,
      firstName: 'Pierre',
      lastName: 'Martin',
      email: 'pierre.martin@company.com',
      allocatedBudget: 500,
      consumedBudget: 320,
      status: 'active',
      lastActivity: '2024-02-18'
    },
    {
      id: 3,
      firstName: 'Sophie',
      lastName: 'Bernard',
      email: 'sophie.bernard@company.com',
      allocatedBudget: 500,
      consumedBudget: 450,
      status: 'active',
      lastActivity: '2024-02-22'
    }
  ];

  const purchaseReports = [
    {
      id: 1,
      beneficiary: 'Marie Dupont',
      event: 'PSG vs OM',
      date: '2024-02-20',
      originalPrice: 85,
      subsidizedAmount: 20,
      finalPrice: 65
    },
    {
      id: 2,
      beneficiary: 'Pierre Martin',
      event: 'Roland Garros',
      date: '2024-02-18',
      originalPrice: 120,
      subsidizedAmount: 40,
      finalPrice: 80
    }
  ];

  const statistics = {
    totalBeneficiaries: beneficiaries.length,
    activeBeneficiaries: beneficiaries.filter(b => b.status === 'active').length,
    averageSpending: Math.round(beneficiaries.reduce((sum, b) => sum + b.consumedBudget, 0) / beneficiaries.length),
    mostPopularEvents: ['Football', 'Tennis', 'Basketball']
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="animate-fade-up">
            <h1 className="text-2xl md:text-3xl font-monument text-brand mb-2">
              Dashboard CSE - {userProfile?.company_name}
            </h1>
            <p className="text-base text-muted-foreground">
              Gérez vos budgets et vos bénéficiaires
            </p>
          </div>
          <div className="flex items-center gap-4 animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Button variant="sport" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Paramètres
            </Button>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Déconnexion
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <Tabs defaultValue="overview" className="space-y-8 animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <TabsList className="grid w-full grid-cols-4 bg-white/95 backdrop-blur-sm shadow-sm">
            <TabsTrigger value="overview" className="font-medium">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="beneficiaries" className="font-medium">Bénéficiaires</TabsTrigger>
            <TabsTrigger value="reports" className="font-medium">Rapports</TabsTrigger>
            <TabsTrigger value="statistics" className="font-medium">Statistiques</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Budget Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Budget Total</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Euro className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{budgetData.totalBudget.toLocaleString()}€</div>
                  <p className="text-xs text-muted-foreground">Alloué cette année</p>
                </CardContent>
              </Card>

              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Budget Consommé</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{budgetData.consumedBudget.toLocaleString()}€</div>
                  <p className="text-xs text-muted-foreground">
                    {Math.round((budgetData.consumedBudget / budgetData.totalBudget) * 100)}% du budget
                  </p>
                </CardContent>
              </Card>

              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Budget Restant</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Euro className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{budgetData.remainingBudget.toLocaleString()}€</div>
                  <p className="text-xs text-muted-foreground">Disponible</p>
                </CardContent>
              </Card>

              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Bénéficiaires Actifs</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{statistics.activeBeneficiaries}</div>
                  <p className="text-xs text-muted-foreground">
                    sur {statistics.totalBeneficiaries} inscrits
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Budget Usage Chart */}
            <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="text-lg font-monument text-brand">Répartition Budget</CardTitle>
                <CardDescription>
                  Utilisation du budget par période
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span>Budget utilisé</span>
                    <span>{budgetData.consumedBudget.toLocaleString()}€</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-4">
                    <div 
                      className="bg-primary h-4 rounded-full" 
                      style={{ width: `${(budgetData.consumedBudget / budgetData.totalBudget) * 100}%` }}
                    ></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Dépense mensuelle moyenne</p>
                      <p className="font-bold">{budgetData.monthlySpending.toLocaleString()}€</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Projection fin d'année</p>
                      <p className="font-bold">{(budgetData.monthlySpending * 12).toLocaleString()}€</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="text-lg font-monument text-brand">Activité Récente</CardTitle>
                <CardDescription>
                  Derniers achats de vos bénéficiaires
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {purchaseReports.slice(0, 5).map((purchase) => (
                    <div key={purchase.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{purchase.beneficiary}</p>
                        <p className="text-sm text-muted-foreground">{purchase.event}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{purchase.finalPrice}€</p>
                        <p className="text-sm text-green-600">Subvention: {purchase.subsidizedAmount}€</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Beneficiaries Tab */}
          <TabsContent value="beneficiaries" className="space-y-8">
            <Card className="card-sport animate-fade-up">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-monument text-brand">Gestion des Bénéficiaires</CardTitle>
                    <CardDescription>
                      Gérez les comptes de vos salariés
                    </CardDescription>
                  </div>
                  <Button variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter un bénéficiaire
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un bénéficiaire..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="sport">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                  <Button variant="sport">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bénéficiaire</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Budget Alloué</TableHead>
                      <TableHead>Budget Utilisé</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Dernière Activité</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {beneficiaries.map((beneficiary) => (
                      <TableRow key={beneficiary.id}>
                        <TableCell className="font-medium">
                          {beneficiary.firstName} {beneficiary.lastName}
                        </TableCell>
                        <TableCell>{beneficiary.email}</TableCell>
                        <TableCell>{beneficiary.allocatedBudget}€</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span>{beneficiary.consumedBudget}€</span>
                            <span className="text-xs text-muted-foreground">
                              ({Math.round((beneficiary.consumedBudget / beneficiary.allocatedBudget) * 100)}%)
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={beneficiary.status === 'active' ? 'default' : 'secondary'}>
                            {beneficiary.status === 'active' ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(beneficiary.lastActivity).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <Button variant="sport" size="sm">
                            Modifier
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-8">
            <Card className="card-sport animate-fade-up">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-monument text-brand">Rapports d'Achats</CardTitle>
                    <CardDescription>
                      Détail des transactions par bénéficiaire
                    </CardDescription>
                  </div>
                  <Button variant="hero">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter le rapport
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Bénéficiaire</TableHead>
                      <TableHead>Événement</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Prix Original</TableHead>
                      <TableHead>Subvention</TableHead>
                      <TableHead>Prix Final</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {purchaseReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">{report.beneficiary}</TableCell>
                        <TableCell>{report.event}</TableCell>
                        <TableCell>{new Date(report.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{report.originalPrice}€</TableCell>
                        <TableCell className="text-green-600">{report.subsidizedAmount}€</TableCell>
                        <TableCell className="font-bold">{report.finalPrice}€</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="statistics" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-sport animate-fade-up">
                <CardHeader>
                  <CardTitle className="text-lg font-monument text-brand">Statistiques Générales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span>Nombre total de bénéficiaires</span>
                    <span className="font-bold">{statistics.totalBeneficiaries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Bénéficiaires actifs</span>
                    <span className="font-bold">{statistics.activeBeneficiaries}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Dépense moyenne par bénéficiaire</span>
                    <span className="font-bold">{statistics.averageSpending}€</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taux d'utilisation du budget</span>
                    <span className="font-bold">
                      {Math.round((budgetData.consumedBudget / budgetData.totalBudget) * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="text-lg font-monument text-brand">Événements Populaires</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {statistics.mostPopularEvents.map((event, index) => (
                      <div key={event} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-gradient-primary text-white text-xs flex items-center justify-center font-bold">
                            {index + 1}
                          </div>
                          <span className="font-medium">{event}</span>
                        </div>
                        <Badge variant="secondary">{Math.floor(Math.random() * 50) + 10} achats</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Graphiques et Analytics</CardTitle>
                <CardDescription>
                  Visualisation des données de consommation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  <div className="text-center">
                    <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                    <p>Graphiques à implémenter</p>
                    <p className="text-sm">Intégration avec une librairie de charts</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default CSEAdminDashboard;