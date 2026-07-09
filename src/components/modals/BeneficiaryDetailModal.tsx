import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  User,
  Mail,
  Calendar,
  Wallet,
  Copy,
  KeyRound,
  MailPlus,
  Loader2,
  CheckCircle2,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

/**
 * BeneficiaryDetailModal — Prio 1 CSE #10 : Gestes de secours
 * ─────────────────────────────────────────────────────────────────────────
 * Fiche détaillée d'un bénéficiaire ouverte au clic sur une ligne de la
 * table du dashboard CSE. Affiche infos + bloc "Gestes de secours" avec :
 *  1. Renvoyer identifiant (affiche + copie)
 *  2. Envoyer email reset MDP (supabase.auth.resetPasswordForEmail)
 *  3. Renvoyer email d'activation (Edge Function 'resend-activation')
 *
 * Chaque action est loggée dans public.rescue_actions.
 */

export interface Beneficiary {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  is_activated: boolean;
  allocated_budget: number | null;
  consumed_budget: number | null;
  last_activity: string | null;
  created_at: string;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: Beneficiary | null;
}

export default function BeneficiaryDetailModal({ open, onOpenChange, beneficiary }: Props) {
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);

  if (!beneficiary) return null;

  const logRescueAction = async (actionType: string, details: any = {}) => {
    if (!user) return;
    try {
      await supabase.from('rescue_actions').insert({
        admin_id: user.id,
        target_id: beneficiary.id,
        action_type: actionType,
        details,
      });
    } catch (err) {
      console.error('Log rescue action failed:', err);
    }
  };

  // ─── Action 1 : Renvoyer identifiant ─────────────────────────
  const handleCopyIdentifier = async () => {
    try {
      await navigator.clipboard.writeText(beneficiary.email);
      toast.success('Identifiant copié dans le presse-papier');
      await logRescueAction('resend_credentials', { identifier: beneficiary.email });
    } catch {
      toast.error('Impossible de copier');
    }
  };

  // ─── Action 2 : Envoyer email reset MDP ──────────────────────
  const handleSendResetPassword = async () => {
    setLoadingAction('password_reset');
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(beneficiary.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      toast.success('Email de réinitialisation envoyé avec succès');
      await logRescueAction('password_reset');
    } catch (err: any) {
      console.error('Send reset password error:', err);
      toast.error(`Erreur : ${err.message ?? 'échec envoi'}`);
    } finally {
      setLoadingAction(null);
    }
  };

  // ─── Action 3 : Renvoyer email d'activation ──────────────────
  const handleResendActivation = async () => {
    if (beneficiary.is_activated) {
      toast.error('Ce compte est déjà activé');
      return;
    }
    setLoadingAction('resend_activation');
    try {
      const { error } = await supabase.functions.invoke('resend-activation', {
        body: { email: beneficiary.email },
      });
      if (error) throw error;
      toast.success('Email d\'activation renvoyé');
      await logRescueAction('resend_activation');
    } catch (err: any) {
      console.error('Resend activation error:', err);
      // Fallback : utilise resetPasswordForEmail comme succédané
      try {
        await supabase.auth.resetPasswordForEmail(beneficiary.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        toast.success('Email d\'activation renvoyé (via reset password)');
        await logRescueAction('resend_activation');
      } catch {
        toast.error(`Erreur : ${err.message ?? 'échec envoi'}`);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const fullName = `${beneficiary.first_name ?? ''} ${beneficiary.last_name ?? ''}`.trim() || '—';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-monument">
            <User className="h-5 w-5 text-primary" />
            {fullName}
          </DialogTitle>
          <DialogDescription>Fiche détaillée du bénéficiaire</DialogDescription>
        </DialogHeader>

        {/* ─── Infos ─────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 py-2">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Mail className="h-3 w-3" /> Email
            </p>
            <p className="text-sm font-medium break-all">{beneficiary.email}</p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Statut</p>
            {beneficiary.is_activated ? (
              <Badge className="bg-green-100 text-green-700 hover:bg-green-100 gap-1">
                <CheckCircle2 className="h-3 w-3" />
                Activé
              </Badge>
            ) : (
              <Badge variant="outline" className="text-amber-600 border-amber-300">
                Non activé
              </Badge>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Wallet className="h-3 w-3" /> Budget alloué
            </p>
            <p className="text-sm font-medium">
              {(beneficiary.allocated_budget ?? 0).toLocaleString('fr-FR')} €
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Budget consommé</p>
            <p className="text-sm font-medium">
              {(beneficiary.consumed_budget ?? 0).toLocaleString('fr-FR')} €
            </p>
          </div>

          <div className="space-y-1 col-span-2">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Dernière activité
            </p>
            <p className="text-sm">
              {beneficiary.last_activity
                ? new Date(beneficiary.last_activity).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                : <span className="text-muted-foreground italic">Jamais connecté</span>}
            </p>
          </div>
        </div>

        {/* ─── Bloc Gestes de secours ─────────────────────────── */}
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 mt-2">
          <h3 className="font-monument text-brand mb-1 flex items-center gap-2">
            🛟 Gestes de secours
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Actions rapides pour dépanner ce bénéficiaire. Chaque action est loguée.
          </p>

          <div className="space-y-2">
            {/* Action 1 : Copier identifiant */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleCopyIdentifier}
            >
              <Copy className="h-4 w-4 text-primary" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Copier l'identifiant</p>
                <p className="text-xs text-muted-foreground">
                  {beneficiary.email}
                </p>
              </div>
            </Button>

            {/* Action 2 : Reset MDP */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleSendResetPassword}
              disabled={loadingAction !== null}
            >
              {loadingAction === 'password_reset' ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <KeyRound className="h-4 w-4 text-primary" />
              )}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Envoyer l'email de réinitialisation</p>
                <p className="text-xs text-muted-foreground">
                  Un email avec un lien "Mot de passe oublié" sera envoyé.
                </p>
              </div>
            </Button>

            {/* Action 3 : Renvoyer email activation */}
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleResendActivation}
              disabled={loadingAction !== null || beneficiary.is_activated}
            >
              {loadingAction === 'resend_activation' ? (
                <Loader2 className="h-4 w-4 animate-spin text-primary" />
              ) : (
                <MailPlus className="h-4 w-4 text-primary" />
              )}
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">
                  Renvoyer l'email d'activation
                </p>
                <p className="text-xs text-muted-foreground">
                  {beneficiary.is_activated
                    ? 'Compte déjà activé — action non disponible.'
                    : 'Relance l\'invitation initiale.'}
                </p>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
