import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MapPin, Globe, Users, Calendar, Mail, Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";
import { EventCard } from "@/components/EventCard";

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

interface Organizer {
  name: string;
  description: string;
  logo: string;
  website?: string;
  email?: string;
  phone?: string;
  location?: string;
  founded?: string;
  stats?: {
    eventsCount: number;
    followersCount: string;
    rating: number;
  };
}

export const OrganizerDetail = () => {
  const { name } = useParams<{ name: string }>();
  const [organizer, setOrganizer] = useState<Organizer | null>(null);
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!name) {
      setIsLoading(false);
      return;
    }

    const decodedName = decodeURIComponent(name);
    
    // Data for organizers
    const organizerData: { [key: string]: Organizer } = {
      "Paris Basketball": {
        name: "Paris Basketball",
        description: "Paris Basketball est un club de basketball professionnel français basé à Paris et évoluant en Jeep Élite, l'élite du basketball français. Fondé en 2018, le club s'est rapidement imposé comme une référence du basketball européen avec des ambitions internationales fortes.",
        logo: "/lovable-uploads/b02cb022-8fbf-4d98-9493-bfd5d0a04866.png",
        website: "https://parisbasketball.com",
        email: "contact@parisbasketball.com",
        location: "Paris, France",
        founded: "2018",
        stats: {
          eventsCount: 25,
          followersCount: "15K",
          rating: 4.8
        }
      },
      "Paris Saint-Germain": {
        name: "Paris Saint-Germain",
        description: "Le Paris Saint-Germain Football Club, couramment appelé Paris Saint-Germain ou PSG, est un club de football français fondé le 12 août 1970. Basé à Paris et Saint-Germain-en-Laye, le club évolue en Ligue 1 et est l'un des clubs les plus titrés de France.",
        logo: "/lovable-uploads/147eb088-277c-4032-b6b4-e01dfed524d3.png",
        website: "https://psg.fr",
        email: "contact@psg.fr",
        location: "Paris, France", 
        founded: "1970",
        stats: {
          eventsCount: 45,
          followersCount: "2.1M",
          rating: 4.9
        }
      },
      "PSG Handball": {
        name: "PSG Handball",
        description: "Le Paris Saint-Germain Handball est la section handball du Paris Saint-Germain. Fondé en 1992, le club évolue en StarLigue, l'élite du handball français, et est l'un des clubs les plus titrés d'Europe avec de nombreux titres nationaux et européens.",
        logo: "/lovable-uploads/c874bbe9-19a8-4e77-b649-aa0455bdc2c5.png",
        website: "https://psghandball.com",
        email: "contact@psghandball.com",
        location: "Paris, France",
        founded: "1992",
        stats: {
          eventsCount: 30,
          followersCount: "125K",
          rating: 4.7
        }
      },
      "Rolex Paris Masters": {
        name: "Rolex Paris Masters",
        description: "Le Rolex Paris Masters est un tournoi de tennis masculin professionnel qui se déroule chaque année à Paris. Faisant partie de la série ATP Masters 1000, c'est l'un des neuf tournois les plus prestigieux du circuit masculin après les tournois du Grand Chelem.",
        logo: "/lovable-uploads/b379a728-71d8-4301-8d46-73d92d4aa0ba.png", 
        website: "https://rolexparismasters.com",
        email: "info@rolexparismasters.com",
        location: "Nanterre, France",
        founded: "1968",
        stats: {
          eventsCount: 12,
          followersCount: "89K",
          rating: 4.8
        }
      },
      "Hoka Running": {
        name: "Hoka Running",
        description: "Hoka est une marque de chaussures de course française fondée en 2009. Elle organise plusieurs événements de course à pied en France, notamment le semi-marathon de Paris, offrant aux coureurs une expérience unique au cœur de la capitale française.",
        logo: "/lovable-uploads/88a89064-a2ce-45ba-b1d0-551b4be719d3.png",
        website: "https://hokaparis.com",
        email: "events@hoka.com",
        location: "Paris, France",
        founded: "2009",
        stats: {
          eventsCount: 8,
          followersCount: "45K",
          rating: 4.6
        }
      },
      "Les Mariannes 92": {
        name: "Les Mariannes 92",
        description: "Les Mariannes 92 est un club de volleyball féminin français basé à Levallois-Perret. Évoluant en Ligue A Féminine, l'élite du volleyball français, le club s'illustre régulièrement en championnat et en compétitions européennes.",
        logo: "/lovable-uploads/778a9033-e16f-49d0-8f4e-7ae11c48b1bb.png",
        website: "https://lesmariannes92.com",
        email: "contact@lesmariannes92.com", 
        location: "Levallois-Perret, France",
        founded: "1986",
        stats: {
          eventsCount: 18,
          followersCount: "12K",
          rating: 4.5
        }
      }
    };

    // Mock events data for each organizer
    const organizerEvents: { [key: string]: Event[] } = {
      "Paris Basketball": [
        {
          ID_event: 12,
          Event: "Paris Basketball - Abonnement 25/26",
          Date: "2025-07-27",
          Organization: "Paris Basketball",
          Sport: "Basketball",
          Competition: "Jeep Élite",
          Location: "Adidas Arena",
          Adress: "Adidas Arena, Paris La Défense",
          Access: "Ticketing",
          Link: "https://parisbasketball.com"
        }
      ],
      "Paris Saint-Germain": [
        {
          ID_event: 11,
          Event: "PSG vs SCO Angers - Journée 1 Ligue 1",
          Date: "2025-08-24",
          Organization: "Paris Saint-Germain",
          Sport: "Football",
          Competition: "Ligue 1", 
          Location: "Parc des Princes",
          Adress: "Parc des Princes, Paris",
          Access: "Ticketing",
          Link: "https://psg.fr"
        }
      ],
      "PSG Handball": [
        {
          ID_event: 16,
          Event: "PSG Handball - Dunkerque / Journée 1 StarLigue",
          Date: "2025-09-07",
          Organization: "PSG Handball",
          Sport: "Handball",
          Competition: "StarLigue",
          Location: "Stade Pierre de Coubertin",
          Adress: "Stade Pierre de Coubertin, Paris",
          Access: "Ticketing",
          Link: "https://psghandball.com"
        }
      ],
      "Rolex Paris Masters": [
        {
          ID_event: 13,
          Event: "Rolex Paris Master 2025",
          Date: "2025-07-28",
          Organization: "Rolex Paris Masters",
          Sport: "Tennis",
          Competition: "ATP Masters 1000",
          Location: "La Défense U Arena",
          Adress: "La Défense U Arena, Nanterre",
          Access: "Ticketing",
          Link: "https://rolexparismasters.com"
        }
      ],
      "Hoka Running": [
        {
          ID_event: 14,
          Event: "Hoka Semi Marathon Paris 2025",
          Date: "2025-07-29",
          Organization: "Hoka Running",
          Sport: "Course à pied",
          Competition: "Semi Marathon",
          Location: "Ville de Paris",
          Adress: "Paris, France",
          Access: "Inscription",
          Link: "https://hokaparis.com"
        }
      ],
      "Les Mariannes 92": [
        {
          ID_event: 15,
          Event: "Les Mariannes 92 - Saison 25/26",
          Date: "2025-07-30",
          Organization: "Les Mariannes 92",
          Sport: "Volleyball",
          Competition: "Ligue A Féminine",
          Location: "Le palais des sports Marcel Cerdan",
          Adress: "Palais des sports Marcel Cerdan, Levallois-Perret",
          Access: "Ticketing",
          Link: "https://lesmariannes92.com"
        }
      ]
    };

    const fetchOrganizerData = async () => {
      try {
        // Set organizer data
        if (organizerData[decodedName]) {
          setOrganizer(organizerData[decodedName]);
          setEvents(organizerEvents[decodedName] || []);
        } else {
          setOrganizer(null);
          setEvents([]);
        }
      } catch (error) {
        console.error('Error fetching organizer data:', error);
        setOrganizer(null);
        setEvents([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizerData();
  }, [name]);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'organisateur...</p>
          </div>
        </div>
      </>
    );
  }

  if (!organizer) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-monument mb-4">Organisateur non trouvé</h1>
            <p className="text-muted-foreground mb-4">
              Aucun organisateur trouvé avec le nom: {name}
            </p>
            <Link to="/events">
              <Button variant="sport">Retour aux événements</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-gray-50">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <div className="mb-6">
            <Link to="/events">
              <Button variant="ghost" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Retour aux événements
              </Button>
            </Link>
          </div>

          {/* Organizer Header */}
          <div className="bg-white rounded-2xl p-8 mb-8 shadow-sm">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Logo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 rounded-xl overflow-hidden border-2 border-gray-100 bg-white p-4">
                  <img 
                    src={organizer.logo} 
                    alt={organizer.name}
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>

              {/* Info */}
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h1 className="text-3xl font-monument mb-2">{organizer.name}</h1>
                    {organizer.stats && (
                      <div className="flex gap-6 text-sm text-muted-foreground">
                        <span>{organizer.stats.eventsCount} événements</span>
                        <span>{organizer.stats.followersCount} abonnés</span>
                        <span>⭐ {organizer.stats.rating}/5</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Button variant="hero" size="sm">
                      S'abonner
                    </Button>
                    <Button variant="sport" size="sm">
                      Contacter
                    </Button>
                  </div>
                </div>

                <p className="text-muted-foreground leading-relaxed mb-6">
                  {organizer.description}
                </p>

                {/* Details Grid */}
                <div className="grid md:grid-cols-2 gap-4">
                  {organizer.location && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{organizer.location}</span>
                    </div>
                  )}
                  {organizer.founded && (
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span>Fondé en {organizer.founded}</span>
                    </div>
                  )}
                  {organizer.website && (
                    <div className="flex items-center gap-2 text-sm">
                      <Globe className="h-4 w-4 text-primary" />
                      <a 
                        href={organizer.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        Site officiel
                      </a>
                    </div>
                  )}
                  {organizer.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-4 w-4 text-primary" />
                      <a 
                        href={`mailto:${organizer.email}`}
                        className="text-primary hover:underline"
                      >
                        {organizer.email}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Events Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-monument">
                Événements ({events.length})
              </h2>
              <div className="flex gap-2">
                <Button variant="sport" size="sm" className="bg-primary text-white">
                  Prochains ({events.length})
                </Button>
                <Button variant="sport" size="sm">
                  Passés (0)
                </Button>
              </div>
            </div>

            {events.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {events.map((event) => (
                  <EventCard key={event.ID_event} event={event} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Aucun événement</h3>
                <p className="text-muted-foreground">
                  Cet organisateur n'a pas d'événements prévus pour le moment.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};