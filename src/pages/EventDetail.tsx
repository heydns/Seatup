import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, MapPin, Users, Globe, Share2, Heart, Ticket } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/Header";

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
  Original_Price?: string;
  Our_Price?: string;
}

export const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchEvent();
  }, [id]);

  const fetchEvent = async () => {
    if (!id) return;
    
    try {
      console.log('Fetching event with ID:', id);
      const { data, error } = await supabase
        .from('Event')
        .select('*')
        .eq('ID_event', parseInt(id))
        .maybeSingle();

      console.log('Supabase response:', { data, error });
      if (error) throw error;
      
      if (!data) {
        console.log('No event found with ID:', id);
        setEvent(null);
        return;
      }
      
      console.log('Event loaded successfully:', data);
      setEvent(data);
    } catch (error) {
      console.error('Error fetching event:', error);
      setEvent(null);
    } finally {
      setIsLoading(false);
    }
  };

  const getEventImage = (eventId: number) => {
    const imageMap: { [key: number]: string } = {
      11: "/lovable-uploads/147eb088-277c-4032-b6b4-e01dfed524d3.png", // PSG vs SCO Angers
      12: "/lovable-uploads/2837c0cc-2ffb-4656-92c6-96c4f4dfd60f.png", // Paris Basketball
      13: "/lovable-uploads/7809806e-e8e7-44e8-8cb6-4e9157c04ac5.png", // Rolex Paris Master
      14: "/lovable-uploads/56eb70ed-a5f5-4845-b859-1354756c82ff.png", // Hoka Semi Marathon
      15: "/lovable-uploads/498f232f-981f-4bb2-ab0f-d9d08551a8fb.png", // Les Mariannes 92
      16: "/lovable-uploads/585f742a-f198-48d5-aaff-54c375f30f55.png"  // PSG Handball
    };
    return imageMap[eventId] || `https://picsum.photos/800/450?random=${eventId}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getRandomPrice = () => Math.floor(Math.random() * 100) + 20;
  const getSubsidizedPrice = (price: number) => Math.floor(price * (0.7 + Math.random() * 0.2));

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Chargement de l'événement...</p>
          </div>
        </div>
      </>
    );
  }

  if (!event) {
    return (
      <>
        <Header />
        <div className="min-h-screen pt-24 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-monument mb-4">Événement non trouvé</h1>
            <Link to="/events">
              <Button variant="sport">Retour aux événements</Button>
            </Link>
          </div>
        </div>
      </>
    );
  }

  const originalPrice = event.Original_Price ? parseInt(event.Original_Price) : getRandomPrice();
  const subsidizedPrice = event.Our_Price ? parseInt(event.Our_Price) : getSubsidizedPrice(originalPrice);
  const eventImage = getEventImage(event.ID_event);

  const getAboutText = () => {
    if (event.ID_event === 12) {
      return "Vivez une saison exceptionnelle avec Paris Basketball ! Cet abonnement vous donne accès à tous les matchs de l'équipe dans la prestigieuse Adidas Arena. Découvrez le basketball français au plus haut niveau avec une équipe ambitieuse qui fait vibrer la capitale. Une expérience unique dans l'une des plus belles salles d'Europe.";
    }
    if (event.Sport === 'Football' && event.Competition === 'Ligue 1') {
      return "Vivez l'intensité de la Ligue 1 dans l'un des stades les plus emblématiques de France. Une expérience unique pour tous les passionnés de football.";
    }
    if (event.Sport === 'Basketball') {
      return "Découvrez le basketball français au plus haut niveau. Une ambiance électrique garantie pour vivre des moments inoubliables.";
    }
    if (event.Sport === 'Tennis') {
      return "Le tennis de haut niveau vous attend dans ce tournoi d'exception. Assistez aux plus beaux échanges dans un cadre prestigieux.";
    }
    if (event.Sport === 'Course à pied') {
      return "Participez ou soutenez cette course emblématique qui traverse la capitale. Une expérience sportive unique dans un cadre exceptionnel.";
    }
    return `Découvrez le ${event.Sport.toLowerCase()} dans toute sa splendeur lors de cet événement exceptionnel. Une occasion unique de vivre des émotions fortes.`;
  };

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-12 bg-white">
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

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Event Image */}
              <div className="relative mb-8">
                <div className="aspect-[16/9] overflow-hidden rounded-xl">
                  <img 
                    src={eventImage} 
                    alt={event.Event} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <button
                  onClick={() => setIsFavorite(!isFavorite)}
                  className="absolute top-4 right-4 w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white shadow-lg transition-colors"
                >
                  <Heart 
                    className={`h-5 w-5 ${isFavorite ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} 
                  />
                </button>
              </div>

              {/* Event Info */}
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                      {event.Sport}
                    </span>
                    {event.Competition && (
                      <span className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full text-sm">
                        {event.Competition}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-4xl font-monument mb-4">
                    {event.Event}
                  </h1>
                  {event.Organization && (
                    <p className="text-lg text-muted-foreground">
                      Organisé par {event.Organization}
                    </p>
                  )}
                </div>

                {/* Event Details */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Date et heure</h3>
                        <p className="text-muted-foreground">{formatDate(event.Date)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Lieu</h3>
                        <p className="text-muted-foreground">{event.Location}</p>
                        {event.Adress && (
                          <p className="text-sm text-muted-foreground">{event.Adress}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-primary mt-1" />
                      <div>
                        <h3 className="font-semibold">Accès</h3>
                        <p className="text-muted-foreground">{event.Access}</p>
                      </div>
                    </div>

                    {event.Link && (
                      <div className="flex items-start gap-3">
                        <Globe className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <h3 className="font-semibold">Site officiel</h3>
                          <a 
                            href={event.Link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:underline"
                          >
                            Voir le site officiel
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* About Section */}
                <div className="border-t pt-6">
                  <h2 className="text-xl font-monument mb-4">À propos</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {getAboutText()}
                  </p>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                {/* Pricing Card */}
                <div className="card-sport">
                  <div className="text-center mb-6">
                    <div className="text-3xl font-bold text-primary mb-2">
                      À partir de {subsidizedPrice}€
                    </div>
                    <div className="text-lg text-muted-foreground line-through">
                      {originalPrice}€
                    </div>
                    <div className="text-sm text-green-600 font-medium">
                      Économisez {originalPrice - subsidizedPrice}€ grâce à votre CSE
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Button variant="hero" size="lg" className="w-full gap-2">
                      <Ticket className="h-5 w-5" />
                      Réserver maintenant
                    </Button>
                    <Button variant="sport" size="lg" className="w-full gap-2">
                      <Share2 className="h-4 w-4" />
                      Partager
                    </Button>
                  </div>

                  <div className="mt-6 pt-6 border-t border-border text-sm text-muted-foreground">
                    <p className="mb-2">✅ Prix final, pas de frais cachés</p>
                    <p className="mb-2">✅ Annulation gratuite sous 24h</p>
                    <p>✅ Billets sécurisés via votre CSE</p>
                  </div>
                </div>

                {/* Refund Policy */}
                <div className="card-sport">
                  <h3 className="font-monument mb-3">Politique de remboursement</h3>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Remboursement possible dans les 24h après l'achat</p>
                    <p>• Remboursement intégral si l'événement est annulé</p>
                    <p>• Pas de remboursement 24h avant l'événement</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};