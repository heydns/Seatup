import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

/**
 * Auth.tsx — Page de connexion Seatup
 * ─────────────────────────────────────────────────────────────────────────
 * Conforme spec Prio 1 :
 *  - Uniquement login (pas de self-signup, les comptes sont créés par l'admin)
 *  - Champ email + mot de passe (masqué)
 *  - Bouton "Se connecter" avec spinner
 *  - Validation format email + champs non vides
 *  - Messages d'erreur clairs
 *  - Lien "Mot de passe oublié ?"
 *  - Redirection vers /dashboard qui route par rôle
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [emailError, setEmailError] = useState('');

  const { signIn, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate('/dashboard');
  }, [user, navigate]);

  const validate = (): boolean => {
    if (!email.trim()) {
      setEmailError('Veuillez saisir votre email');
      return false;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Format d\'email invalide');
      return false;
    }
    if (!password) {
      toast.error('Veuillez saisir votre mot de passe');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      const { error } = await signIn(email.trim(), password);

      if (error) {
        console.error('Login error:', error);
        // Message unifié pour éviter d'indiquer si l'email existe (sécurité)
        if (
          error.message.includes('Invalid login credentials') ||
          error.message.includes('Email not confirmed')
        ) {
          toast.error('Email ou mot de passe incorrect');
        } else if (error.message.includes('rate limit')) {
          toast.error('Trop de tentatives. Réessayez dans quelques minutes.');
        } else {
          toast.error(`Erreur de connexion : ${error.message}`);
        }
      } else {
        toast.success('Connexion réussie !');
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('Auth error:', err);
      toast.error('Une erreur technique est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            <CardTitle className="text-3xl font-monument text-brand">Connexion</CardTitle>
            <CardDescription className="text-base">
              Accédez à votre espace personnel Seatup
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (emailError) setEmailError('');
                  }}
                  placeholder="votre.email@entreprise.fr"
                  autoComplete="email"
                  required
                  className={emailError ? 'border-destructive' : ''}
                  aria-invalid={!!emailError}
                />
                {emailError && (
                  <p className="text-xs text-destructive" role="alert">
                    {emailError}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Mot de passe</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
                <div className="flex justify-end">
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline font-medium"
                  >
                    Mot de passe oublié ?
                  </Link>
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connexion en cours...
                  </>
                ) : (
                  'Se connecter'
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-xs text-muted-foreground">
              Votre compte est créé par votre administrateur CSE ou votre club.
              Contactez-le si vous n'avez pas reçu votre invitation.
            </p>
          </CardContent>
        </Card>
      </div>

      <footer className="p-4 text-center text-xs text-muted-foreground">
        © 2026 Seatup — Vivez le sport, simplement.
      </footer>
    </div>
  );
};

export default Auth;
