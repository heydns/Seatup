import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Tag, ExternalLink, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface Event {
  ID_event: number;
  Event: string;
  Date: string;
  Organization: string;
  Sport: string;
  Competition: string;
  Location: string;
  Adress: string;
  Access: string;
  Link: string;
}

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const navigate = useNavigate();
  
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date à confirmer";
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const getRandomPrice = () => {
    // Mock pricing - in real app this would come from the event data
    return Math.floor(Math.random() * 80) + 20;
  };

  const getSubsidizedPrice = (price: number) => {
    // Mock 30-50% subsidy
    const subsidyRate = 0.3 + Math.random() * 0.2;
    return Math.floor(price * (1 - subsidyRate));
  };

  const originalPrice = getRandomPrice();
  const subsidizedPrice = getSubsidizedPrice(originalPrice);

  return (
    <div className="card-sport group hover:scale-[1.02] transition-all duration-300">
      {/* Event image with click navigation */}
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg mb-4 cursor-pointer" onClick={() => navigate(`/event/${event.ID_event}`)}>
        <img 
          src={`https://picsum.photos/400/300?random=${event.ID_event}`} 
          alt={event.Event} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
        />
      </div>
      
      {/* Event info */}
      <div className="space-y-3">
        {/* Competition badge */}
        {event.Competition && (
          <span className="inline-block bg-primary text-white px-2 py-1 rounded text-xs font-medium">
            {event.Competition}
          </span>
        )}
        
        {/* Event title with click navigation */}
        <h3 
          className="text-lg font-monument font-semibold line-clamp-2 group-hover:text-primary transition-colors cursor-pointer" 
          onClick={() => navigate(`/event/${event.ID_event}`)}
        >
          {event.Event}
        </h3>
        
        {/* Organization */}
        {event.Organization && (
          <p className="text-sm text-muted-foreground">
            {event.Organization}
          </p>
        )}
        
        {/* Date and Location */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.Date)}</span>
          </div>
          {event.Location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.Location}</span>
            </div>
          )}
        </div>
        
        {/* Sport */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-primary">{event.Sport}</span>
        </div>
        
        {/* Pricing */}
        <div className="flex items-center justify-between pt-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-primary">
                {subsidizedPrice}€
              </span>
              <span className="text-sm text-muted-foreground line-through">
                {originalPrice}€
              </span>
            </div>
            <p className="text-xs text-green-600">
              Économisez {originalPrice - subsidizedPrice}€
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="hero" size="sm" className="flex-1">
            Réserver
          </Button>
          {event.Link && (
            <Button variant="sport" size="sm" asChild>
              <a href={event.Link} target="_blank" rel="noopener noreferrer">
                <Globe className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};