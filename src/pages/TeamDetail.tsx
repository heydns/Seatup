import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, MapPin, Calendar, Users, Trophy, Instagram, Twitter, Youtube, Twitch, Star, Crown } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";

interface Team {
  id: string;
  name: string;
  organizer_name: string;
  category: string;
  description: string;
  logo_url?: string;
  colors?: {
    primary: string;
    secondary: string;
  };
  founded?: number;
  stadium?: string;
  coach?: string;
  captain?: string;
  league?: string;
  achievements?: string[];
  stats?: {
    wins: number;
    losses: number;
    titles: number;
    players_count: number;
  };
  social_media?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    twitch?: string;
  };
}

export const TeamDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTeam = async () => {
      if (!id) return;

      try {
        const { data, error } = await supabase
          .from('teams')
          .select('*')
          .eq('id', id)
          .single();

        if (error) {
          console.error('Error fetching team:', error);
          setTeam(null);
        } else {
          // Map the Supabase data to our Team interface
          const mappedTeam: Team = {
            ...data,
            colors: data.colors as { primary: string; secondary: string } | undefined,
            stats: data.stats as { wins: number; losses: number; titles: number; players_count: number } | undefined,
            social_media: data.social_media as { instagram?: string; twitter?: string; youtube?: string; twitch?: string } | undefined
          };
          setTeam(mappedTeam);
        }
      } catch (error) {
        console.error('Error fetching team:', error);
        setTeam(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeam();
  }, [id]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'équipe...</p>
          </div>
        </div>
      </>
    );
  }

  if (!team) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-monument mb-4">Équipe non trouvée</h1>
            <p className="text-muted-foreground mb-4">
              Aucune équipe trouvée avec cet identifiant.
            </p>
            <Link to="/organizers">
              <Button variant="sport">Retour aux organisateurs</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const headerStyle = team.colors ? {
    background: `linear-gradient(135deg, ${team.colors.primary}15, ${team.colors.secondary}05)`
  } : {};

  const primaryColor = team.colors?.primary || '#007bff';

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Link to={`/organizer/${encodeURIComponent(team.organizer_name)}`}>
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour à {team.organizer_name}
              </Button>
            </Link>
          </div>

          {/* Team Header */}
          <Card className="p-8 mb-8 shadow-sm" style={headerStyle}>
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-100 bg-white p-4">
                  <img 
                    src={team.logo_url || "/lovable-uploads/placeholder.png"} 
                    alt={team.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-3xl font-monument">{team.name}</h1>
                      <div 
                        className="text-xs px-3 py-1 rounded-full font-semibold border"
                        style={{
                          backgroundColor: `${primaryColor}20`,
                          color: primaryColor,
                          borderColor: `${primaryColor}40`
                        }}
                      >
                        {team.category}
                      </div>
                    </div>
                    
                    {team.stats && (
                      <div className="flex gap-6 text-sm text-muted-foreground mb-2">
                        <span className="flex items-center gap-1">
                          <Trophy className="h-4 w-4" />
                          {team.stats.titles} titres
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {team.stats.players_count} joueurs
                        </span>
                        <span className="flex items-center gap-1 text-green-600">
                          <Star className="h-4 w-4" />
                          {team.stats.wins} victoires
                        </span>
                      </div>
                    )}
                    
                    <p className="text-muted-foreground text-sm">
                      Organisateur: <Link to={`/organizer/${encodeURIComponent(team.organizer_name)}`} className="text-primary hover:underline">{team.organizer_name}</Link>
                    </p>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button variant="hero" size="sm">
                      Suivre
                    </Button>
                    <Button variant="sport" size="sm">
                      Billets
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {team.description}
                </p>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {team.league && (
                    <div className="flex items-center gap-2 text-sm">
                      <Trophy className="h-4 w-4 text-primary" />
                      <span>{team.league}</span>
                    </div>
                  )}
                  {team.stadium && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{team.stadium}</span>
                    </div>
                  )}
                  {team.founded && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Fondée en {team.founded}</span>
                    </div>
                  )}
                  {team.coach && (
                    <div className="flex items-center gap-2 text-sm">
                      <Users className="h-4 w-4 text-primary" />
                      <span>Entraîneur: {team.coach}</span>
                    </div>
                  )}
                  {team.captain && (
                    <div className="flex items-center gap-2 text-sm">
                      <Crown className="h-4 w-4 text-primary" />
                      <span>Capitaine: {team.captain}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </Card>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Statistics */}
            {team.stats && (
              <Card className="p-6">
                <h2 className="text-xl font-monument mb-4">Statistiques</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{team.stats.wins}</div>
                    <div className="text-sm text-muted-foreground">Victoires</div>
                  </div>
                  <div className="text-center p-4 bg-red-50 rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{team.stats.losses}</div>
                    <div className="text-sm text-muted-foreground">Défaites</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-600">{team.stats.titles}</div>
                    <div className="text-sm text-muted-foreground">Titres</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{team.stats.players_count}</div>
                    <div className="text-sm text-muted-foreground">Joueurs</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Achievements & Social Media */}
            <Card className="p-6">
              <h2 className="text-xl font-monument mb-4">Palmarès & Réseaux</h2>
              
              {team.achievements && team.achievements.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">PALMARÈS</h3>
                  <div className="flex flex-wrap gap-2">
                    {team.achievements.map((achievement, index) => (
                      <span 
                        key={index} 
                        className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full font-medium"
                      >
                        {achievement}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {team.social_media && (
                <div>
                  <h3 className="text-sm font-semibold mb-3 text-muted-foreground">RÉSEAUX SOCIAUX</h3>
                  <div className="flex gap-4">
                    {team.social_media.instagram && (
                      <a
                        href={team.social_media.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Instagram className="h-5 w-5" />
                        <span className="text-sm">Instagram</span>
                      </a>
                    )}
                    {team.social_media.twitter && (
                      <a
                        href={team.social_media.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Twitter className="h-5 w-5" />
                        <span className="text-sm">Twitter</span>
                      </a>
                    )}
                    {team.social_media.youtube && (
                      <a
                        href={team.social_media.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Youtube className="h-5 w-5" />
                        <span className="text-sm">YouTube</span>
                      </a>
                    )}
                    {team.social_media.twitch && (
                      <a
                        href={team.social_media.twitch}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Twitch className="h-5 w-5" />
                        <span className="text-sm">Twitch</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};