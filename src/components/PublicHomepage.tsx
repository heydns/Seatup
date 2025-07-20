import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Ticket, Star, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
import { Carousel, CarouselContent, CarouselItem } from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";

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
export const PublicHomepage = () => {
  return <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-10"></div>
        <div className="vintage-grain absolute inset-0 bg-transparent"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-3xl md:text-5xl font-monument font-bold mb-6 animate-fade-up">
              <span className="text-brand">Vivez le sport,</span>
              <br />
              <span className="text-brand">simplement.</span>
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
      <section className="relative overflow-hidden">
        <div className="flex animate-scroll">
          {/* First set of logos */}
          <div className="flex items-center justify-around min-w-full py-6">
            <div className="flex items-center space-x-12 md:space-x-16">
              <img src={psgLogo} alt="PSG" className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0" />
              <img src={pfcLogo} alt="Paris FC" className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0" />
              <div className="h-10 w-10 bg-red-500 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-white font-bold text-sm">RS</span>
              </div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-white font-bold text-sm">PA13</span>
              </div>
              <img src={versaillesLogo} alt="FC Versailles" className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0" />
            </div>
          </div>
          {/* Duplicate set for seamless loop */}
          <div className="flex items-center justify-around min-w-full py-6">
            <div className="flex items-center space-x-12 md:space-x-16">
              <img src={psgLogo} alt="PSG" className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0" />
              <img src={pfcLogo} alt="Paris FC" className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0" />
              <div className="h-10 w-10 bg-red-500 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-white font-bold text-sm">RS</span>
              </div>
              <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center opacity-70 hover:opacity-100 transition-opacity">
                <span className="text-white font-bold text-sm">PA13</span>
              </div>
              <img src={versaillesLogo} alt="FC Versailles" className="h-10 w-auto opacity-70 hover:opacity-100 transition-opacity filter grayscale hover:grayscale-0" />
            </div>
          </div>
        </div>
      </section>

      {/* Featured Events - Dice.fm Style */}
      <section className="py-[30px] bg-transparent">
        <div className="container mx-auto px-4">
          <div className="max-w-5xl bg-card rounded-3xl shadow-lg border border-border/30 p-8 px-[20px] py-[20px] mx-0">
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
            delay: 4000,
            stopOnInteraction: true,
            stopOnMouseEnter: true,
            stopOnFocusIn: true
          })]}>
              <CarouselContent className="-ml-2 md:-ml-4">
                {[{
                title: "PSG vs OM",
                date: "Sam, 26 Jul",
                venue: "Parc des Princes",
                price: "À partir de 45€",
                image: psgOmImage
              }, {
                title: "Paris Basketball",
                date: "Dim, 27 Jul",
                venue: "Accor Arena",
                price: "À partir de 25€",
                image: parisBasketballImage
              }, {
                title: "Open de Tennis",
                date: "Lun, 28 Jul",
                venue: "Roland Garros",
                price: "À partir de 35€",
                image: rolandGarrosImage
              }, {
                title: "Racing 92 vs Stade Français",
                date: "Mar, 29 Jul",
                venue: "U Arena",
                price: "À partir de 20€",
                image: rugbyMatchImage
              }, {
                title: "Volley-Ball Féminin",
                date: "Mer, 30 Jul",
                venue: "Stade Pierre de Coubertin",
                price: "À partir de 15€",
                image: volleyballImage
              }, {
                title: "Handball Paris SG",
                date: "Jeu, 31 Jul",
                venue: "Stade Pierre de Coubertin",
                price: "À partir de 18€",
                image: handballPsgImage
              }].map((event, index) => <CarouselItem key={event.title} className="pl-2 md:pl-4 md:basis-1/3 lg:basis-1/4">
                    <div className="group cursor-pointer animate-fade-up" style={{
                  animationDelay: `${index * 0.1}s`
                }}>
                      <div className="relative overflow-hidden rounded-lg bg-card border border-border shadow-sm hover:shadow-md transition-all duration-300 group-hover:scale-[1.02]">
                        {/* Event image */}
                        <div className="aspect-[4/3] overflow-hidden">
                          <img src={event.image} alt={event.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        </div>
                        
                        {/* Event info */}
                        <div className="p-3 md:p-4">
                          <h3 className="font-monument text-sm md:text-base font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-2">
                            {event.title}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-1">
                            {event.date}
                          </p>
                          <p className="text-sm text-muted-foreground mb-2 line-clamp-1">
                            {event.venue}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            {event.price}
                          </p>
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
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-sport text-center group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-monument mb-2">
                  Des milliers de billets
                </h3>
                <p className="text-muted-foreground">
                  Accédez à une large sélection d'événements sportifs à prix avantageux grâce à votre CSE.
                </p>
              </div>
            </div>

            <div className="card-sport text-center group">
              <div className="mb-6">
                <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                  <Ticket className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-lg font-monument mb-2">
                  Accès facile via votre CSE
                </h3>
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
                <h3 className="text-lg font-monument mb-2">
                  Une sélection pour tous les goûts
                </h3>
                <p className="text-muted-foreground">
                  Du football de Ligue 1 aux sports méconnus, découvrez une offre variée et accessible.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-hero opacity-5"></div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <Trophy className="h-16 w-16 mx-auto mb-6 text-primary" />
          <h2 className="text-xl md:text-3xl font-monument mb-6">
            Prêt à vivre vos prochaines émotions sportives ?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de salariés qui découvrent le sport autrement grâce à Seatup.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/events">
              <Button variant="hero" size="xl" className="group">
                Découvrir les événements
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Button variant="sport" size="xl">
              Contact entreprise
            </Button>
          </div>
        </div>
      </section>
    </div>;
};