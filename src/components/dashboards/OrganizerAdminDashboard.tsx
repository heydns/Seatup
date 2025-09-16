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
  BarChart3,
  Heart,
  MessageSquare,
  Send,
  Instagram,
  Facebook,
  Twitter,
  UserPlus,
  Share2,
  Target
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
            <TabsTrigger value="community" className="font-medium">Communauté</TabsTrigger>
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


          {/* Community Tab */}
          <TabsContent value="community" className="space-y-8">
            {/* Base Clients / Communauté */}
            <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.1s' }}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-monument text-brand">Base Clients & Communauté</CardTitle>
                    <CardDescription>
                      Gérez vos relations clients et votre communauté
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="hero" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      Exporter
                    </Button>
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button variant="sport" size="sm" className="gap-2">
                      <Filter className="h-4 w-4" />
                      Filtrer
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Client</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Achats</TableHead>
                      <TableHead>Total Dépensé</TableHead>
                      <TableHead>Dernier Achat</TableHead>
                      <TableHead>Préférences</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customers.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold">{customer.name}</p>
                              <p className="text-sm text-muted-foreground">{customer.email}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{customer.email}</TableCell>
                        <TableCell className="font-semibold">{customer.totalPurchases}</TableCell>
                        <TableCell className="font-bold">{customer.totalSpent}€</TableCell>
                        <TableCell className="text-muted-foreground">
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
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <MessageSquare className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Community Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Followers</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UserPlus className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">12,450</div>
                  <p className="text-xs text-muted-foreground">+125 cette semaine</p>
                </CardContent>
              </Card>

              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Engagement</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Heart className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">8.7%</div>
                  <p className="text-xs text-muted-foreground">Taux moyen</p>
                </CardContent>
              </Card>

              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.3s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Messages</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MessageSquare className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">247</div>
                  <p className="text-xs text-muted-foreground">En attente</p>
                </CardContent>
              </Card>

              <Card className="card-sport group animate-fade-up" style={{ animationDelay: '0.4s' }}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-brand">Portée</CardTitle>
                  <div className="w-8 h-8 bg-gradient-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="h-4 w-4 text-white" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-monument text-brand">45.2K</div>
                  <p className="text-xs text-muted-foreground">Impressions/semaine</p>
                </CardContent>
              </Card>
            </div>

            {/* Social Media Management */}
            <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.5s' }}>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-lg font-monument text-brand">Gestion des Réseaux Sociaux</CardTitle>
                    <CardDescription>
                      Publiez et gérez vos contenus sur toutes les plateformes
                    </CardDescription>
                  </div>
                  <Button variant="hero" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nouveau Post
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                        <Instagram className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Instagram</p>
                        <p className="text-sm text-muted-foreground">8.2K followers</p>
                      </div>
                    </div>
                    <Button variant="sport" size="sm">Publier</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <Facebook className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Facebook</p>
                        <p className="text-sm text-muted-foreground">12.5K followers</p>
                      </div>
                    </div>
                    <Button variant="sport" size="sm">Publier</Button>
                  </div>

                  <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sky-500 rounded-lg flex items-center justify-center">
                        <Twitter className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">Twitter</p>
                        <p className="text-sm text-muted-foreground">15.3K followers</p>
                      </div>
                    </div>
                    <Button variant="sport" size="sm">Publier</Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Messaging Center */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.6s' }}>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg font-monument text-brand">Centre de Messages</CardTitle>
                      <CardDescription>
                        Répondez aux messages de vos fans
                      </CardDescription>
                    </div>
                    <Button variant="hero" size="sm" className="gap-2">
                      <Send className="h-4 w-4" />
                      Nouveau
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { name: 'Marie Dubois', message: 'Quand sortent les billets pour le prochain match ?', time: '5 min', unread: true },
                    { name: 'Pierre Martin', message: 'Merci pour ce super événement !', time: '1h', unread: false },
                    { name: 'Sophie Laurent', message: 'Y aura-t-il des places VIP disponibles ?', time: '2h', unread: true },
                    { name: 'Lucas Moreau', message: 'Félicitations pour la victoire !', time: '3h', unread: false },
                  ].map((msg, index) => (
                    <div key={index} className={`p-3 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer ${msg.unread ? 'border-primary/50 bg-primary/5' : ''}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="font-semibold text-sm">{msg.name}</p>
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground truncate">{msg.message}</p>
                      {msg.unread && <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="card-sport animate-fade-up" style={{ animationDelay: '0.7s' }}>
                <CardHeader>
                  <CardTitle className="text-lg font-monument text-brand">Campagnes Marketing</CardTitle>
                  <CardDescription>
                    Créez des campagnes ciblées pour vos fans
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button variant="hero" className="w-full justify-start gap-3">
                    <Target className="h-4 w-4" />
                    Créer une Campagne Email
                  </Button>
                  <Button variant="sport" className="w-full justify-start gap-3">
                    <Share2 className="h-4 w-4" />
                    Promotion Réseaux Sociaux
                  </Button>
                  <Button variant="sport" className="w-full justify-start gap-3">
                    <Users className="h-4 w-4" />
                    Segmentation Clients
                  </Button>
                  
                  <div className="mt-6 p-4 bg-gradient-primary/10 rounded-lg border">
                    <h4 className="font-semibold text-brand mb-2">Campagne Active</h4>
                    <p className="text-sm text-muted-foreground mb-2">
                      "Offre Spéciale Match PSG vs OM"
                    </p>
                    <div className="flex justify-between text-xs">
                      <span>Envoyée à 8,450 fans</span>
                      <span className="text-green-600">Taux d'ouverture: 42%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OrganizerAdminDashboard;