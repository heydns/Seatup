import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from '@/components/ui/input-otp';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Loader2, Mail, KeyRound, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

/**
 * Auth.tsx — Page de connexion SeatUp (V1, OTP email)
 * ─────────────────────────────────────────────────────────────────────────
 * Flow en 2 étapes :
 *   1. L'utilisateur saisit son email.
 *   2. Supabase envoie un code OTP à 6 chiffres via email (SMTP Resend).
 *   3. L'utilisateur colle le code → redirection.
 *
 * Supporte un paramètre `?returnTo=/path` pour rediriger vers la page
 * d'origine après connexion (ex : fiche event cliquée en non-loggué).
 *
 * Config requise côté Supabase Dashboard :
 *   - Authentication → Providers → Email → Enable "Email OTP" (auth hook)
 *   - Authentication → Email Templates → "Magic Link" :
 *       Sujet : "Votre code SeatUp"
 *       Body : "{{ .Token }}" (= le code 6 chiffres)
 *   - Settings → SMTP : configurer avec Resend
 *       Host:      smtp.resend.com
 *       Port:      465
 *       Username:  resend
 *       Password:  <RESEND_API_KEY>
 *       From:      noreply@seatup.co
 *       Sender:    SeatUp
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_RESEND_COOLDOWN = 30; // sec

type Step = 'email' | 'otp';

const Auth = () => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/dashboard';

  // Si déjà loggué, redirect direct
  useEffect(() => {
    if (user) navigate(returnTo);
  }, [user, navigate, returnTo]);

  // Countdown pour le resend OTP
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  // ─── Étape 1 : envoi du code ─────────────────────────────────────────
  const handleSendOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    const trimmedEmail = email.trim().toLowerCase();

    if (!trimmedEmail) {
      setEmailError('Veuillez saisir votre email');
      return;
    }
    if (!emailRegex.test(trimmedEmail)) {
      setEmailError("Format d'email invalide");
      return;
    }
    setEmailError('');

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: trimmedEmail,
        options: {
          // En V1 on NE crée PAS les comptes depuis la page de connexion.
          // Les comptes sont créés par les admins (CSE/orga) ou via onboarding
          // spécifique. Si l'email n'existe pas, Supabase renverra une erreur
          // générique (unified pour éviter l'énumération d'emails).
          shouldCreateUser: false,
          // Future-proof : URL de confirmation si on bascule plus tard sur magic link
          emailRedirectTo: `${window.location.origin}${returnTo}`,
        },
      });

      if (error) {
        console.error('[Auth] signInWithOtp error:', error);
        if (error.message?.includes('rate limit')) {
          toast.error('Trop de tentatives. Réessayez dans quelques minutes.');
        } else {
          // Message unifié pour ne pas leak l'existence du compte
          toast.error('Impossible d\'envoyer le code. Vérifiez votre email ou contactez votre admin.');
        }
      } else {
        toast.success('Code envoyé 📧', {
          description: 'Vérifiez votre boîte email (et les spams si besoin).',
        });
        setStep('otp');
        setResendCooldown(OTP_RESEND_COOLDOWN);
      }
    } catch (err) {
      console.error('[Auth] Unexpected error:', err);
      toast.error('Une erreur technique est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Étape 2 : vérification du code ─────────────────────────────────
  // NB : Supabase envoie des OTP à 6 OU 8 chiffres selon la version de son
  // backend. On accepte les deux pour être robuste.
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (otpCode.length !== 6 && otpCode.length !== 8) {
      toast.error('Veuillez saisir le code complet');
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.verifyOtp({
        email: email.trim().toLowerCase(),
        token: otpCode,
        type: 'email',
      });

      if (error) {
        console.error('[Auth] verifyOtp error:', error);
        if (error.message?.includes('expired')) {
          toast.error('Code expiré. Demandez un nouveau code.');
          setOtpCode('');
        } else if (error.message?.includes('invalid') || error.message?.includes('Token')) {
          toast.error('Code invalide. Vérifiez et réessayez.');
          setOtpCode('');
        } else {
          toast.error(`Erreur : ${error.message}`);
        }
      } else {
        toast.success('Connexion réussie ! 🎉');
        // AuthProvider va détecter la session et navigate vers /dashboard
        // mais on force aussi au cas où returnTo est custom
        setTimeout(() => navigate(returnTo), 300);
      }
    } catch (err) {
      console.error('[Auth] Unexpected error:', err);
      toast.error('Une erreur technique est survenue. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    if (resendCooldown > 0) return;
    setOtpCode('');
    handleSendOtp();
  };

  const handleBack = () => {
    if (step === 'otp') {
      setStep('email');
      setOtpCode('');
      setResendCooldown(0);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="flex items-center p-4">
        <Button variant="ghost" size="sm" onClick={handleBack} className="flex items-center gap-2">
          <ArrowLeft className="h-4 w-4" />
          {step === 'otp' ? 'Changer d\'email' : 'Retour'}
        </Button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="text-center space-y-2">
            {step === 'email' ? (
              <>
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <Mail className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-3xl font-monument text-brand">Connexion</CardTitle>
                <CardDescription className="text-base">
                  Recevez un code à usage unique par email
                </CardDescription>
              </>
            ) : (
              <>
                <div className="mx-auto w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <KeyRound className="h-7 w-7 text-primary" />
                </div>
                <CardTitle className="text-3xl font-monument text-brand">Vérification</CardTitle>
                <CardDescription className="text-base">
                  Code envoyé à <strong>{email}</strong>
                </CardDescription>
              </>
            )}
          </CardHeader>

          <CardContent>
            {step === 'email' ? (
              <form onSubmit={handleSendOtp} className="space-y-5" noValidate>
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
                    disabled={isLoading}
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
                      Envoi du code...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Recevoir mon code
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Pas encore de compte ? Il est créé par votre admin CSE ou votre club.
                  Contactez-le si vous n'avez pas reçu votre invitation.
                </p>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-6" noValidate>
                <div className="space-y-3">
                  <Label className="text-center block">Votre code à 6 ou 8 chiffres</Label>
                  <div className="flex justify-center">
                    {/*
                      Supabase envoie par défaut un OTP à 8 chiffres (parfois 6
                      selon la version). On met maxLength=8 pour supporter les
                      deux, et on valide côté serveur (verifyOtp acceptera les
                      6 ou 8 chiffres selon le token réellement émis).
                    */}
                    <InputOTP
                      maxLength={8}
                      value={otpCode}
                      onChange={setOtpCode}
                      disabled={isLoading}
                      onComplete={(value) => {
                        // Auto-submit quand on atteint 6 ou 8 chiffres
                        if ((value.length === 6 || value.length === 8) && !isLoading) {
                          setTimeout(() => {
                            const form = document.querySelector('form');
                            if (form) form.requestSubmit();
                          }, 150);
                        }
                      }}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                      <InputOTPSeparator />
                      <InputOTPGroup>
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                        <InputOTPSlot index={6} />
                        <InputOTPSlot index={7} />
                      </InputOTPGroup>
                    </InputOTP>
                  </div>
                  <p className="text-xs text-muted-foreground text-center">
                    Expire dans 10 minutes
                  </p>
                </div>

                <Button
                  type="submit"
                  variant="hero"
                  size="lg"
                  className="w-full"
                  disabled={isLoading || (otpCode.length !== 6 && otpCode.length !== 8)}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Vérification...
                    </>
                  ) : (
                    'Se connecter'
                  )}
                </Button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendCooldown > 0 || isLoading}
                    className="text-sm text-primary hover:underline font-medium disabled:text-muted-foreground disabled:cursor-not-allowed flex items-center justify-center gap-1 mx-auto"
                  >
                    <RefreshCw className="h-3 w-3" />
                    {resendCooldown > 0
                      ? `Renvoyer un code dans ${resendCooldown}s`
                      : 'Renvoyer un code'}
                  </button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>

      <footer className="p-4 text-center text-xs text-muted-foreground">
        © 2026 SeatUp — Vivez le sport, simplement.
      </footer>
    </div>
  );
};

export default Auth;
