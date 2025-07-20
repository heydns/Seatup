import { Button } from "@/components/ui/button";
import { ArrowRight, Users, Ticket, Star, Trophy } from "lucide-react";
import { Link } from "react-router-dom";
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
        <div className="vintage-grain absolute inset-0"></div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-monument font-bold mb-6 animate-fade-up">
              <span className="text-brand">Vivez le sport,</span>
              <br />
              <span className="text-brand">simplement.</span>
            </h1>
            
            <p className="text-lg md:text-xl text-muted-foreground mb-8 font-medium animate-fade-up" style={{
            animationDelay: '0.2s'
          }}>
              La première billetterie sportive pensée pour les salariés.
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
              <Link to="/auth">
                <Button variant="sport" size="xl">
                  Se connecter
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Sports Carousel */}
      <section className="py-16 overflow-hidden bg-[#f3f3f3]">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-4xl font-monument text-center mb-12">
            Tous les sports vous attendent
          </h2>
          
          <div className="flex animate-slide-right space-x-8 overflow-x-auto pb-4">
            {sports.map((sport, index) => <div key={sport.name} className="flex-none w-32 h-32 card-sport flex flex-col items-center justify-center group" style={{
            animationDelay: `${index * 0.1}s`
          }}>
                <div className="text-2xl mb-2 group-hover:scale-110 transition-transform">
                  {sport.icon}
                </div>
                <span className="font-monument text-sm text-center">
                  {sport.name}
                </span>
              </div>)}
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
                <h3 className="text-xl font-monument mb-2">
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
                <h3 className="text-xl font-monument mb-2">
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
                <h3 className="text-xl font-monument mb-2">
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
          <h2 className="text-2xl md:text-4xl font-monument mb-6">
            Prêt à vivre vos prochaines émotions sportives ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
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