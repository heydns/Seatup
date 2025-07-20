import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Mail, Lock, User, Building } from "lucide-react";
import { Link } from "react-router-dom";

export const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock authentication - in real app this would use Supabase auth
    setTimeout(() => {
      setIsLoading(false);
      // Redirect to events page on success
      window.location.href = "/events";
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Link to="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" />
          Retour à l'accueil
        </Link>

        <Card className="card-sport">
          <CardHeader className="text-center">
            <div className="text-3xl font-monument font-bold text-brand mb-4">
              seatup
            </div>
            <CardTitle className="text-2xl font-monument">
              {isLogin ? "Connexion" : "Inscription"}
            </CardTitle>
            <CardDescription>
              {isLogin 
                ? "Connectez-vous à votre compte employé" 
                : "Créez votre compte pour accéder aux événements"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="sr-only">Prénom</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="firstName"
                          type="text"
                          placeholder="Prénom"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          className="search-input pl-10"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label htmlFor="lastName" className="sr-only">Nom</label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Nom"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          className="search-input pl-10"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="company" className="sr-only">Entreprise</label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        id="company"
                        type="text"
                        placeholder="Nom de votre entreprise"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        className="search-input pl-10"
                        required
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="sr-only">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Adresse email professionnelle"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="search-input pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="sr-only">Mot de passe</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mot de passe"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="search-input pl-10"
                    required
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                variant="hero" 
                size="lg" 
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isLogin ? "Connexion..." : "Inscription..."}
                  </div>
                ) : (
                  isLogin ? "Se connecter" : "S'inscrire"
                )}
              </Button>

              {isLogin && (
                <div className="text-center">
                  <button
                    type="button"
                    className="text-sm text-primary hover:text-primary/80 transition-colors"
                  >
                    Mot de passe oublié ?
                  </button>
                </div>
              )}
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                {isLogin ? "Pas encore de compte ?" : "Déjà un compte ?"}
              </p>
              <Button
                variant="link"
                onClick={() => setIsLogin(!isLogin)}
                className="text-primary font-monument"
              >
                {isLogin ? "S'inscrire" : "Se connecter"}
              </Button>
            </div>

            {!isLogin && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-xs text-muted-foreground text-center">
                  En vous inscrivant, vous acceptez nos conditions d'utilisation 
                  et notre politique de confidentialité.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};