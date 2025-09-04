import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/components/AuthProvider";

export const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user } = useAuth();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center animate-fade-up" style={{animationDelay: '0.1s'}}>
            <span className="font-monument text-xl font-bold text-brand">Seatup.co</span>
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
              to="/stadiums" 
              className={`font-medium transition-colors hover:text-primary ${
                isActive('/stadiums') ? 'text-primary' : 'text-foreground'
              }`}
            >
              Stades
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
              <Link to={user ? "/home" : "/auth"}>
                {user ? "Mon compte" : "Se connecter"}
              </Link>
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
                to="/stadiums" 
                className={`font-medium transition-colors hover:text-primary ${
                  isActive('/stadiums') ? 'text-primary' : 'text-foreground'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Stades
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
                <Link to={user ? "/home" : "/auth"} onClick={() => setIsMenuOpen(false)}>
                  {user ? "Mon compte" : "Se connecter"}
                </Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};