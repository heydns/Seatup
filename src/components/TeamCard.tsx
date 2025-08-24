import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Users, Trophy, Calendar, Instagram, Twitter, Youtube, Twitch } from "lucide-react";
import { Link } from "react-router-dom";

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

interface TeamCardProps {
  team: Team;
}

export const TeamCard = ({ team }: TeamCardProps) => {
  const cardStyle = team.colors ? {
    background: `linear-gradient(135deg, ${team.colors.primary}15, ${team.colors.secondary}05)`
  } : {};

  const categoryBadgeStyle = team.colors ? {
    backgroundColor: `${team.colors.primary}20`,
    color: team.colors.primary,
    borderColor: `${team.colors.primary}40`
  } : {};

  return (
    <Link to={`/team/${team.id}`}>
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white rounded-2xl overflow-hidden h-full" style={cardStyle}>
        {/* Header with Logo and Category */}
        <div className="p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-100 bg-white p-2">
                <img 
                  src={team.logo_url || "/lovable-uploads/placeholder.png"} 
                  alt={team.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div 
              className="text-xs px-3 py-1 rounded-full font-semibold border"
              style={categoryBadgeStyle}
            >
              {team.category}
            </div>
          </div>

          <div>
            <h3 className="font-monument text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {team.name}
            </h3>
            
            {team.stats && (
              <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Trophy className="h-3 w-3" />
                  {team.stats.titles}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {team.stats.players_count}
                </span>
                {team.stats.wins > 0 && (
                  <span className="text-green-600 font-medium">
                    {team.stats.wins}V
                  </span>
                )}
              </div>
            )}

            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
              {team.description}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 pb-4 space-y-2">
          {team.league && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Trophy className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="line-clamp-1">{team.league}</span>
            </div>
          )}
          
          {team.stadium && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
              <span className="line-clamp-1">{team.stadium}</span>
            </div>
          )}
          
          {team.founded && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
              <span>Fondée en {team.founded}</span>
            </div>
          )}
        </div>

        {/* Social Media & Achievements */}
        {(team.social_media || team.achievements) && (
          <div className="px-6 pb-4">
            {team.social_media && (
              <div className="flex gap-2 mb-3">
                {team.social_media.instagram && (
                  <a
                    href={team.social_media.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                )}
                {team.social_media.twitter && (
                  <a
                    href={team.social_media.twitter}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Twitter className="h-4 w-4" />
                  </a>
                )}
                {team.social_media.youtube && (
                  <a
                    href={team.social_media.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Youtube className="h-4 w-4" />
                  </a>
                )}
                {team.social_media.twitch && (
                  <a
                    href={team.social_media.twitch}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Twitch className="h-4 w-4" />
                  </a>
                )}
              </div>
            )}

            {team.achievements && team.achievements.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {team.achievements.slice(0, 2).map((achievement, index) => (
                  <span 
                    key={index} 
                    className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium"
                  >
                    {achievement}
                  </span>
                ))}
                {team.achievements.length > 2 && (
                  <span className="text-xs text-muted-foreground px-2 py-1">
                    +{team.achievements.length - 2}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Button */}
        <div className="px-6 pb-6">
          <Button variant="sport" size="sm" className="w-full h-9">
            Voir l'équipe
          </Button>
        </div>
      </Card>
    </Link>
  );
};