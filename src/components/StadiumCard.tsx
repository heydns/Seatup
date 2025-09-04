import { MapPin, Users, Calendar, ExternalLink, Phone, Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState } from "react";
import { getStadiumImageUrl } from "@/lib/stadium-images";

interface Stadium {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  capacity?: number | null;
  type?: string | null;
  opened_year?: number | null;
  description?: string | null;
  image_url?: string | null;
  coordinates?: any;
  amenities?: string[] | null;
  contact_info?: any;
}

interface StadiumCardProps {
  stadium: Stadium;
}

export const StadiumCard = ({ stadium }: StadiumCardProps) => {
  const [imageError, setImageError] = useState(false);
  const imageUrl = getStadiumImageUrl(stadium.image_url, stadium.type, stadium.name);
  
  return (
    <div className="card-sport group hover:scale-[1.02] transition-all duration-300">
      {/* Stadium image with click navigation */}
      <div className="aspect-[4/3] overflow-hidden rounded-t-lg mb-4 cursor-pointer">
        <Link to={`/stadium/${stadium.id}`}>
          {!imageError ? (
            <img 
              src={imageUrl} 
              alt={stadium.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => {
                console.warn(`Image failed to load for ${stadium.name}:`, imageUrl);
                setImageError(true);
              }}
              onLoad={() => {
                console.log(`Image loaded successfully for ${stadium.name}:`, imageUrl);
              }}
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="h-12 w-12 text-primary/40 mx-auto mb-2" />
                <p className="text-xs text-primary/60 font-medium">{stadium.name}</p>
              </div>
            </div>
          )}
        </Link>
      </div>
      
      {/* Stadium info */}
      <div className="space-y-3">
        {/* Type badge */}
        {stadium.type && (
          <span className="inline-block bg-primary text-white px-2 py-1 rounded text-xs font-medium">
            {stadium.type}
          </span>
        )}
        
        {/* Stadium title with click navigation */}
        <h3 className="text-lg font-monument font-semibold line-clamp-2 group-hover:text-primary transition-colors cursor-pointer">
          <Link to={`/stadium/${stadium.id}`}>
            {stadium.name}
          </Link>
        </h3>
        
        {/* City and Capacity */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="h-4 w-4" />
            <span>{stadium.city}</span>
          </div>
          {stadium.capacity && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>{stadium.capacity.toLocaleString()} places</span>
            </div>
          )}
          {stadium.opened_year && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>Inauguré en {stadium.opened_year}</span>
            </div>
          )}
        </div>
        
        {/* Description */}
        {stadium.description && (
          <p className="text-sm text-muted-foreground line-clamp-2">
            {stadium.description}
          </p>
        )}
        
        {/* Amenities */}
        {stadium.amenities && stadium.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1 pb-2">
            {stadium.amenities.slice(0, 3).map((amenity) => (
              <Badge key={amenity} variant="outline" className="text-xs border-primary/30 text-primary">
                {amenity}
              </Badge>
            ))}
            {stadium.amenities.length > 3 && (
              <Badge variant="outline" className="text-xs border-secondary/30 text-secondary">
                +{stadium.amenities.length - 3}
              </Badge>
            )}
          </div>
        )}
        
        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <Button variant="hero" size="sm" className="flex-1" asChild>
            <Link to={`/stadium/${stadium.id}`}>
              Voir les détails
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};