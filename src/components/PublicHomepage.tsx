import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Map, Ticket, Star, Trophy } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import LogoTicker from "./LogoTicker";
import { AnimatedText } from "./AnimatedText";
import { Footer } from "./Footer";
import { supabase } from "@/integrations/supabase/client";
import { mockEvents } from "@/data/mockData";

// Import images
import psgOmImage from "@/assets/psg-om.jpg";
import parisBasketballImage from "@/assets/paris-basketball.jpg";
import rolandGarrosImage from "@/assets/roland-garros.jpg";
import rugbyMatchImage from "@/assets/rugby-match.jpg";
import volleyballImage from "@/assets/volleyball.jpg";
import handballPsgImage from "@/assets/handball-psg.jpg";

// Import club logos
import psgLogo from "@/assets/clubs/psg-logo.png";
import pfcLogo from "@/assets/clubs/pfc-logo.png";
import versaillesLogo from "@/assets/clubs/versailles-logo.png";
const sports = [{
  name: "Football",
  icon: "⚽"
}, {
  name: "Basketball",
  icon: "🏀"
}, {
  name: "Tennis",
  icon: "🎾"
}, {
  name: "Rugby",
  icon: "🏉"
}, {
  name: "Handball",
  icon: "🤾"
}, {
  name: "Volleyball",
  icon: "🏐"
}];
const clubs = ["PSG", "OM", "OL", "AS Monaco", "LOSC", "Stade Rennais", "RC Strasbourg", "OGC Nice", "Montpellier HSC", "FC Nantes"];
interface FeaturedEvent {
  id: string | number;
  title: string;
  date: string;
  venue: string;
  price: string;
  originalPrice: string;
  image?: string;
}

