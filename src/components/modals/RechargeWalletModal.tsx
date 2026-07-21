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
import { Wallet, Loader2, FileText, Check, CreditCard, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

/**
 * RechargeWalletModal — Prio 1 CSE #11 + FIX-4
 * ─────────────────────────────────────────────────────────────────────────
 * Flow en 2 étapes (retour Alex) :
 *   1. Saisie montant → génération BDC (status = pending_payment)
 *   2. Simulation paiement → génération facture + crédit cagnotte
 */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cseCompanyId: string;
  currentBudget: number;
  onSuccess?: () => void;
}

type Step = 'form' | 'bdc_issued' | 'invoice';

export default function RechargeWalletModal({
  open,
  onOpenChange,
  cseCompanyId,
  currentBudget,
  onSuccess,
}: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<Step>('form');
  const [amount, setAmount] = useState('');
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [purchaseOrderRef, setPurchaseOrderRef] = useState<string | null>(null);
  const [invoiceRef, setInvoiceRef] = useState<string | null>(null);

  const numAmount = parseInt(amount, 10);
  const isValid = !isNaN(numAmount) && numAmount > 0;

  const generatePurchaseOrder = () =>
    `BC-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`;

  // ─── Étape 1 : Générer BDC ────────────────────────────────
  const handleGenerateBDC = async () => {
    if (!isValid || !user) return;
    setIsLoading(true);
    const bcRef = generatePurchaseOrder();

    try {
      const { data, error } = await supabase
        .from('cagnotte_transactions')
        .insert({
          cse_company_id: cseCompanyId,
          admin_id: user.id,
          amount: numAmount,
          comment: comment.trim() || null,
          purchase_order_ref: bcRef,
          status: 'pending_payment',
        })
        .select()
        .single();

      if (error) throw error;

      setTransactionId(data.id);
      setPurchaseOrderRef(bcRef);
      setStep('bdc_issued');
      toast.success('Bon de commande émis');
    } catch (err: any) {
      console.error('BDC error:', err);
      toast.error(`Erreur : ${err.message ?? 'impossible d\'émettre le BDC'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Étape 2 : Simuler le paiement → générer facture ─────
  const handleMarkPaid = async () => {
    if (!transactionId) return;
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('mark_bdc_paid', {
        p_transaction_id: transactionId,
      });
      if (error) throw error;

      setInvoiceRef(data as string);
      setStep('invoice');
      toast.success(`Cagnotte rechargée de ${numAmount} €`);
      onSuccess?.();
    } catch (err: any) {
      console.error('Mark paid error:', err);
      toast.error(`Erreur : ${err.message ?? 'échec du paiement'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setStep('form');
    setAmount('');
    setComment('');
    setTransactionId(null);
    setPurchaseOrderRef(null);
    setInvoiceRef(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {/* ═══ ÉTAPE 3 : Facture générée ═══ */}
        {step === 'invoice' && (
          <div className="py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-monument mb-2">Rechargement terminé !</h3>
            <p className="text-muted-foreground mb-4">
              La cagnotte a été rechargée de{' '}
              <strong className="text-brand">{numAmount} €</strong>.
              Le nouveau solde est disponible immédiatement.
            </p>

            <div className="rounded-xl bg-muted p-4 text-sm text-left space-y-2 mb-4">
              <div className="flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4 text-primary" />
                Bon de commande
              </div>
              <p className="font-mono text-primary text-xs">{purchaseOrderRef}</p>
              <div className="border-t border-border/50 pt-2 flex items-center gap-2 font-semibold">
                <FileText className="h-4 w-4 text-green-600" />
                Facture générée
              </div>
              <p className="font-mono text-green-700 text-xs">{invoiceRef}</p>
              <p className="text-xs text-muted-foreground pt-2 border-t border-border/50">
                Conservez ces références pour votre comptabilité. Vous pouvez les retrouver
                dans l'historique cagnotte.
              </p>
            </div>

            <Button variant="hero" onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        )}

        {/* ═══ ÉTAPE 2 : BDC émis, en attente de paiement ═══ */}
        {step === 'bdc_issued' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-monument">
                <FileText className="h-5 w-5 text-primary" />
                Bon de commande émis
              </DialogTitle>
              <DialogDescription>
                Confirmez le paiement pour créditer la cagnotte et générer la facture.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="rounded-xl bg-primary/5 border-2 border-primary/20 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs uppercase text-muted-foreground">N° BDC</span>
                  <span className="font-mono text-sm font-bold text-primary">
                    {purchaseOrderRef}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-sm">Montant</span>
                  <span className="text-2xl font-monument text-brand">
                    {numAmount.toLocaleString('fr-FR')} €
                  </span>
                </div>
                {comment && (
                  <div className="text-sm border-t border-primary/10 pt-2">
                    <span className="text-muted-foreground">Note :</span> {comment}
                  </div>
                )}
              </div>

              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-900">
                ⚠️ La cagnotte <strong>ne sera créditée qu'après confirmation du paiement</strong>.
                Une facture sera automatiquement générée.
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Fermer sans payer
              </Button>
              <Button
                variant="hero"
                onClick={handleMarkPaid}
                disabled={isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Traitement...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    Simuler le paiement
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* ═══ ÉTAPE 1 : Formulaire ═══ */}
        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-monument">
                <Wallet className="h-5 w-5 text-primary" />
                Recharger la cagnotte
              </DialogTitle>
              <DialogDescription>
                Solde actuel :{' '}
                <strong className="text-brand">{currentBudget.toLocaleString('fr-FR')} €</strong>
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
                  <p className="text-xs text-destructive">Le montant doit être supérieur à 0.</p>
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

              {/* Étapes visuelles */}
              <div className="flex items-center justify-around bg-muted/50 rounded-xl p-3 text-xs">
                <div className="flex flex-col items-center gap-1">
                  <FileText className="h-4 w-4 text-primary" />
                  <span>1. BDC émis</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <div className="flex flex-col items-center gap-1 opacity-60">
                  <CreditCard className="h-4 w-4" />
                  <span>2. Paiement</span>
                </div>
                <ArrowRight className="h-3 w-3 text-muted-foreground" />
                <div className="flex flex-col items-center gap-1 opacity-60">
                  <Check className="h-4 w-4" />
                  <span>3. Facture</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                ⚠️ Le rechargement se fera en <strong>2 étapes</strong> : émission du bon de
                commande, puis confirmation du paiement (qui déclenche la facture et le crédit).
              </p>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                variant="hero"
                onClick={handleGenerateBDC}
                disabled={!isValid || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Émission…
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4" />
                    Émettre le BDC
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
