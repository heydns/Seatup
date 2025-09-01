import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Tag, ExternalLink, Globe } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [stadiumMapping, setStadiumMapping] = useState<{[key: string]: string}>({});

  useEffect(() => {
    const fetchStadiums = async () => {
      const { data } = await supabase.from('stadiums').select('id, name');
      if (data) {
        const mapping = data.reduce((acc, stadium) => {
          acc[stadium.name] = stadium.id;
          return acc;
        }, {} as {[key: string]: string});
        setStadiumMapping(mapping);
      }
    };
    fetchStadiums();
  }, []);

  const getStadiumLink = (location: string) => {
    // Vérifier si la location correspond à un stade connu
    const stadiumId = stadiumMapping[location];
    if (stadiumId) {
      return `/stadium/${stadiumId}`;
    }
    
    // Vérifications alternatives pour les variations de noms
    const locationLower = location.toLowerCase();
    for (const [stadiumName, id] of Object.entries(stadiumMapping)) {
      if (locationLower.includes(stadiumName.toLowerCase())) {
        return `/stadium/${id}`;
      }
    }
    
    return null;
  };
  
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

  // Get specific image for homepage events
  const getEventImage = () => {
    const eventImages: { [key: number]: string } = {
      11: "/lovable-uploads/147eb088-277c-4032-b6b4-e01dfed524d3.png", // PSG vs SCO Angers
      12: "/lovable-uploads/2837c0cc-2ffb-4656-92c6-96c4f4dfd60f.png", // Paris Basketball
      13: "/lovable-uploads/7809806e-e8e7-44e8-8cb6-4e9157c04ac5.png", // Rolex Paris Master
      14: "/lovable-uploads/56eb70ed-a5f5-4845-b859-1354756c82ff.png", // Hoka Semi Marathon
      15: "/lovable-uploads/498f232f-981f-4bb2-ab0f-d9d08551a8fb.png", // Les Mariannes 92
      16: "/lovable-uploads/585f742a-f198-48d5-aaff-54c375f30f55.png"  // PSG Handball
    };
    
    return eventImages[event.ID_event] || `https://picsum.photos/400/300?random=${event.ID_event}`;
  };

  // Get specific pricing for homepage events
  const getEventPricing = () => {
    const eventPricing: { [key: number]: { originalPrice: number; subsidizedPrice: number } } = {
      11: { originalPrice: 45, subsidizedPrice: 36 },   // PSG vs SCO Angers
      12: { originalPrice: 250, subsidizedPrice: 200 }, // Paris Basketball
      13: { originalPrice: 80, subsidizedPrice: 64 },   // Rolex Paris Master
      14: { originalPrice: 55, subsidizedPrice: 44 },   // Hoka Semi Marathon
      15: { originalPrice: 105, subsidizedPrice: 84 },  // Les Mariannes 92
      16: { originalPrice: 35, subsidizedPrice: 28 }    // PSG Handball
    };
    
    if (eventPricing[event.ID_event]) {
      return eventPricing[event.ID_event];
    }
    
    // Mock pricing for other events
    const originalPrice = Math.floor(Math.random() * 80) + 20;
    const subsidyRate = 0.3 + Math.random() * 0.2;
    const subsidizedPrice = Math.floor(originalPrice * (1 - subsidyRate));
    
    return { originalPrice, subsidizedPrice };
  };

  const { originalPrice, subsidizedPrice } = getEventPricing();

  return (
    <div className="card-sport group hover:scale-[1.02] transition-all duration-300">
      {/* Event image with click navigation */}
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg mb-4 cursor-pointer" onClick={() => navigate(`/event/${event.ID_event}`)}>
        <img 
          src={getEventImage()} 
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
          <p className="text-sm text-muted-foreground hover:text-primary transition-colors cursor-pointer">
            <Link to={`/organizer/${encodeURIComponent(event.Organization)}`}>
              {event.Organization}
            </Link>
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
              {getStadiumLink(event.Location) ? (
                <Link 
                  to={getStadiumLink(event.Location)!} 
                  className="hover:text-primary transition-colors cursor-pointer"
                >
                  {event.Location}
                </Link>
              ) : (
                <span>{event.Location}</span>
              )}
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