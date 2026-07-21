import { useEffect, useState } from 'react';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CreditCard, Loader2, Lock, ShieldCheck, Plus, Trash2, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';
import ConfirmDeleteModal from '@/components/modals/ConfirmDeleteModal';

/**
 * PaymentMethodSection — Prio 3 Bénéficiaire : Moyen de paiement
 * ─────────────────────────────────────────────────────────────────────────
 * Bloc à intégrer dans BeneficiaryHome (ou page /profil).
 * Affiche la CB enregistrée (4 derniers chiffres + expiration).
 * Modal ajout/remplacement — saisie mockée type Stripe Elements.
 * PCI DSS : seul un "token" mocké est stocké côté serveur.
 */

interface PaymentMethod {
  id: string;
  card_brand: string;
  card_last4: string;
  card_exp_month: number;
  card_exp_year: number;
}

const detectBrand = (number: string): string => {
  const n = number.replace(/\s/g, '');
  if (n.startsWith('4')) return 'visa';
  if (/^5[1-5]/.test(n) || /^2[2-7]/.test(n)) return 'mastercard';
  if (/^3[47]/.test(n)) return 'amex';
  return 'card';
};

export default function PaymentMethodSection() {
  const { user } = useAuth();
  const [pm, setPm] = useState<PaymentMethod | null>(null);
  const [loading, setLoading] = useState(true);
  const [addOpen, setAddOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('payment_methods')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    setPm(data as PaymentMethod | null);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleDelete = async () => {
    if (!pm) return;
    setIsDeleting(true);
    const { error } = await supabase.from('payment_methods').delete().eq('id', pm.id);
    setIsDeleting(false);
    if (error) toast.error(`Erreur : ${error.message}`);
    else {
      toast.success('Carte supprimée');
      setPm(null);
      setDeleteOpen(false);
    }
  };

  return (
    <section>
      <div className="max-w-7xl rounded-3xl shadow-lg border border-border/30 p-8 mx-auto bg-white/95 backdrop-blur-sm">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl md:text-2xl font-monument text-brand mb-2">
              <CreditCard className="inline-block mr-3 h-6 w-6" />
              Moyen de paiement
            </h2>
            <p className="text-muted-foreground">
              Carte utilisée pour la part non subventionnée de vos réservations
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-8 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
        ) : pm ? (
          <div className="card-sport">
            <div className="p-6 flex items-center gap-6 flex-wrap">
              {/* Carte visuelle */}
              <div className="bg-gradient-to-br from-primary to-secondary text-white rounded-xl p-4 w-56 aspect-[16/10] flex flex-col justify-between shadow-lg">
                <div className="flex justify-between items-start">
                  <p className="text-xs opacity-70 uppercase tracking-wider">Carte enregistrée</p>
                  <CreditCard className="h-5 w-5" />
                </div>
                <div className="text-lg font-mono tracking-wider">•••• •••• •••• {pm.card_last4}</div>
                <div className="flex justify-between text-xs">
                  <span className="opacity-70">Expire</span>
                  <span className="font-mono">{String(pm.card_exp_month).padStart(2, '0')}/{String(pm.card_exp_year).slice(-2)}</span>
                </div>
              </div>

              {/* Infos + actions */}
              <div className="flex-1 min-w-[200px] space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider">Type de carte</p>
                  <p className="font-semibold capitalize">{pm.card_brand}</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ShieldCheck className="h-3 w-3 text-green-600" />
                  Données tokenisées via notre PSP · Aucune donnée sensible stockée
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setAddOpen(true)} className="gap-1">
                    <CreditCard className="h-3 w-3" /> Remplacer
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(true)} className="text-muted-foreground hover:text-destructive gap-1">
                    <Trash2 className="h-3 w-3" /> Supprimer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
            <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-monument mb-2">Aucune carte enregistrée</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
              Ajoutez une carte bancaire pour pouvoir régler la part non subventionnée
              de vos réservations quand votre cagnotte est insuffisante.
            </p>
            <Button variant="hero" onClick={() => setAddOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" /> Ajouter une carte
            </Button>
          </div>
        )}
      </div>

      <PaymentMethodModal
        open={addOpen}
        onOpenChange={setAddOpen}
        userId={user?.id}
        existingId={pm?.id}
        onSuccess={load}
      />
      <ConfirmDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer votre carte ?"
        description={<>Vous devrez ajouter une nouvelle carte pour finaliser une réservation payante.</>}
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </section>
  );
}

// ══════════════════════════════════════════════════════════════════
// PaymentMethodModal — Add/replace card (mocké)
// ══════════════════════════════════════════════════════════════════
function PaymentMethodModal({ open, onOpenChange, userId, existingId, onSuccess }: any) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvc, setCvc] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cardClean = cardNumber.replace(/\s/g, '');
  const canSubmit =
    /^\d{16}$/.test(cardClean) &&
    /^\d{2}\/\d{2}$/.test(expiry) &&
    /^\d{3,4}$/.test(cvc);

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) raw = raw.slice(0, 2) + '/' + raw.slice(2);
    setExpiry(raw);
  };

  const handleSubmit = async () => {
    if (!canSubmit || !userId) return;
    setIsLoading(true);

    const last4 = cardClean.slice(-4);
    const brand = detectBrand(cardClean);
    const [mm, yy] = expiry.split('/');
    const expMonth = parseInt(mm);
    const expYear = 2000 + parseInt(yy);
    // Token simulé (dans une vraie prod : renvoyé par le PSP)
    const token = `tok_${Math.random().toString(36).slice(2, 15)}`;

    const payload = {
      user_id: userId,
      card_brand: brand,
      card_last4: last4,
      card_exp_month: expMonth,
      card_exp_year: expYear,
      token,
    };

    // Upsert : remplace la carte existante s'il y en a une
    const { error } = existingId
      ? await supabase.from('payment_methods').update(payload).eq('id', existingId)
      : await supabase.from('payment_methods').insert(payload);

    setIsLoading(false);

    if (error) return toast.error(`Erreur : ${error.message}`);
    toast.success('Votre moyen de paiement a bien été mis à jour.');
    setCardNumber(''); setExpiry(''); setCvc('');
    onSuccess?.();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !isLoading && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-monument">
            <CreditCard className="h-5 w-5 text-primary" />
            {existingId ? 'Remplacer la carte' : 'Ajouter une carte'}
          </DialogTitle>
          <DialogDescription>
            Les données sont chiffrées et tokenisées via notre PSP.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Numéro de carte</Label>
            <Input
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="4242 4242 4242 4242"
              autoComplete="cc-number"
              disabled={isLoading}
              className="font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Expiration</Label>
              <Input
                value={expiry}
                onChange={handleExpiryChange}
                placeholder="MM/AA"
                maxLength={5}
                autoComplete="cc-exp"
                disabled={isLoading}
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>CVC</Label>
              <Input
                value={cvc}
                onChange={(e) => setCvc(e.target.value.replace(/\D/g, '').slice(0, 4))}
                placeholder="123"
                maxLength={4}
                autoComplete="cc-csc"
                disabled={isLoading}
                className="font-mono"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 p-3 rounded-lg">
            <Lock className="h-4 w-4 text-green-600 shrink-0" />
            <span>Paiement sécurisé via notre PSP. Les données ne transitent jamais par nos serveurs.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>Annuler</Button>
          <Button variant="hero" onClick={handleSubmit} disabled={!canSubmit || isLoading} className="gap-2">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Enregistrer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
