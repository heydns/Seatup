import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, ShieldCheck, ShieldAlert, Check, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * ResetPassword.tsx — Étape 2 du flow reset password
 * ─────────────────────────────────────────────────────────────────────────
 * Arrivée depuis l'email envoyé par ForgotPassword. Supabase déjà logué
 * temporairement l'utilisateur via le magic link. On lui demande son
 * nouveau mot de passe, puis on redirige vers /auth pour re-login propre.
 *
 * Politique mot de passe : min 8 caractères, majuscule, chiffre, spécial.
 */

const ResetPassword = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [linkExpired, setLinkExpired] = useState(false);

  // Vérifie qu'on a bien une session (le magic link est valide)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error || !session) {
        setLinkExpired(true);
      }
    });
  }, []);

  // Règles de sécurité mot de passe
  const rules = [
    { label: 'Au moins 8 caractères', ok: password.length >= 8 },
    { label: 'Une majuscule', ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre', ok: /\d/.test(password) },
    { label: 'Un caractère spécial (!@#$%…)', ok: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/.test(password) },
  ];

  const allRulesOk = rules.every((r) => r.ok);
  const passwordsMatch = password === confirm && confirm.length > 0;
  const canSubmit = allRulesOk && passwordsMatch && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('Update password error:', error);
        toast.error(`Erreur : ${error.message}`);
      } else {
        toast.success('Votre mot de passe a été mis à jour.');
        // Déconnexion pour forcer une reconnexion propre avec le nouveau mdp
        await supabase.auth.signOut();
        setTimeout(() => navigate('/auth'), 1500);
      }
    } catch (err) {
      console.error('Reset password error:', err);
      toast.error('Une erreur technique est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Lien expiré / invalide ─────────────────────────────────────────────
  if (linkExpired) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
              <ShieldAlert className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="text-2xl font-monument">
              Lien invalide ou expiré
            </CardTitle>
            <CardDescription>
              Ce lien de réinitialisation n'est plus valide. Il a peut-être déjà
              été utilisé ou a dépassé sa durée de validité (2h).
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <Button
              variant="hero"
              size="lg"
              className="w-full"
              onClick={() => navigate('/forgot-password')}
            >
              Refaire une demande
            </Button>
            <Button
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => navigate('/auth')}
            >
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <ShieldCheck className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl font-monument text-brand">
            Nouveau mot de passe
          </CardTitle>
          <CardDescription>
            Choisissez un mot de passe sécurisé pour votre compte.
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
              />
            </div>

            {password.length > 0 && (
              <ul className="space-y-1 text-xs">
                {rules.map((rule, i) => (
                  <li
                    key={i}
                    className={`flex items-center gap-2 ${
                      rule.ok ? 'text-green-600' : 'text-muted-foreground'
                    }`}
                  >
                    {rule.ok ? (
                      <Check className="h-3.5 w-3.5" />
                    ) : (
                      <X className="h-3.5 w-3.5" />
                    )}
                    {rule.label}
                  </li>
                ))}
              </ul>
            )}

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                required
                className={confirm.length > 0 && !passwordsMatch ? 'border-destructive' : ''}
              />
              {confirm.length > 0 && !passwordsMatch && (
                <p className="text-xs text-destructive">Les mots de passe ne correspondent pas</p>
              )}
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={!canSubmit}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mise à jour...
                </>
              ) : (
                'Mettre à jour mon mot de passe'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
