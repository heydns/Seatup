import { useEffect, useState } from 'react';
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
  Ticket,
  History,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

/**
 * BeneficiaryDetailModal — Prio 1 CSE #10 + Prio 2 CSE #4
 * ─────────────────────────────────────────────────────────────────────────
 * Fiche détaillée d'un bénéficiaire :
 *  - Infos personnelles + compte
 *  - Historique des réservations (Prio 2 P2-4)
 *  - Bloc gestes de secours (Prio 1) : 3 actions + logs
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

interface ReservationRow {
  id: string;
  quantity: number;
  final_price: number;
  purchase_date: string;
  event: { title: string; event_date: string } | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiary: Beneficiary | null;
}

export default function BeneficiaryDetailModal({ open, onOpenChange, beneficiary }: Props) {
  const { user } = useAuth();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loadingReservations, setLoadingReservations] = useState(false);

  // ── Fetch historique réservations quand le modal s'ouvre ────
  useEffect(() => {
    if (!beneficiary || !open) return;
    setLoadingReservations(true);
    supabase
      .from('reservations')
      .select('id, quantity, final_price, purchase_date, event:events(title, event_date)')
      .eq('beneficiary_id', beneficiary.id)
      .eq('status', 'confirmed')
      .order('purchase_date', { ascending: false })
      .limit(10)
      .then(({ data, error }) => {
        if (error) console.error('Load reservations:', error);
        setReservations((data as any) ?? []);
        setLoadingReservations(false);
      });
  }, [beneficiary, open]);

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

  const handleCopyIdentifier = async () => {
    try {
      await navigator.clipboard.writeText(beneficiary.email);
      toast.success('Identifiant copié dans le presse-papier');
      await logRescueAction('resend_credentials', { identifier: beneficiary.email });
    } catch {
      toast.error('Impossible de copier');
    }
  };

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
      toast.success("Email d'activation renvoyé");
      await logRescueAction('resend_activation');
    } catch (err: any) {
      // Fallback via resetPasswordForEmail
      try {
        await supabase.auth.resetPasswordForEmail(beneficiary.email, {
          redirectTo: `${window.location.origin}/reset-password`,
        });
        toast.success("Email d'activation renvoyé (via reset password)");
        await logRescueAction('resend_activation');
      } catch {
        toast.error(`Erreur : ${err.message ?? 'échec envoi'}`);
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const fullName = `${beneficiary.first_name ?? ''} ${beneficiary.last_name ?? ''}`.trim() || '—';
  const totalTicketsBought = reservations.reduce((s, r) => s + r.quantity, 0);
  const totalSpent = reservations.reduce((s, r) => s + r.final_price, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-monument">
            <User className="h-5 w-5 text-primary" />
            {fullName}
          </DialogTitle>
          <DialogDescription>Fiche détaillée du bénéficiaire</DialogDescription>
        </DialogHeader>

        {/* ─── SECTION : Infos personnelles + compte ─────────────── */}
        <div className="space-y-4 py-2">
          <h3 className="text-sm font-semibold text-brand uppercase tracking-wider">Informations</h3>
          <div className="grid grid-cols-2 gap-4">
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

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Compte créé le
              </p>
              <p className="text-sm">
                {new Date(beneficiary.created_at).toLocaleDateString('fr-FR', {
                  day: '2-digit',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>

            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Dernière activité</p>
              <p className="text-sm">
                {beneficiary.last_activity ? (
                  new Date(beneficiary.last_activity).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })
                ) : (
                  <span className="text-muted-foreground italic">Jamais connecté</span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* ─── SECTION : Historique des réservations ─────────────── */}
        <div className="space-y-2 py-2 border-t border-border/40 pt-4">
          <h3 className="text-sm font-semibold text-brand uppercase tracking-wider flex items-center gap-2">
            <History className="h-4 w-4" />
            Historique des réservations
          </h3>

          {loadingReservations ? (
            <div className="flex items-center justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : reservations.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">
              Aucune réservation pour ce bénéficiaire.
            </p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Ticket className="h-3 w-3" />
                    Total billets
                  </p>
                  <p className="font-semibold">{totalTicketsBought}</p>
                </div>
                <div className="rounded-lg bg-muted p-3">
                  <p className="text-xs text-muted-foreground">Total dépensé</p>
                  <p className="font-semibold">{totalSpent.toLocaleString('fr-FR')} €</p>
                </div>
              </div>

              <div className="space-y-1 max-h-40 overflow-y-auto">
                {reservations.map((r) => (
                  <div
                    key={r.id}
                    className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-muted/50 text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {r.event?.title ?? 'Événement supprimé'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(r.purchase_date).toLocaleDateString('fr-FR')} ·{' '}
                        {r.quantity} billet{r.quantity > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="font-semibold text-brand ml-3">
                      {r.final_price} €
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ─── SECTION : Gestes de secours ─────────────────────────── */}
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-5 mt-2">
          <h3 className="font-monument text-brand mb-1 flex items-center gap-2">
            🛟 Gestes de secours
          </h3>
          <p className="text-xs text-muted-foreground mb-4">
            Actions rapides pour dépanner ce bénéficiaire. Chaque action est loguée.
          </p>

          <div className="space-y-2">
            <Button
              variant="outline"
              className="w-full justify-start gap-3"
              onClick={handleCopyIdentifier}
            >
              <Copy className="h-4 w-4 text-primary" />
              <div className="flex-1 text-left">
                <p className="text-sm font-medium">Copier l'identifiant</p>
                <p className="text-xs text-muted-foreground">{beneficiary.email}</p>
              </div>
            </Button>

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
                <p className="text-sm font-medium">Renvoyer l'email d'activation</p>
                <p className="text-xs text-muted-foreground">
                  {beneficiary.is_activated
                    ? 'Compte déjà activé — action non disponible.'
                    : "Relance l'invitation initiale."}
                </p>
              </div>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
