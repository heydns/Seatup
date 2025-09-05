import React, { useState, useEffect } from 'react';
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
  ArrowRight,
  Building2,
  BarChart3,
  Users,
  Clock,
  Briefcase,
  Home
} from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { Header } from '@/components/Header';
import { supabase } from '@/integrations/supabase/client';
import { differenceInDays } from 'date-fns';
import marvinAvatar from '@/assets/marvin-avatar.jpg';
import orusLogo from '@/assets/orus-logo-new.png';
import sophieMartin from '@/assets/team/sophie-martin.jpg';
import thomasBernard from '@/assets/team/thomas-bernard.jpg';
import marieDubois from '@/assets/team/marie-dubois.jpg';

const BeneficiaryHome = () => {
  const { userProfile, signOut } = useAuth();
  const [beneficiaryData, setBeneficiaryData] = useState(null);
  const [companyData, setCompanyData] = useState(null);
  const [fullUserProfile, setFullUserProfile] = useState(null);
  const [favoriteStadium, setFavoriteStadium] = useState(null);
  const [favoriteTeam, setFavoriteTeam] = useState(null);
  const [progressWidth, setProgressWidth] = useState(0);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    const fetchBeneficiaryData = async () => {
      if (!userProfile?.user_id) return;
      
      try {
        // Récupérer le profil complet avec status_badge et les relations stade/équipe
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select(`
            *,
            favorite_stadium:stadiums!profiles_favorite_stadium_id_fkey(id, name),
            favorite_team:teams!profiles_favorite_team_id_fkey(id, name, organizer_name)
          `)
          .eq('user_id', userProfile.user_id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
        } else {
          setFullUserProfile(profile);
          setFavoriteStadium(profile?.favorite_stadium);
          setFavoriteTeam(profile?.favorite_team);
        }

        // Récupérer les données du bénéficiaire
        const { data: beneficiary, error: beneficiaryError } = await supabase
          .from('beneficiaries')
          .select('*')
          .eq('user_id', userProfile.user_id)
          .single();

        if (beneficiaryError) {
          console.error('Error fetching beneficiary:', beneficiaryError);
          return;
        }

        setBeneficiaryData(beneficiary);

        // Récupérer les données de l'entreprise CSE
        if (beneficiary?.cse_company_id) {
          const { data: company, error: companyError } = await supabase
            .from('cse_companies')
            .select('*')
            .eq('id', beneficiary.cse_company_id)
            .single();

          if (companyError) {
            console.error('Error fetching company:', companyError);
            return;
          }

          setCompanyData(company);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchBeneficiaryData();
  }, [userProfile]);

  // Animation de la barre de progression
  useEffect(() => {
    const timer = setTimeout(() => {
      const targetWidth = (walletData.usedBudget / walletData.totalBudget) * 100;
      setProgressWidth(targetWidth);
      
      // Déclencher les paillettes après l'animation de la barre 
      const sparkleTimer = setTimeout(() => {
        setShowSparkles(true);
        // Cacher les paillettes après 4 secondes
        setTimeout(() => setShowSparkles(false), 4000);
      }, 8500); // 8.5s pour laisser la barre se remplir très lentement
      
      return () => clearTimeout(sparkleTimer);
    }, 800); // Délai initial de 800ms

    return () => clearTimeout(timer);
  }, []);

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast.error('Erreur lors de la déconnexion');
    }
  };

  // Calculate days remaining until December 31, 2025
  const endDate = new Date(2025, 11, 31); // December 31, 2025
  const today = new Date();
  const daysRemaining = differenceInDays(endDate, today);

  // Mock data
  const userInfo = {
    avatar: userProfile?.avatar_url?.includes('/src/assets/marvin-avatar.jpg') ? marvinAvatar : (userProfile?.avatar_url || marvinAvatar),
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
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-monument font-semibold">
                          {userInfo.firstName} {userInfo.lastName}
                        </h3>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="bg-gradient-primary/10 text-brand border-primary/20">
                            {fullUserProfile?.status_badge || 'Fans 🏟️'}
                          </Badge>
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200 font-semibold">
                            4200 pts
                          </Badge>
                        </div>
                      </div>
                      <p className="text-muted-foreground mb-3">{userProfile?.email}</p>
                      
                      {/* Mon entreprise */}
                      <div className="flex items-center gap-1 text-muted-foreground mb-3">
                        <Building2 className="h-4 w-4" />
                        <span>Entreprise:</span>
                        <span className="font-medium text-foreground">{companyData?.name || 'Orus'}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Informations détaillées */}
                  <div className="space-y-4 pt-4 border-t border-border/20">
                    {(fullUserProfile?.city || fullUserProfile?.postal_code) && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        🏙️ <span>Ma ville:</span>
                        <span className="font-medium text-foreground">
                          {fullUserProfile?.city} {fullUserProfile?.postal_code}
                        </span>
                      </div>
                    )}
                    
                    {favoriteStadium && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        🏟️ <span>Mon stade:</span>
                        <Link 
                          to={`/stadium/${favoriteStadium.id}`}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {favoriteStadium.name}
                        </Link>
                      </div>
                    )}
                    
                    {favoriteTeam && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        ⚽ <span>Mon équipe:</span>
                        <Link 
                          to={`/organizer/${favoriteTeam.organizer_name}`}
                          className="font-medium text-foreground hover:text-primary hover:underline"
                        >
                          {favoriteTeam.organizer_name}
                        </Link>
                      </div>
                    )}
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
                      <span>Subvention disponible</span>
                    </div>
                    <div className="text-4xl font-monument font-bold text-brand mb-2">
                      {walletData.remainingBudget}€
                    </div>
                    <p className="text-muted-foreground mb-3">
                      sur {walletData.totalBudget}€ alloués
                    </p>
                    
                    {/* Date information */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/30 rounded-lg p-3">
                      <Clock className="h-4 w-4" />
                      <span>
                        Jusqu'au 31 Décembre 2025
                        <span className="ml-2 font-semibold text-foreground">
                          ({daysRemaining} jours restants)
                        </span>
                      </span>
                    </div>
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
                    <div className="relative w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div 
                        className="bg-gradient-primary h-3 rounded-full transition-all duration-[8000ms] ease-in-out relative" 
                        style={{ width: `${progressWidth}%` }}
                      >
                        {/* Paillettes */}
                        {showSparkles && (
                          <div className="absolute -top-2 -right-2 w-full h-8 overflow-visible">
                            {[...Array(16)].map((_, i) => (
                              <div
                                key={i}
                                className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-sparkle-long opacity-0 shadow-lg"
                                style={{
                                  top: `${Math.random() * 150}%`,
                                  right: `${Math.random() * 30}%`,
                                  animationDelay: `${i * 0.2}s`,
                                  transform: `rotate(${Math.random() * 360}deg)`,
                                }}
                              />
                            ))}
                            {/* Paillettes plus grosses */}
                            {[...Array(8)].map((_, i) => (
                              <div
                                key={`big-${i}`}
                                className="absolute w-3 h-3 bg-gradient-to-r from-yellow-300 to-yellow-500 rounded-full animate-sparkle-big opacity-0 shadow-xl"
                                style={{
                                  top: `${Math.random() * 200}%`,
                                  right: `${Math.random() * 25}%`,
                                  animationDelay: `${i * 0.3}s`,
                                }}
                              />
                            ))}
                          </div>
                        )}
                      </div>
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

        {/* Mon Équipe */}
        <section>
          <div className="max-w-7xl rounded-3xl shadow-lg border border-border/30 p-8 mx-auto bg-white/95 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-monument text-brand mb-2">
                  <Users className="inline-block mr-3 h-6 w-6" />
                  Mon Équipe
                </h2>
                <p className="text-muted-foreground">
                  Vos connexions sur Seatup
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link to="/team">
                  <Button variant="sport" size="lg" className="group">
                    Voir mon équipe
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                
                <Link to="/groups">
                  <Button variant="outline" size="lg" className="group">
                    <Users className="mr-2 h-4 w-4" />
                    Groupes
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats d'équipe */}
              <div className="card-sport">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-monument font-bold text-brand mb-2">
                    15
                  </div>
                  <p className="text-muted-foreground mb-4">Membres dans votre équipe</p>
                  <div className="flex justify-center gap-2 text-sm">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      💼 5 Collègues
                    </Badge>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      🤝 5 Amis
                    </Badge>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                      👨‍👩‍👧‍👦 5 Famille
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Aperçu des membres récents */}
              <div className="card-sport">
                <div className="p-6">
                  <h3 className="font-monument font-semibold mb-4">Nouveaux membres</h3>
                  <div className="space-y-3">
                    {[
                      { name: 'Sophie Martin', badge: 'Ultra 🌟', city: 'Paris', avatar: sophieMartin },
                      { name: 'Thomas Bernard', badge: 'Fans 🏟️', city: 'Lyon', avatar: thomasBernard },
                      { name: 'Marie Dubois', badge: 'Débutant 🎯', city: 'Marseille', avatar: marieDubois }
                    ].map((member, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback className="bg-gradient-primary text-white text-sm">
                            {member.name.split(' ').map(n => n.charAt(0)).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{member.name}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {member.badge}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{member.city}</span>
                          </div>
                        </div>
                      </div>
                    ))}
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

        {/* Mes Stats */}
        <section>
          <div className="max-w-7xl rounded-3xl shadow-lg border border-border/30 p-8 mx-auto bg-white/95 backdrop-blur-sm">
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-monument text-brand mb-2">
                <BarChart3 className="inline-block mr-3 h-6 w-6" />
                Mes Stats
              </h2>
              <p className="text-muted-foreground">
                Votre activité sur Seatup
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="card-sport animate-fade-up">
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-monument font-bold text-brand mb-2">
                    {userInfo.reviewsCount}
                  </div>
                  <p className="text-muted-foreground">Avis donnés</p>
                </div>
              </div>

              <div className="card-sport animate-fade-up" style={{ animationDelay: '0.1s' }}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-monument font-bold text-brand mb-2">
                    {userInfo.favoritesCount}
                  </div>
                  <p className="text-muted-foreground">Événements favoris</p>
                </div>
              </div>

              <div className="card-sport animate-fade-up" style={{ animationDelay: '0.2s' }}>
                <div className="text-center p-6">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <Ticket className="h-8 w-8 text-white" />
                  </div>
                  <div className="text-3xl font-monument font-bold text-brand mb-2">
                    {userInfo.purchasesCount}
                  </div>
                  <p className="text-muted-foreground">Billets achetés</p>
                </div>
              </div>
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