export const PublicHomepage = () => {
  const navigate = useNavigate();
  const [featuredEvents, setFeaturedEvents] = useState<FeaturedEvent[]>([]);

  // ── Fetch max 5 events pour le carrousel "Offres du moment" ─────────
  useEffect(() => {
    (async () => {
      // Supabase d'abord
      const { data } = await supabase
        .from('events')
        .select('id, title, event_date, location_name, original_price, our_price, image_url')
        .eq('is_published', true)
        .gte('event_date', new Date().toISOString()) // uniquement à venir
        .order('event_date', { ascending: true })
        .limit(5);

      const supaEvents: FeaturedEvent[] = (data ?? []).map((e: any) => ({
        id: e.id,
        title: e.title,
        date: new Date(e.event_date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
        venue: e.location_name,
        price: `À partir de ${e.our_price}€`,
        originalPrice: `${e.original_price}€`,
        image: e.image_url,
      }));

      // Complète avec fixtures si moins de 5
      const fixtures: FeaturedEvent[] = mockEvents.slice(0, 5 - supaEvents.length).map((e) => ({
        id: e.ID_event,
        title: e.Event,
        date: new Date(e.Date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' }),
        venue: e.Location,
        price: `À partir de ${e.Our_Price}`,
        originalPrice: e.Original_Price,
        image: e.imageUrl,
      }));

      setFeaturedEvents([...supaEvents, ...fixtures].slice(0, 5));
    })();
  }, []);

  return <div className="min-h-screen relative bg-white">
      
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        
        
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-monument font-bold mb-6 animate-fade-up">
              <span className="text-brand">Vivez le sport,</span>
              <br />
              <span className="text-brand">
                <AnimatedText words={["simplement.", "localement."]} className="text-brand" interval={3000} />
              </span>
            </h1>
            
            <p className="text-base md:text-lg text-foreground mb-8 font-medium animate-fade-up" style={{
            animationDelay: '0.2s'
          }}>
              La première billetterie 100% sport pensée pour les salariés.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{
            animationDelay: '0.4s'
          }}>
              <Link to="/events">
                <Button variant="hero" size="xl" className="group">
                  Explorer les événements
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/contact">
                <Button variant="sport" size="xl">
                  Nous contacter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Logos Ticker */}
      <LogoTicker />

      {/* Featured Events - Dice.fm Style */}
      <section className="py-[30px] relative z-10">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl rounded-3xl shadow-lg border border-border/30 p-8 px-[20px] py-[20px] mx-auto bg-white/95 backdrop-blur-sm">
            <div className="mb-8">
              <h2 className="text-xl md:text-3xl font-monument mb-2">
                Événements à venir à Paris
              </h2>
              <p className="text-base text-muted-foreground">
                Découvrez les événements sportifs les plus populaires de la capitale
              </p>
            </div>
            
            <Carousel className="w-full max-w-full" opts={{
            align: "start",
            loop: true,
            dragFree: true,
            skipSnaps: false,
            containScroll: "trimSnaps",
            duration: 30
          }} plugins={[Autoplay({
            delay: 5000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
            stopOnFocusIn: true
          })]}>
              {featuredEvents.length === 0 && (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  Aucune offre coup de cœur pour le moment.
                </div>
              )}
              <CarouselContent className="-ml-2 md:-ml-4">
                {featuredEvents.map((event, index) => <CarouselItem key={String(event.id)} className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4">
                    <div className="group cursor-pointer animate-fade-up" style={{
                  animationDelay: `${index * 0.1}s`
                }} onClick={() => navigate(`/event/${event.id}`)}>
                      <div className="relative overflow-hidden rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                        {/* Event image */}
                        <div className="aspect-[4/3] overflow-hidden">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        
                        {/* Event info */}
                        <div className="p-3 md:p-4">
                          <h3 className="font-monument text-sm md:text-base font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2 h-10 md:h-12 leading-tight cursor-pointer">
                            {event.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {event.date}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {event.venue}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-secondary line-through">
                              {event.originalPrice || event.price.replace("À partir de ", "").replace("€", "") + "€"}
                            </p>
                            <p className="text-sm font-medium text-primary">
                              {event.price}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CarouselItem>)}
              </CarouselContent>
            </Carousel>
            
            <div className="text-center mt-8">
              <Link to="/events">
                <Button variant="sport" size="lg" className="group">
                  Voir tous les événements
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Clubs Ticker */}
      

      {/* Value Propositions */}
      <section className="pt-20 pb-20 relative z-10">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-xl md:text-3xl font-monument mb-4">
              Pourquoi choisir Seatup ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              La plateforme qui révolutionne l'accès au sport pour les salariés
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-sport text-center group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Map className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-monument mb-2">
                  Des milliers de billets
                </h3>
                <p className="text-muted-foreground">L'offre sportive la plus complète du marché. Dès événements les plus gros au plus locaux.</p>
              </div>
            </div>

            <div className="card-sport text-center group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Ticket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-monument mb-2">Un Accès simplifié via votre CSE</h3>
                <p className="text-muted-foreground">
                  Réservez en quelques clics grâce à votre compte entreprise. Simple et sécurisé.
                </p>
              </div>
            </div>

            <div className="card-sport text-center group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Star className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-monument mb-2">Des tarifs avantageux</h3>
                <p className="text-muted-foreground">Grâce à des prix remisés et des subventions entreprises, profitez des meilleurs offres. </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="pt-12 pb-20 relative overflow-hidden z-10 bg-white">
        <div className="container mx-auto px-4 text-center relative z-10">
          <h2 className="text-xl md:text-3xl font-monument mb-6">
            Prêt à vivre vos prochaines émotions sportives ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de salariés qui découvrent le sport autrement grâce à Seatup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Link to="/events">
              <Button variant="hero" size="xl" className="group">
                Découvrir les événements
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="sport" size="xl">
                Nous contacter
              </Button>
            </Link>
          </div>
          <img 
            src="/lovable-uploads/bade9f5a-0111-4e27-8a89-601d8a7dc669.png" 
            alt="Cycliste français en action" 
            className="w-[448px] h-auto mx-auto mt-16 rounded-lg shadow-md"
          />
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>;
};
