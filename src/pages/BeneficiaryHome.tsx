import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Heart, 
  ShoppingCart, 
  Wallet, 
  Calendar, 
  MapPin, 
  Euro,
  Settings,
  LogOut,
  Star,
  Trophy,
  User,
  Ticket,
  ArrowRight
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import marvinAvatar from '@/assets/marvin-avatar.jpg';

const BeneficiaryHome = () => {
  const { userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Mock data
  const userInfo = {
    avatar: userProfile?.avatar_url || marvinAvatar,
    firstName: userProfile?.first_name || '',
    lastName: userProfile?.last_name || '',
    reviewsCount: 12,
    favoritesCount: 8,
    purchasesCount: 25
  };

  const walletData = {
    totalBudget: 500,
    remainingBudget: 340,
    usedBudget: 160
  };

  const favoriteEvents = [
    {
      id: 1,
      title: 'PSG vs OM - Classique',
      date: '2024-03-15',
      location: 'Parc des Princes',
      originalPrice: 85,
      subsidizedPrice: 65,
      image: '/lovable-uploads/147eb088-277c-4032-b6b4-e01dfed524d3.png'
    },
    {
      id: 2,
      title: 'Roland Garros - Finale',
      date: '2024-06-02',
      location: 'Court Philippe Chatrier',
      originalPrice: 120,
      subsidizedPrice: 80,
      image: '/lovable-uploads/7809806e-e8e7-44e8-8cb6-4e9157c04ac5.png'
    },
    {
      id: 3,
      title: 'Paris Basketball vs Monaco',
      date: '2024-04-20',
      location: 'Adidas Arena',
      originalPrice: 45,
      subsidizedPrice: 32,
      image: '/lovable-uploads/2837c0cc-2ffb-4656-92c6-96c4f4dfd60f.png'
    }
  ];

  const favoriteClubs = [
    {
      id: 1,
      name: 'Paris Saint-Germain',
      logo: '/src/assets/clubs/psg-logo.png',
      latestNews: [
        {
          title: 'Victoire 3-1 contre Lyon',
          date: '2024-03-10',
          type: 'match'
        },
        {
          title: 'Nouveau maillot extérieur dévoilé',
          date: '2024-03-08',
          type: 'news'
        }
      ]
    },
    {
      id: 2,
      name: 'Paris Basketball',
      logo: null,
      latestNews: [
        {
          title: 'Qualification en playoffs',
          date: '2024-03-12',
          type: 'match'
        },
        {
          title: 'Nouveau partenariat annoncé',
          date: '2024-03-09',
          type: 'news'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container mx-auto px-4 py-8 pt-28 space-y-8">
        {/* Mes Informations + Wallet */}
        <section>
          <div className="max-w-7xl rounded-3xl shadow-lg border border-border/30 p-8 mx-auto bg-white/95 backdrop-blur-sm">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Mes Informations */}
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-monument text-brand mb-4">
                  Mes Informations
                </h2>
                <div className="card-sport">
                  <div className="flex items-center gap-4 mb-6">
                    <Avatar className="h-20 w-20 border-4 border-primary/20">
                      <AvatarImage src={userInfo.avatar} />
                      <AvatarFallback className="bg-gradient-primary text-white text-xl">
                        {userInfo.firstName.charAt(0)}{userInfo.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="text-xl font-monument font-semibold">
                        {userInfo.firstName} {userInfo.lastName}
                      </h3>
                      <p className="text-muted-foreground">{userProfile?.email}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-primary/10 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <Star className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-brand">{userInfo.reviewsCount}</div>
                      <p className="text-sm text-muted-foreground">Avis</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-primary/10 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <Heart className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-brand">{userInfo.favoritesCount}</div>
                      <p className="text-sm text-muted-foreground">Favoris</p>
                    </div>
                    <div className="text-center p-4 bg-gradient-primary/10 rounded-lg">
                      <div className="w-12 h-12 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-2">
                        <Ticket className="h-6 w-6 text-white" />
                      </div>
                      <div className="text-2xl font-bold text-brand">{userInfo.purchasesCount}</div>
                      <p className="text-sm text-muted-foreground">Achats</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Wallet */}
              <div className="space-y-6">
                <h2 className="text-xl md:text-2xl font-monument text-brand mb-4">
                  Mon Wallet
                </h2>
                <div className="card-sport">
                  <div className="mb-6">
                    <div className="balance-badge inline-flex items-center gap-2 mb-4">
                      <Wallet className="h-5 w-5" />
                      <span>Budget disponible</span>
                    </div>
                    <div className="text-4xl font-monument font-bold text-brand mb-2">
                      {walletData.remainingBudget}€
                    </div>
                    <p className="text-muted-foreground">
                      sur {walletData.totalBudget}€ alloués
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                      <span>Budget total</span>
                      <span className="font-semibold">{walletData.totalBudget}€</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Déjà utilisé</span>
                      <span className="font-semibold text-secondary">{walletData.usedBudget}€</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-3">
                      <div 
                        className="bg-gradient-primary h-3 rounded-full transition-all duration-500" 
                        style={{ width: `${(walletData.usedBudget / walletData.totalBudget) * 100}%` }}
                      ></div>
                    </div>
                    <p className="text-xs text-muted-foreground text-center">
                      {Math.round((walletData.usedBudget / walletData.totalBudget) * 100)}% utilisé
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Mes Événements */}
        <section>
          <div className="max-w-7xl rounded-3xl shadow-lg border border-border/30 p-8 mx-auto bg-white/95 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-monument text-brand mb-2">
                Mes Événements Favoris
              </h2>
              <p className="text-muted-foreground">
                Vos événements sauvegardés avec tarifs préférentiels
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoriteEvents.map((event, index) => (
                <div key={event.id} className="card-event animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={event.image} 
                      alt={event.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="font-monument font-semibold mb-2 line-clamp-2">
                      {event.title}
                    </h3>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(event.date).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      {event.location}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm line-through text-muted-foreground">
                          {event.originalPrice}€
                        </span>
                        <span className="font-bold text-brand">
                          {event.subsidizedPrice}€
                        </span>
                      </div>
                      <Button size="sm" className="hover-scale">
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        Ajouter
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/events">
                <Button variant="sport" size="lg" className="group">
                  Voir tous les événements
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Mes Clubs */}
        <section>
          <div className="max-w-7xl rounded-3xl shadow-lg border border-border/30 p-8 mx-auto bg-white/95 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-monument text-brand mb-2">
                Mes Clubs
              </h2>
              <p className="text-muted-foreground">
                Actualités de vos organisateurs favoris
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {favoriteClubs.map((club, index) => (
                <div key={club.id} className="card-sport animate-fade-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} className="w-12 h-12 object-contain" />
                      ) : (
                        <Trophy className="h-8 w-8 text-white" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-monument font-semibold">{club.name}</h3>
                      <Badge variant="secondary" className="mt-1">Club favori</Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
                      Dernières actualités
                    </h4>
                    {club.latestNews.map((news, newsIndex) => (
                      <div key={newsIndex} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                        <div className={`w-2 h-2 rounded-full mt-2 ${news.type === 'match' ? 'bg-success' : 'bg-primary'}`} />
                        <div className="flex-1">
                          <p className="font-medium text-sm">{news.title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(news.date).toLocaleDateString('fr-FR')}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/organizers">
                <Button variant="sport" size="lg" className="group">
                  Découvrir plus de clubs
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BeneficiaryHome;