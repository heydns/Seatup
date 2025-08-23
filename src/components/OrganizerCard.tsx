import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Globe, Calendar, Users, Instagram, Heart } from "lucide-react";
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
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-white rounded-2xl overflow-hidden h-full">
        {/* Header with Logo and Follow Button */}
        <div className="relative p-6 pb-4">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-shrink-0">
              <div className="w-24 h-24 rounded-xl overflow-hidden border border-gray-100 bg-white p-2">
                <img 
                  src={organizer.logo} 
                  alt={organizer.name}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleFollowClick}
                className={`rounded-full p-2 transition-colors ${
                  isFollowing 
                    ? 'text-red-500 hover:text-red-600' 
                    : 'text-gray-400 hover:text-red-500'
                }`}
              >
                <Heart className={`h-5 w-5 ${isFollowing ? 'fill-current' : ''} ${showConfetti ? 'animate-pulse' : ''}`} />
              </Button>
              
              {/* Confetti Animation */}
              {showConfetti && (
                <div className="absolute inset-0 pointer-events-none">
                  {[...Array(8)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute top-1/2 left-1/2 w-1 h-1 bg-red-500 rounded-full animate-confetti"
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

          <div>
            <h3 className="font-monument text-lg mb-2 group-hover:text-primary transition-colors line-clamp-1">
              {organizer.name}
            </h3>
            
            {organizer.stats && (
              <div className="flex gap-4 text-sm text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {organizer.stats.eventsCount}
                </span>
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {organizer.stats.followersCount}
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
              </div>
            )}

            <p className="text-muted-foreground text-sm leading-relaxed line-clamp-2 mb-4">
              {organizer.description}
            </p>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 pb-4 space-y-2">
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
        <div className="px-6 pb-6">
          <div className="flex flex-wrap gap-2">
            <span className="bg-accent/10 text-accent-foreground text-xs px-3 py-1 rounded-full font-semibold">
              {organizer.type}
            </span>
            {organizer.sports && organizer.sports.map((sport) => (
              <span 
                key={sport} 
                className="bg-primary/10 text-primary text-xs px-2 py-1 rounded-full font-medium"
              >
                {sport}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 pb-6">
          <div className="flex gap-2">
            <Button variant="sport" size="sm" className="h-9">
              Voir profil
            </Button>
            <Button 
              variant="hero" 
              size="sm" 
              className="flex-1 h-9"
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