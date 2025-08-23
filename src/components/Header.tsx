import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 animate-fade-up" style={{animationDelay: '0.1s'}}>
            <div className="w-8 h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="font-monument text-xl font-bold text-brand">Seatup</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8 animate-fade-up" style={{animationDelay: '0.2s'}}>
            <Link 
              to="/events" 
              className={`font-medium transition-colors hover:text-primary ${
                isActive('/events') ? 'text-primary' : 'text-foreground'
              }`}
            >
              Événements
            </Link>
            <Link 
              to="/organizers" 
              className={`font-medium transition-colors hover:text-primary ${
                isActive('/organizers') ? 'text-primary' : 'text-foreground'
              }`}
            >
              Organisateurs
            </Link>
            <Link 
              to="/contact" 
              className={`font-medium transition-colors hover:text-primary ${
                isActive('/contact') ? 'text-primary' : 'text-foreground'
              }`}
            >
              Contact
            </Link>
            <Button variant="hero" asChild>
              <Link to="/auth">Se connecter</Link>
            </Button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 hover:bg-muted rounded-lg transition-colors animate-fade-up"
            style={{animationDelay: '0.3s'}}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-border animate-fade-in">
            <nav className="flex flex-col gap-4">
              <Link 
                to="/events" 
                className={`font-medium transition-colors hover:text-primary ${
                  isActive('/events') ? 'text-primary' : 'text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Événements
              </Link>
              <Link 
                to="/organizers" 
                className={`font-medium transition-colors hover:text-primary ${
                  isActive('/organizers') ? 'text-primary' : 'text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Organisateurs
              </Link>
              <Link 
                to="/contact" 
                className={`font-medium transition-colors hover:text-primary ${
                  isActive('/contact') ? 'text-primary' : 'text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Contact
              </Link>
              <Button variant="hero" asChild className="w-fit">
                <Link to="/auth" onClick={() => setIsMenuOpen(false)}>Se connecter</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};