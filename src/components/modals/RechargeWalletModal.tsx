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
import { Textarea } from '@/components/ui/textarea';
import { Wallet, Loader2, FileText, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

/**
 * RechargeWalletModal — Prio 1 CSE #11 : Recharger la cagnotte
 * ─────────────────────────────────────────────────────────────────────────
 * Modal appelé depuis le dashboard CSE. Formulaire montant + commentaire.
 * Génère un bon de commande, insère la transaction et update auto le budget
 * total du CSE (trigger DB apply_cagnotte_transaction).
 */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cseCompanyId: string;
  currentBudget: number;
  onSuccess?: () => void;
}

export default function RechargeWalletModal({
  open,
  onOpenChange,
  cseCompanyId,
  currentBudget,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successRef, setSuccessRef] = useState<string | null>(null);

  const numAmount = parseInt(amount, 10);
  const isValid = !isNaN(numAmount) && numAmount > 0;

  const generatePurchaseOrder = () =>
    `BC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

  const handleSubmit = async () => {
    if (!isValid || !user) return;

    setIsLoading(true);
    const purchaseOrderRef = generatePurchaseOrder();

    try {
      const { error } = await supabase.from('cagnotte_transactions').insert({
        cse_company_id: cseCompanyId,
        admin_id: user.id,
        amount: numAmount,
        comment: comment.trim() || null,
        purchase_order_ref: purchaseOrderRef,
      });

      if (error) throw error;

      setSuccessRef(purchaseOrderRef);
      toast.success(`Cagnotte rechargée de ${numAmount} €`);
      onSuccess?.();
    } catch (err: any) {
      console.error('Recharge error:', err);
      toast.error(`Erreur : ${err.message ?? 'impossible de recharger'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setAmount('');
    setComment('');
    setSuccessRef(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {successRef ? (
          // ─── Écran de succès ───────────────────────────────────
          <div className="py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-monument mb-2">Cagnotte rechargée !</h3>
            <p className="text-muted-foreground mb-4">
              Votre cagnotte a été rechargée de{' '}
              <strong className="text-brand">{numAmount} €</strong>. Le nouveau solde est
              disponible immédiatement pour vos bénéficiaires.
            </p>

            <div className="rounded-xl bg-muted p-4 text-sm text-left space-y-1 mb-4">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4" />
                Bon de commande généré
              </div>
              <p className="font-mono text-primary">{successRef}</p>
              <p className="text-xs text-muted-foreground">
                Conservez cette référence pour votre comptabilité.
              </p>
            </div>

            <Button variant="hero" onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-monument">
                <Wallet className="h-5 w-5 text-primary" />
                Recharger la cagnotte
              </DialogTitle>
              <DialogDescription>
                Solde actuel : <strong className="text-brand">{currentBudget.toLocaleString('fr-FR')} €</strong>
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              <div className="space-y-2">
                <Label htmlFor="amount">
                  Montant à ajouter <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000"
                    disabled={isLoading}
                    className="pr-10"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    €
                  </span>
                </div>
                {amount && !isValid && (
                  <p className="text-xs text-destructive">
                    Le montant doit être supérieur à 0.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="comment">Commentaire interne (optionnel)</Label>
                <Textarea
                  id="comment"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Ex : Rechargement Q3 2026"
                  rows={2}
                  disabled={isLoading}
                />
              </div>

              {isValid && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solde actuel</span>
                    <span>{currentBudget.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="flex justify-between text-green-600">
                    <span>Rechargement</span>
                    <span>+ {numAmount.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between font-semibold text-base">
                    <span>Nouveau solde</span>
                    <span className="text-primary">
                      {(currentBudget + numAmount).toLocaleString('fr-FR')} €
                    </span>
                  </div>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                ⚠️ Le rechargement est <strong>irréversible</strong>. Un bon de commande
                sera généré automatiquement.
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                variant="hero"
                onClick={handleSubmit}
                disabled={!isValid || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <Wallet className="h-4 w-4" />
                    Confirmer le rechargement
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
