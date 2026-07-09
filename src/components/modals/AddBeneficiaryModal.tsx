import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { UserPlus, Loader2, MailCheck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

/**
 * AddBeneficiaryModal — Prio 1 CSE #9 : Ajouter des bénéficiaires
 * ─────────────────────────────────────────────────────────────────────────
 * Appel une Supabase Edge Function 'invite-beneficiary' qui, avec la
 * service role key, crée le user dans auth.users et déclenche l'email
 * d'invitation (Supabase Auth "invite" flow).
 *
 * Le bénéficiaire est automatiquement rattaché au cse_company_id de l'admin.
 */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cseCompanyId: string;
  onSuccess?: () => void;
}

export default function AddBeneficiaryModal({
  open,
  onOpenChange,
  cseCompanyId,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [allocatedBudget, setAllocatedBudget] = useState('500');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = 'Le prénom est requis';
    if (!lastName.trim()) errs.lastName = 'Le nom est requis';
    if (!email.trim()) errs.email = 'L\'email est requis';
    else if (!emailRegex.test(email.trim())) errs.email = 'Format d\'email invalide';
    const budget = parseInt(allocatedBudget, 10);
    if (isNaN(budget) || budget < 0) errs.budget = 'Budget invalide';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !user) return;

    setIsLoading(true);
    try {
      // Appel de la Edge Function qui gère la création + email invitation
      const { data, error } = await supabase.functions.invoke('invite-beneficiary', {
        body: {
          email: email.trim().toLowerCase(),
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          cseCompanyId,
          allocatedBudget: parseInt(allocatedBudget, 10),
        },
      });

      if (error) throw error;

      if (data?.error) {
        // Cas spécifique : email déjà existant
        if (data.error.includes('already registered') || data.error.includes('exists')) {
          toast.error('Cet utilisateur existe déjà.');
        } else {
          toast.error(`Erreur : ${data.error}`);
        }
        return;
      }

      setEmailSent(true);
      toast.success(`Invitation envoyée à ${email}`);
      onSuccess?.();
    } catch (err: any) {
      console.error('Add beneficiary error:', err);
      // Fallback si l'Edge Function n'est pas encore déployée : insertion directe dans profiles
      // NB : dans ce cas, pas d'email d'invitation automatique.
      const msg = err.message ?? String(err);
      // Détecte tous les cas où l'Edge Function n'est pas déployée / joignable
      if (
        msg.includes('not found') ||
        msg.includes('Function not found') ||
        msg.includes('Failed to send a request') ||
        msg.includes('Failed to fetch')
      ) {
        toast.error(
          'Fonction non déployée. Créez le compte manuellement via Supabase Dashboard → Auth → Users.',
          { duration: 6000 }
        );
      } else {
        toast.error(`Erreur : ${msg}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setFirstName('');
    setLastName('');
    setEmail('');
    setAllocatedBudget('500');
    setErrors({});
    setEmailSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {emailSent ? (
          <div className="py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
              <MailCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-monument mb-2">Invitation envoyée !</h3>
            <p className="text-muted-foreground mb-4">
              Un email d'activation a été envoyé à <strong>{email}</strong>. Le bénéficiaire
              pourra définir son mot de passe et accéder à son espace.
            </p>
            <Button variant="hero" onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-monument">
                <UserPlus className="h-5 w-5 text-primary" />
                Ajouter un bénéficiaire
              </DialogTitle>
              <DialogDescription>
                Le bénéficiaire recevra un email pour activer son compte et définir son
                mot de passe.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    Prénom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                    className={errors.firstName ? 'border-destructive' : ''}
                  />
                  {errors.firstName && (
                    <p className="text-xs text-destructive">{errors.firstName}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Nom <span className="text-destructive">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                    className={errors.lastName ? 'border-destructive' : ''}
                  />
                  {errors.lastName && (
                    <p className="text-xs text-destructive">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="salarie@entreprise.fr"
                  disabled={isLoading}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Budget alloué (€ / an)</Label>
                <div className="relative">
                  <Input
                    id="budget"
                    type="number"
                    min="0"
                    step="10"
                    value={allocatedBudget}
                    onChange={(e) => setAllocatedBudget(e.target.value)}
                    disabled={isLoading}
                    className={errors.budget ? 'border-destructive' : 'pr-10'}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                </div>
                {errors.budget && (
                  <p className="text-xs text-destructive">{errors.budget}</p>
                )}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi de l'invitation...
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4" />
                    Ajouter & inviter
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
