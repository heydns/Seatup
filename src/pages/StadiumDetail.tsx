import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MapPin, Users, Calendar, Building, Phone, Globe, Mail, Navigation } from "lucide-react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EventCard } from "@/components/EventCard";
import { TeamCard } from "@/components/TeamCard";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
  stadium_id?: string | null;
}

interface Team {
  id: string;
  name: string;
  organizer_name: string;
  category: string;
  description: string;
  logo_url?: string | null;
  colors?: {
    primary: string;
    secondary: string;
  } | null;
  founded?: number | null;
  stadium?: string | null;
  coach?: string | null;
  captain?: string | null;
  league?: string | null;
  achievements?: string[] | null;
  stats?: {
    wins: number;
    losses: number;
    titles: number;
    players_count: number;
  } | null;
  social_media?: {
    instagram?: string;
    twitter?: string;
    youtube?: string;
    twitch?: string;
  } | null;
  stadium_id?: string | null;
}

export const StadiumDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [stadium, setStadium] = useState<Stadium | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (id) {
      console.log('Fetching stadium data for ID:', id);
      fetchStadiumData();
    }
  }, [id]);

  const fetchStadiumData = async () => {
    if (!id) return;

    try {
      // Fetch stadium details
      const { data: stadiumData, error: stadiumError } = await supabase
        .from('stadiums')
        .select('*')
        .eq('id', id)
        .single();

      if (stadiumError) throw stadiumError;
      console.log('Stadium data loaded:', stadiumData);
      setStadium(stadiumData);

      // Fetch events at this stadium
      const { data: eventsData, error: eventsError } = await supabase
        .from('event')
        .select('*')
        .eq('stadium_id', id)
        .order('date', { ascending: true });

      if (eventsError) {
        console.error('Error fetching events:', eventsError);
      } else {
        // Transform event data to match EventCard interface
        const transformedEvents = eventsData?.map(event => ({
          ID_event: event.id_event,
          Event: event.event || '',
          Date: event.date || '',
          Organization: event.organization || '',
          Sport: event.sport || '',
          Competition: event.competition || '',
          Location: event.location || '',
          Adress: event.adress || '',
          Access: event.access || '',
          Link: event.link || '',
        })) || [];
        setEvents(transformedEvents);
      }

      // Fetch teams that play at this stadium
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .eq('stadium_id', id);

      if (teamsError) {
        console.error('Error fetching teams:', teamsError);
      } else {
        // Transform team data to match TeamCard interface
        const transformedTeams = teamsData?.map(team => ({
          id: team.id,
          name: team.name,
          organizer_name: team.organizer_name,
          category: team.category,
          description: team.description || '',
          logo_url: team.logo_url,
          colors: team.colors as { primary: string; secondary: string } | null,
          founded: team.founded,
          stadium: team.stadium,
          coach: team.coach,
          captain: team.captain,
          league: team.league,
          achievements: team.achievements,
          stats: team.stats as { wins: number; losses: number; titles: number; players_count: number } | null,
          social_media: team.social_media as { instagram?: string; twitter?: string; youtube?: string; twitch?: string } | null,
          stadium_id: team.stadium_id,
        })) || [];
        setTeams(transformedTeams);
      }

    } catch (error) {
      console.error('Error fetching stadium data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les informations du stade",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="space-y-8">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-64 w-full rounded-lg" />
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-48 w-full" />
              </div>
              <div className="space-y-6">
                <Skeleton className="h-64 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!stadium) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold mb-4">Stade non trouvé</h1>
            <p className="text-muted-foreground mb-8">
              Le stade que vous recherchez n'existe pas ou a été supprimé.
            </p>
            <Button asChild>
              <Link to="/stadiums">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour aux stades
              </Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/stadiums">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour aux stades
          </Link>
        </Button>

        {/* Hero Section */}
        <div className="relative mb-8 rounded-xl overflow-hidden">
          {stadium.image_url ? (
            <div className="h-64 md:h-96 relative">
              <img
                src={`${stadium.image_url}?v=${Date.now()}`}
                alt={stadium.name}
                className="w-full h-full object-cover"
                onLoad={() => console.log('Image loaded successfully:', stadium.image_url)}
                onError={(e) => {
                  console.error('Image failed to load:', stadium.image_url);
                  e.currentTarget.src = "/placeholder.svg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              <div className="absolute bottom-8 left-8 text-white">
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{stadium.name}</h1>
                <div className="flex items-center gap-2 text-lg">
                  <MapPin className="h-5 w-5" />
                  <span>{stadium.city}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-64 md:h-96 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              <div className="text-center">
                <Building className="h-16 w-16 text-primary/40 mx-auto mb-4" />
                <h1 className="text-4xl md:text-5xl font-bold mb-2">{stadium.name}</h1>
                <div className="flex items-center gap-2 text-lg justify-center">
                  <MapPin className="h-5 w-5" />
                  <span>{stadium.city}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {stadium.description && (
              <Card>
                <CardHeader>
                  <CardTitle>À propos</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed">
                    {stadium.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Events */}
            {events.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Événements à venir</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {events.slice(0, 6).map((event) => (
                      <EventCard key={event.ID_event} event={event} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Teams */}
            {teams.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Équipes résidentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {teams.map((team) => (
                      <TeamCard key={team.id} team={team} />
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stadium Info */}
            <Card>
              <CardHeader>
                <CardTitle>Informations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {stadium.capacity && (
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Capacité</p>
                      <p className="text-sm text-muted-foreground">
                        {stadium.capacity.toLocaleString()} places
                      </p>
                    </div>
                  </div>
                )}

                {stadium.opened_year && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Inauguré</p>
                      <p className="text-sm text-muted-foreground">{stadium.opened_year}</p>
                    </div>
                  </div>
                )}

                {stadium.surface_type && (
                  <div className="flex items-center gap-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Surface</p>
                      <Badge variant="secondary">
                        {stadium.surface_type === 'grass' ? 'Pelouse naturelle' : 
                         stadium.surface_type === 'artificial' ? 'Pelouse synthétique' : 
                         stadium.surface_type === 'hybrid' ? 'Pelouse hybride' : 
                         stadium.surface_type}
                      </Badge>
                    </div>
                  </div>
                )}

                {stadium.address && (
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Adresse</p>
                      <p className="text-sm text-muted-foreground">{stadium.address}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Amenities */}
            {stadium.amenities && stadium.amenities.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Équipements</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {stadium.amenities.map((amenity) => (
                      <Badge key={amenity} variant="outline">
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Contact */}
            {stadium.contact_info && (
              <Card>
                <CardHeader>
                  <CardTitle>Contact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {stadium.contact_info.phone && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`tel:${stadium.contact_info.phone}`}>
                        <Phone className="h-4 w-4 mr-2" />
                        {stadium.contact_info.phone}
                      </a>
                    </Button>
                  )}
                  {stadium.contact_info.email && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={`mailto:${stadium.contact_info.email}`}>
                        <Mail className="h-4 w-4 mr-2" />
                        {stadium.contact_info.email}
                      </a>
                    </Button>
                  )}
                  {stadium.contact_info.website && (
                    <Button variant="outline" className="w-full justify-start" asChild>
                      <a href={stadium.contact_info.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="h-4 w-4 mr-2" />
                        Site officiel
                      </a>
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Navigation */}
            {stadium.coordinates && (
              <Card>
                <CardHeader>
                  <CardTitle>Localisation</CardTitle>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" asChild>
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${stadium.coordinates.lat},${stadium.coordinates.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Obtenir l'itinéraire
                    </a>
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};