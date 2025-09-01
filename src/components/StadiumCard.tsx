import { MapPin, Users, Calendar, ExternalLink, Phone, Globe } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

interface Stadium {
  id: string;
  name: string;
  city: string;
  address?: string | null;
  capacity?: number | null;
  surface_type?: string | null;
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
  return (
    <Card className="h-full hover:shadow-lg transition-all duration-300 group overflow-hidden">
      <div className="relative h-48 overflow-hidden">
        {stadium.image_url ? (
            <img 
              src={stadium.image_url === '/lovable-uploads/2a65224f-97c7-457b-a5e7-697fb6fb61f3.png' ? 
                '/lovable-uploads/2a65224f-97c7-457b-a5e7-697fb6fb61f3.png' : 
                stadium.image_url} 
              alt={stadium.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg";
              }}
            />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <MapPin className="h-16 w-16 text-primary/40" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 text-white">
          <h3 className="text-xl font-bold mb-1">{stadium.name}</h3>
          <div className="flex items-center gap-1 text-sm">
            <MapPin className="h-4 w-4" />
            <span>{stadium.city}</span>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
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
          {stadium.surface_type && (
            <Badge variant="default" className="text-xs bg-primary text-primary-foreground">
              {stadium.surface_type === 'grass' ? 'Pelouse naturelle' : 
               stadium.surface_type === 'artificial' ? 'Pelouse synthétique' : 
               stadium.surface_type === 'hybrid' ? 'Pelouse hybride' : 
               stadium.surface_type}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {stadium.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {stadium.description}
          </p>
        )}

        {stadium.amenities && stadium.amenities.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Équipements</h4>
            <div className="flex flex-wrap gap-1">
              {stadium.amenities.slice(0, 4).map((amenity) => (
                <Badge key={amenity} variant="outline" className="text-xs border-primary/30 text-primary hover:bg-primary hover:text-primary-foreground">
                  {amenity}
                </Badge>
              ))}
              {stadium.amenities.length > 4 && (
                <Badge variant="outline" className="text-xs border-secondary/30 text-secondary hover:bg-secondary hover:text-secondary-foreground">
                  +{stadium.amenities.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        <div className="pt-2">
          <Button asChild className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
            <Link to={`/stadium/${stadium.id}`}>
              <ExternalLink className="h-4 w-4 mr-2" />
              Voir les détails
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};