import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * ForgotPassword.tsx — Étape 1 du flow reset password
 * ─────────────────────────────────────────────────────────────────────────
 * L'utilisateur saisit son email → Supabase envoie un email avec un lien
 * de reset qui redirige vers /reset-password?type=recovery&access_token=...
 *
 * Sécurité : message générique renvoyé même si l'email n'existe pas,
 * pour ne pas révéler l'existence d'un compte.
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim()) {
      setEmailError('Veuillez saisir votre email');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Format d\'email invalide');
      return;
    }
    setEmailError('');

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        console.error('Reset password error:', error);
        // Message générique quoi qu'il arrive (sécurité : ne pas révéler l'existence du compte)
        setSubmitted(true);
      } else {
        setSubmitted(true);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setSubmitted(true);
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
          onClick={() => navigate('/auth')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la connexion
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          {!submitted ? (
            <>
              <CardHeader className="text-center space-y-2">
                <CardTitle className="text-2xl font-monument text-brand">
                  Mot de passe oublié
                </CardTitle>
                <CardDescription>
                  Saisissez votre email pour recevoir un lien de réinitialisation.
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
                    />
                    {emailError && (
                      <p className="text-xs text-destructive" role="alert">
                        {emailError}
                      </p>
                    )}
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
                        Envoi en cours...
                      </>
                    ) : (
                      'Envoyer le lien'
                    )}
                  </Button>

                  <div className="text-center">
                    <Link to="/auth" className="text-sm text-primary hover:underline">
                      Retour à la connexion
                    </Link>
                  </div>
                </form>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader className="text-center space-y-3">
                <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <MailCheck className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl font-monument text-brand">
                  Vérifiez votre boîte mail
                </CardTitle>
                <CardDescription className="text-base">
                  Un email de réinitialisation a été envoyé <strong>si l'adresse existe dans notre base</strong>.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-5">
                <div className="rounded-xl bg-muted p-4 text-sm space-y-2">
                  <p>📬 <strong>Vérifiez votre boîte mail</strong> ainsi que le dossier spam.</p>
                  <p>⏱️ Le lien est valable <strong>2 heures</strong> et utilisable une seule fois.</p>
                  <p>❌ Après ce délai, il faudra refaire une demande.</p>
                </div>

                <Button
                  variant="sport"
                  size="lg"
                  className="w-full"
                  onClick={() => navigate('/auth')}
                >
                  Retour à la connexion
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Vous n'avez rien reçu après 5 min ?{' '}
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-primary hover:underline font-medium"
                  >
                    Réessayer
                  </button>
                </p>
              </CardContent>
            </>
          )}
        </Card>
      </div>

      <footer className="p-4 text-center text-xs text-muted-foreground">
        © 2026 Seatup — Vivez le sport, simplement.
      </footer>
    </div>
  );
};

export default ForgotPassword;
