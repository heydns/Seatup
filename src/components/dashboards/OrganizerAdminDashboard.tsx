import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Euro,
  Settings,
  LogOut,
  Download,
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  BarChart3
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '@/components/AuthProvider';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const OrganizerAdminDashboard = () => {
  const { userProfile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Mock data - in real app, fetch from Supabase
  const events = [
    {
      id: 1,
      title: 'PSG vs OM',
      date: '2024-03-15',
      venue: 'Parc des Princes',
      status: 'upcoming',
      totalTickets: 500,
      soldTickets: 387,
      revenue: 32450,
      price: 85
    },
    {
      id: 2,
      title: 'Handball PSG vs Montpellier',
      date: '2024-02-20',
      venue: 'Stade Pierre de Coubertin',
      status: 'completed',
      totalTickets: 300,
      soldTickets: 280,
      revenue: 12600,
      price: 45
    },
    {
      id: 3,
      title: 'Tennis - Masters de Paris',
      date: '2024-04-15',
      venue: 'AccorHotels Arena',
      status: 'upcoming',
      totalTickets: 800,
      soldTickets: 156,
      revenue: 14040,
      price: 90
    }
  ];

  const salesData = {
    totalRevenue: events.reduce((sum, event) => sum + event.revenue, 0),
    totalTicketsSold: events.reduce((sum, event) => sum + event.soldTickets, 0),
    averageTicketPrice: Math.round(events.reduce((sum, event) => sum + event.price, 0) / events.length),
    upcomingEvents: events.filter(event => event.status === 'upcoming').length
  };

  const customers = [
    {
      id: 1,
      name: 'Marie Dupont',
      email: 'marie.dupont@company.com',
      totalPurchases: 3,
      totalSpent: 245,
      lastPurchase: '2024-02-20',
      favoriteEvents: ['Football', 'Tennis']
    },
    {
      id: 2,
      name: 'Pierre Martin',
      email: 'pierre.martin@company.com',
      totalPurchases: 5,
      totalSpent: 420,
      lastPurchase: '2024-02-18',
      favoriteEvents: ['Football', 'Basketball']
    },
    {
      id: 3,
      name: 'Sophie Bernard',
      email: 'sophie.bernard@company.com',
      totalPurchases: 2,
      totalSpent: 180,
      lastPurchase: '2024-02-15',
      favoriteEvents: ['Tennis', 'Handball']
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'upcoming':
        return <Badge variant="default">À venir</Badge>;
      case 'ongoing':
        return <Badge variant="secondary">En cours</Badge>;
      case 'completed':
        return <Badge variant="outline">Terminé</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="animate-fade-up">
            <h1 className="text-2xl md:text-3xl font-monument text-brand mb-2">
              Dashboard Organisateur - {userProfile?.company_name}
            </h1>
            <p className="text-base text-muted-foreground">
              Gérez vos événements et analysez vos ventes
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
            <TabsTrigger value="events" className="font-medium">Événements</TabsTrigger>
            <TabsTrigger value="sales" className="font-medium">Ventes</TabsTrigger>
            <TabsTrigger value="customers" className="font-medium">Clients</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Chiffre d'Affaires</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Euro className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{salesData.totalRevenue.toLocaleString()}€</div>
                  <p className="text-xs text-muted-foreground">Total généré</p>
                </CardContent>
              </Card>

              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Billets Vendus</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{salesData.totalTicketsSold}</div>
                  <p className="text-xs text-muted-foreground">Toutes catégories</p>
                </CardContent>
              </Card>

              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Prix Moyen</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <BarChart3 className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{salesData.averageTicketPrice}€</div>
                  <p className="text-xs text-muted-foreground">Par billet</p>
                </CardContent>
              </Card>

              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Événements Actifs</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Calendar className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">{salesData.upcomingEvents}</div>
                  <p className="text-xs text-muted-foreground">À venir</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Events Performance */}
            <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <CardTitle className="text-lg font-monument text-brand">Performance des Événements</CardTitle>
                <CardDescription>
                  Suivi des ventes par événement
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(event.date).toLocaleDateString('fr-FR')} - {event.venue}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          {getStatusBadge(event.status)}
                          <span className="text-sm">
                            {event.soldTickets}/{event.totalTickets} billets vendus
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">{event.revenue.toLocaleString()}€</p>
                        <div className="flex items-center gap-2 mt-1">
                          <div className="w-24 bg-secondary rounded-full h-2">
                            <div 
                              className="bg-primary h-2 rounded-full" 
                              style={{ width: `${(event.soldTickets / event.totalTickets) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {Math.round((event.soldTickets / event.totalTickets) * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Customers */}
            <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.6s' }}>
              <CardHeader>
                <CardTitle className="text-lg font-monument text-brand">Meilleurs Clients</CardTitle>
                <CardDescription>
                  Clients avec le plus d'achats
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {customers.slice(0, 3).map((customer) => (
                    <div key={customer.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div>
                        <p className="font-medium">{customer.name}</p>
                        <p className="text-sm text-muted-foreground">{customer.email}</p>
                        <p className="text-sm">
                          {customer.totalPurchases} achats - Derniers: {customer.favoriteEvents.join(', ')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{customer.totalSpent}€</p>
                        <p className="text-sm text-muted-foreground">Total dépensé</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-8">
            <Card className="card-sport animate-fade-up">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-monument text-brand">Gestion des Événements</CardTitle>
                    <CardDescription>
                      Créez et gérez vos événements sportifs
                    </CardDescription>
                  </div>
                  <Button variant="hero">
                    <Plus className="h-4 w-4 mr-2" />
                    Nouvel événement
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un événement..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="sport">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Événement</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Lieu</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Billets Vendus</TableHead>
                      <TableHead>Revenus</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {events.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell className="font-medium">{event.title}</TableCell>
                        <TableCell>{new Date(event.date).toLocaleDateString('fr-FR')}</TableCell>
                        <TableCell>{event.venue}</TableCell>
                        <TableCell>{getStatusBadge(event.status)}</TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span>{event.soldTickets}/{event.totalTickets}</span>
                            <span className="text-xs text-muted-foreground">
                              {Math.round((event.soldTickets / event.totalTickets) * 100)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="font-bold">{event.revenue.toLocaleString()}€</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="sport" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sales Tab */}
          <TabsContent value="sales" className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="card-sport animate-fade-up">
                <CardHeader>
                  <CardTitle className="text-lg font-monument text-brand">Revenus par Événement</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.map((event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {event.soldTickets} billets vendus
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{event.revenue.toLocaleString()}€</p>
                          <p className="text-sm text-muted-foreground">
                            {Math.round((event.soldTickets / event.totalTickets) * 100)}% complet
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <CardTitle className="text-lg font-monument text-brand">Analyse des Ventes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <span>Revenus totaux</span>
                      <span className="font-bold">{salesData.totalRevenue.toLocaleString()}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Billets vendus</span>
                      <span className="font-bold">{salesData.totalTicketsSold}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Prix moyen par billet</span>
                      <span className="font-bold">{salesData.averageTicketPrice}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taux de remplissage moyen</span>
                      <span className="font-bold">
                        {Math.round(events.reduce((sum, event) => sum + (event.soldTickets / event.totalTickets), 0) / events.length * 100)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.2s' }}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-monument text-brand">Historique des Ventes</CardTitle>
                  <Button variant="hero">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={[
                      { mois: 'Jan', revenus: 12400, billets: 145 },
                      { mois: 'Fév', revenus: 18600, billets: 210 },
                      { mois: 'Mar', revenus: 25300, billets: 298 },
                      { mois: 'Avr', revenus: 31200, billets: 365 },
                      { mois: 'Mai', revenus: 28900, billets: 342 },
                      { mois: 'Jun', revenus: 35400, billets: 420 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                      <XAxis 
                        dataKey="mois" 
                        className="text-xs text-muted-foreground"
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis 
                        className="text-xs text-muted-foreground"
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: 'hsl(var(--card))',
                          border: '1px solid hsl(var(--border))',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                        }}
                        labelStyle={{ color: 'hsl(var(--foreground))' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="revenus" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
                        name="Revenus (€)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="billets" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={2}
                        dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 3 }}
                        strokeDasharray="5 5"
                        name="Billets vendus"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-8">
            <Card className="card-sport animate-fade-up">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-monument text-brand">Base Clients</CardTitle>
                    <CardDescription>
                      Gérez vos relations clients
                    </CardDescription>
                  </div>
                  <Button variant="hero">
                    <Download className="h-4 w-4 mr-2" />
                    Exporter
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher un client..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button variant="sport">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Achats</TableHead>
                      <TableHead>Total Dépensé</TableHead>
                      <TableHead>Dernier Achat</TableHead>
                      <TableHead>Préférences</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.email}</TableCell>
                        <TableCell>{customer.totalPurchases}</TableCell>
                        <TableCell className="font-bold">{customer.totalSpent}€</TableCell>
                        <TableCell>
                          {new Date(customer.lastPurchase).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            {customer.favoriteEvents.map((event) => (
                              <Badge key={event} variant="secondary" className="text-xs">
                                {event}
                              </Badge>
                            ))}
                          </div>
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
  );
};

export default OrganizerAdminDashboard;