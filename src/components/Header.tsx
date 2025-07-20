import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, ShoppingBag } from "lucide-react";
interface HeaderProps {
  user?: any;
  balance?: number;
  className?: string;
}
export const Header = ({
  user,
  balance,
  className
}: HeaderProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  return <header className={`sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 ${className}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 bg-[#f8f4ed]/0">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <div className="text-2xl font-monument font-bold text-brand">
              seatup
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {user ? <>
                <Link to="/events" className="text-foreground hover:text-primary transition-colors font-medium">
                  Événements
                </Link>
                <Link to="/my-tickets" className="text-foreground hover:text-primary transition-colors font-medium flex items-center gap-2">
                  <ShoppingBag className="h-4 w-4" />
                  Mes billets
                </Link>
                {balance !== undefined && <div className="balance-badge">
                    Solde: {balance}€
                  </div>}
                <Link to="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-4 w-4" />
                  </Button>
                </Link>
              </> : <>
                <Link to="/events" className="text-foreground hover:text-primary transition-colors font-medium">
                  Découvrir
                </Link>
                <Link to="/auth">
                  <Button variant="sport" size="sm">
                    Se connecter
                  </Button>
                </Link>
                <Button variant="hero" size="sm">
                  Entreprise
                </Button>
              </>}
          </nav>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && <div className="md:hidden py-4 border-t border-border/50 bg-white/95 backdrop-blur-sm">
            <nav className="flex flex-col space-y-4">
              {user ? <>
                  <Link to="/events" className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                    Événements
                  </Link>
                  <Link to="/my-tickets" className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <ShoppingBag className="h-4 w-4" />
                    Mes billets
                  </Link>
                  {balance !== undefined && <div className="balance-badge mx-4 self-start">
                      Solde: {balance}€
                    </div>}
                  <Link to="/profile" className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2 flex items-center gap-2" onClick={() => setIsMobileMenuOpen(false)}>
                    <User className="h-4 w-4" />
                    Mon profil
                  </Link>
                </> : <>
                  <Link to="/events" className="text-foreground hover:text-primary transition-colors font-medium px-4 py-2" onClick={() => setIsMobileMenuOpen(false)}>
                    Découvrir
                  </Link>
                  <div className="px-4 space-y-3">
                    <Link to="/auth" onClick={() => setIsMobileMenuOpen(false)}>
                      <Button variant="sport" size="sm" className="w-full">
                        Se connecter
                      </Button>
                    </Link>
                    <Button variant="hero" size="sm" className="w-full">
                      Entreprise
                    </Button>
                  </div>
                </>}
            </nav>
          </div>}
      </div>
    </header>;
};