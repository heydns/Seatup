import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Heart, 
  ShoppingCart, 
  Wallet, 
  Calendar, 
  MapPin, 
  Euro,
  Settings,
  LogOut,
  Search,
  Filter
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

const BeneficiaryDashboard = () => {
  const { userProfile, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Mock data - in real app, fetch from Supabase
  const favoriteEvents = [
    {
      id: 1,
      title: 'PSG vs OM',
      date: '2024-03-15',
      location: 'Parc des Princes',
      originalPrice: 85,
      subsidizedPrice: 65,
      image: '/api/placeholder/300/200'
    },
    {
      id: 2,
      title: 'Roland Garros',
      date: '2024-06-02',
      location: 'Court Philippe Chatrier',
      originalPrice: 120,
      subsidizedPrice: 80,
      image: '/api/placeholder/300/200'
    }
  ];

  const walletData = {
    totalBudget: 500,
    remainingBudget: 340,
    usedBudget: 160
  };

  const purchaseHistory = [
    {
      id: 1,
      event: 'Handball PSG vs Montpellier',
      date: '2024-02-20',
      amount: 45,
      status: 'completed',
      qrCode: 'QR123456'
    },
    {
      id: 2,
      event: 'Basketball Paris vs Lyon',
      date: '2024-02-10',
      amount: 35,
      status: 'completed',
      qrCode: 'QR789012'
    }
  ];

  const cartItems = [
    {
      id: 1,
      event: 'Tennis - Masters de Paris',
      date: '2024-04-15',
      quantity: 2,
      originalPrice: 90,
      subsidizedPrice: 70
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">
              Bonjour {userProfile?.first_name} !
            </h1>
            <p className="text-muted-foreground">
              Découvrez vos événements et gérez votre budget
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
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

      <div className="container mx-auto px-4 py-6">
        <Tabs defaultValue="home" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="home">Accueil</TabsTrigger>
            <TabsTrigger value="events">Événements</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
            <TabsTrigger value="wallet">Wallet</TabsTrigger>
            <TabsTrigger value="cart">Panier</TabsTrigger>
          </TabsList>

          {/* Home Tab */}
          <TabsContent value="home" className="space-y-6">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Budget Restant</CardTitle>
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{walletData.remainingBudget}€</div>
                  <p className="text-xs text-muted-foreground">
                    sur {walletData.totalBudget}€ alloués
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Événements Favoris</CardTitle>
                  <Heart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{favoriteEvents.length}</div>
                  <p className="text-xs text-muted-foreground">événements sauvegardés</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Panier</CardTitle>
                  <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{cartItems.length}</div>
                  <p className="text-xs text-muted-foreground">événements en attente</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Favorites */}
            <Card>
              <CardHeader>
                <CardTitle>Vos Événements Favoris</CardTitle>
                <CardDescription>
                  Vos événements sauvegardés avec tarifs préférentiels
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {favoriteEvents.map((event) => (
                    <Card key={event.id} className="overflow-hidden">
                      <div className="aspect-video bg-muted"></div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{event.title}</h3>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(event.date).toLocaleDateString('fr-FR')}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          {event.location}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm line-through text-muted-foreground">
                              {event.originalPrice}€
                            </span>
                            <span className="font-bold text-primary">
                              {event.subsidizedPrice}€
                            </span>
                          </div>
                          <Button size="sm">
                            <ShoppingCart className="h-4 w-4 mr-2" />
                            Ajouter
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Catalogue d'Événements</CardTitle>
                <CardDescription>
                  Découvrez tous les événements avec vos tarifs préférentiels
                </CardDescription>
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
                  <Button variant="outline">
                    <Filter className="h-4 w-4 mr-2" />
                    Filtres
                  </Button>
                </div>
                <div className="text-center py-8 text-muted-foreground">
                  Catalogue d'événements à implémenter
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Événements Favoris</CardTitle>
                <CardDescription>
                  Gérez vos événements sauvegardés
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {favoriteEvents.map((event) => (
                    <Card key={event.id}>
                      <div className="aspect-video bg-muted"></div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold">{event.title}</h3>
                        <p className="text-sm text-muted-foreground">{event.location}</p>
                        <div className="flex items-center justify-between mt-3">
                          <Badge variant="secondary">{event.subsidizedPrice}€</Badge>
                          <Button size="sm">Acheter</Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Wallet Tab */}
          <TabsContent value="wallet">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Solde Subvention</CardTitle>
                  <CardDescription>
                    Votre budget CSE disponible
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary mb-2">
                    {walletData.remainingBudget}€
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Budget total</span>
                      <span>{walletData.totalBudget}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Déjà utilisé</span>
                      <span>{walletData.usedBudget}€</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full" 
                        style={{ width: `${(walletData.usedBudget / walletData.totalBudget) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Historique d'Utilisation</CardTitle>
                  <CardDescription>
                    Vos dernières transactions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {purchaseHistory.map((purchase) => (
                      <div key={purchase.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div>
                          <p className="font-medium">{purchase.event}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(purchase.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{purchase.amount}€</p>
                          <Badge 
                            variant={purchase.status === 'completed' ? 'default' : 'secondary'}
                          >
                            {purchase.status === 'completed' ? 'Payé' : 'En attente'}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Cart Tab */}
          <TabsContent value="cart">
            <Card>
              <CardHeader>
                <CardTitle>Mon Panier</CardTitle>
                <CardDescription>
                  Finalisez vos achats d'événements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h3 className="font-semibold">{item.event}</h3>
                        <p className="text-sm text-muted-foreground">{item.date}</p>
                        <p className="text-sm">Quantité: {item.quantity}</p>
                      </div>
                      <div className="text-right">
                        <div className="flex items-center gap-2">
                          <span className="text-sm line-through text-muted-foreground">
                            {item.originalPrice * item.quantity}€
                          </span>
                          <span className="font-bold text-primary">
                            {item.subsidizedPrice * item.quantity}€
                          </span>
                        </div>
                        <p className="text-xs text-green-600">
                          Économie: {(item.originalPrice - item.subsidizedPrice) * item.quantity}€
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-lg font-bold">
                        Total: {cartItems.reduce((sum, item) => sum + (item.subsidizedPrice * item.quantity), 0)}€
                      </p>
                      <p className="text-sm text-green-600">
                        Économie totale: {cartItems.reduce((sum, item) => sum + ((item.originalPrice - item.subsidizedPrice) * item.quantity), 0)}€
                      </p>
                    </div>
                    <Button size="lg">
                      <Euro className="h-4 w-4 mr-2" />
                      Payer maintenant
                    </Button>
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

export default BeneficiaryDashboard;