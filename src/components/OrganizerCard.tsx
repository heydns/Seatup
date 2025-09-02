import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Calendar, Instagram, Heart, Star, Tag } from "lucide-react";
import { Link } from "react-router-dom";
import { useState } from "react";

interface OrganizerCardProps {
  organizer: {
    name: string;
    description: string;
    logo: string;
    website?: string;
    location?: string;
    founded?: string;
    type: string;
    sports?: string[];
    instagram?: string;
    rating?: number;
    stats?: {
      eventsCount: number;
      followersCount: string;
    };
  };
}

export const OrganizerCard = ({ organizer }: OrganizerCardProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const wasFollowing = isFollowing;
    setIsFollowing(!isFollowing);
    
    // Trigger confetti animation when following (not unfollowing)
    if (!wasFollowing) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 600);
    }
  };

  return (
    <Link to={`/organizer/${encodeURIComponent(organizer.name)}`}>
      <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden">
        {/* Header avec Logo */}
        <div className="relative h-48 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center">
            <div className="w-24 h-24 rounded-xl overflow-hidden bg-white border border-gray-100 shadow-sm">
              <img 
                src={organizer.logo} 
                alt={organizer.name}
                className="w-full h-full object-contain p-2"
              />
            </div>
          </div>
          
          {/* Follow Button */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleFollowClick}
              className={`rounded-full p-2 transition-colors bg-white/90 backdrop-blur-sm ${
                isFollowing 
                  ? 'text-primary hover:text-primary/80' 
                  : 'text-gray-400 hover:text-primary'
              }`}
            >
              <Heart className={`h-4 w-4 ${isFollowing ? 'fill-current' : ''} ${showConfetti ? 'animate-pulse' : ''}`} />
            </Button>
            
            {/* Confetti Animation */}
            {showConfetti && (
              <div className="absolute inset-0 pointer-events-none">
                {[...Array(8)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-1/2 left-1/2 w-1 h-1 bg-primary rounded-full animate-confetti"
                    style={{
                      '--angle': `${(i * 45)}deg`,
                      animationDelay: `${i * 50}ms`
                    } as React.CSSProperties}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg group-hover:text-primary transition-colors line-clamp-1">
            {organizer.name}
          </CardTitle>
          
          {organizer.stats && (
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {organizer.stats.eventsCount}
              </span>
              {organizer.instagram && (
                <a
                  href={organizer.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 hover:text-primary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Instagram className="h-3 w-3" />
                  {organizer.stats.followersCount}
                </a>
              )}
              {organizer.rating && (
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-400 fill-current" />
                  {organizer.rating.toFixed(1)}
                </span>
              )}
            </div>
          )}
        </CardHeader>

        <CardContent className="space-y-4 flex-1">
          <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">
            {organizer.description}
          </p>

          {/* Details */}
          <div className="space-y-2">
            {organizer.location && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="line-clamp-1">{organizer.location}</span>
              </div>
            )}
            
            {organizer.founded && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 text-primary flex-shrink-0" />
                <span>Fondé en {organizer.founded}</span>
              </div>
            )}
            
            {organizer.website && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Globe className="h-4 w-4 text-primary flex-shrink-0" />
                <span className="line-clamp-1">Site officiel</span>
              </div>
            )}
          </div>

          {/* Sports & Type Tags */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="text-xs">
              {organizer.type}
            </Badge>
            {organizer.sports && organizer.sports.slice(0, 2).map((sport) => (
              <Badge 
                key={sport} 
                variant="outline"
                className="text-xs border-primary/30 text-primary"
              >
                {sport}
              </Badge>
            ))}
            {organizer.sports && organizer.sports.length > 2 && (
              <Badge variant="outline" className="text-xs">
                +{organizer.sports.length - 2}
              </Badge>
            )}
          </div>
        </CardContent>

        {/* Action Buttons */}
        <div className="p-6 pt-0">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1">
              Voir profil
            </Button>
            <Button 
              variant="default" 
              size="sm" 
              className="flex-1"
              onClick={handleFollowClick}
            >
              {isFollowing ? 'Abonné' : 'S\'abonner'}
            </Button>
          </div>
        </div>
      </Card>
    </Link>
  );
};