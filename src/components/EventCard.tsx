import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Tag, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

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
    <div className="card-event group">
      {/* Event Image Placeholder */}
      <div className="h-48 bg-gradient-primary flex items-center justify-center text-white text-6xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10">
          {event.Sport === "Football" ? "⚽" : 
           event.Sport === "Basketball" ? "🏀" :
           event.Sport === "Tennis" ? "🎾" :
           event.Sport === "Rugby" ? "🏉" :
           event.Sport === "Handball" ? "🤾" :
           "🏆"}
        </div>
        
        {/* Competition Badge */}
        {event.Competition && (
          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-sm font-spartan font-bold text-foreground">
              {event.Competition}
            </span>
          </div>
        )}
      </div>

      <div className="p-6">
        {/* Event Title */}
        <h3 className="font-spartan font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {event.Event || "Événement sportif"}
        </h3>

        {/* Organization */}
        {event.Organization && (
          <p className="text-muted-foreground text-sm mb-3 font-medium">
            {event.Organization}
          </p>
        )}

        {/* Event Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(event.Date)}</span>
          </div>
          
          {event.Location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.Location}</span>
            </div>
          )}

          {event.Sport && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="h-4 w-4" />
              <span>{event.Sport}</span>
            </div>
          )}
        </div>

        {/* Pricing */}
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground line-through">
              {originalPrice}€
            </span>
            <span className="text-xl font-spartan font-bold text-primary">
              {subsidizedPrice}€
            </span>
            <span className="text-xs bg-success/10 text-success px-2 py-1 rounded-full font-medium">
              -{Math.round(((originalPrice - subsidizedPrice) / originalPrice) * 100)}%
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Prix subventionné par votre CSE
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Link to={`/event/${event.ID_event}`} className="flex-1">
            <Button variant="hero" className="w-full">
              Réserver
            </Button>
          </Link>
          
          {event.Link && (
            <Button variant="sport" size="icon" asChild>
              <a 
                href={event.Link} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Voir plus d'informations"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};