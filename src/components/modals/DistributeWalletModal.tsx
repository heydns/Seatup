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
import { Users, Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * DistributeWalletModal — Prio 2 CSE #5 : Distribution cagnotte
 * ─────────────────────────────────────────────────────────────────────────
 * Répartition égale d'un montant global entre tous les bénéficiaires actifs
 * du CSE. Utilise la fonction RPC distribute_to_beneficiaries.
 */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cseCompanyId: string;
  activeBeneficiariesCount: number;
  availableBudget: number;
  onSuccess?: () => void;
}

export default function DistributeWalletModal({
  open,
  onOpenChange,
  cseCompanyId,
  activeBeneficiariesCount,
  availableBudget,
  onSuccess,
}: Props) {
  const [totalAmount, setTotalAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{ count: number; total: number } | null>(null);

  const numTotal = parseInt(totalAmount, 10);
  const amountPerBeneficiary =
    !isNaN(numTotal) && activeBeneficiariesCount > 0
      ? Math.floor(numTotal / activeBeneficiariesCount)
      : 0;
  const realTotal = amountPerBeneficiary * activeBeneficiariesCount;
  const isValid =
    !isNaN(numTotal) &&
    numTotal > 0 &&
    activeBeneficiariesCount > 0 &&
    realTotal <= availableBudget;
  const overBudget = numTotal > availableBudget;
  const noActiveBeneficiaries = activeBeneficiariesCount === 0;

  const handleSubmit = async () => {
    if (!isValid) return;
    setIsLoading(true);

    try {
      const { data, error } = await supabase.rpc('distribute_to_beneficiaries', {
        p_cse_company_id: cseCompanyId,
        p_amount_per_beneficiary: amountPerBeneficiary,
      });

      if (error) throw error;

      const res = Array.isArray(data) ? data[0] : data;
      const updated = res?.updated_count ?? activeBeneficiariesCount;
      const distributed = res?.total_distributed ?? realTotal;

      setResult({ count: updated, total: distributed });
      toast.success(`${distributed} € distribués à ${updated} bénéficiaires`);
      onSuccess?.();
    } catch (err: any) {
      console.error('Distribute error:', err);
      toast.error(`Erreur : ${err.message ?? 'échec de la distribution'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setTotalAmount('');
    setResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {result ? (
          <div className="py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-monument mb-2">Distribution réussie !</h3>
            <p className="text-muted-foreground mb-4">
              <strong className="text-brand">{result.total.toLocaleString('fr-FR')} €</strong> ont
              été distribués à <strong>{result.count}</strong> bénéficiaires actifs
              ({amountPerBeneficiary} € chacun).
            </p>
            <Button variant="hero" onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-monument">
                <Users className="h-5 w-5 text-primary" />
                Distribuer aux bénéficiaires
              </DialogTitle>
              <DialogDescription>
                Répartition égale d'un montant global entre les bénéficiaires actifs.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {noActiveBeneficiaries ? (
                <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-sm text-amber-900">
                  <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <p>
                    Aucun bénéficiaire actif dans votre CSE. Ajoutez d'abord des
                    bénéficiaires et assurez-vous qu'ils ont activé leur compte.
                  </p>
                </div>
              ) : (
                <>
                  <div className="rounded-xl bg-muted p-3 text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Bénéficiaires actifs</span>
                      <span className="font-medium">{activeBeneficiariesCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Solde cagnotte disponible</span>
                      <span className="font-medium">{availableBudget.toLocaleString('fr-FR')} €</span>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">
                      Montant global à distribuer <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <Input
                        id="amount"
                        type="number"
                        min="1"
                        step="1"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(e.target.value)}
                        placeholder="5000"
                        disabled={isLoading}
                        className="pr-10"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        €
                      </span>
                    </div>
                  </div>

                  {numTotal > 0 && (
                    <div
                      className={`rounded-xl p-4 space-y-2 text-sm ${
                        overBudget
                          ? 'bg-red-50 border border-red-200 text-red-900'
                          : 'bg-primary/5 border border-primary/20'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Montant par bénéficiaire</span>
                        <span className="font-medium">
                          {amountPerBeneficiary.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Distribué au total</span>
                        <span className="font-medium">
                          {realTotal.toLocaleString('fr-FR')} €
                        </span>
                      </div>
                      {numTotal % activeBeneficiariesCount !== 0 && !overBudget && (
                        <p className="text-xs italic pt-1 border-t border-primary/10">
                          ℹ️ Le reste ({(numTotal - realTotal).toLocaleString('fr-FR')} €) restera
                          dans la cagnotte globale (répartition entière).
                        </p>
                      )}
                      {overBudget && (
                        <p className="text-xs font-medium pt-1 border-t border-red-200">
                          ⚠️ Le montant dépasse le solde de la cagnotte (
                          {availableBudget.toLocaleString('fr-FR')} €).
                        </p>
                      )}
                    </div>
                  )}
                </>
              )}
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
                    Distribution...
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4" />
                    Confirmer la distribution
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
