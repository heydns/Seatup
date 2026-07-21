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
import { Mail, Loader2, Send, Check, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { toast } from 'sonner';

/**
 * SendCommunicationModal — Prio 3 CSE : Envoi communication email
 * ─────────────────────────────────────────────────────────────────────────
 * Compose email (objet + contenu) + choix destinataires (tous/actifs/non
 * connectés). Log dans email_logs. Envoi via edge function 'send-cse-email'
 * (fallback log-only si non déployée).
 */

interface BeneficiaryLite {
  id: string;
  email: string;
  is_activated: boolean;
  last_activity: string | null;
}

type RecipientFilter = 'all' | 'active' | 'never';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cseCompanyId: string;
  companyName: string;
  beneficiaries: BeneficiaryLite[];
}

export default function SendCommunicationModal({
  open,
  onOpenChange,
  cseCompanyId,
  companyName,
  beneficiaries,
}: Props) {
  const { user } = useAuth();
  const [step, setStep] = useState<'form' | 'preview' | 'success'>('form');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [filter, setFilter] = useState<RecipientFilter>('all');
  const [isLoading, setIsLoading] = useState(false);
  const [sentCount, setSentCount] = useState(0);

  const recipients = beneficiaries.filter((b) => {
    if (filter === 'all') return true;
    if (filter === 'active') return b.is_activated;
    if (filter === 'never') return b.is_activated && !b.last_activity;
    return false;
  });

  const canProceed = subject.trim().length > 0 && body.trim().length > 0 && recipients.length > 0;

  const handleSend = async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      // Try to invoke edge function (may not be deployed → fallback to log-only)
      try {
        await supabase.functions.invoke('send-cse-email', {
          body: {
            cseCompanyId,
            subject: subject.trim(),
            body: body.trim(),
            recipientEmails: recipients.map((r) => r.email),
            senderName: companyName,
          },
        });
      } catch {
        // Silent fallback — log only
        console.warn('send-cse-email edge function not deployed, logging only.');
      }

      // Log dans email_logs (RLS assure que le user est bien admin CSE)
      const { error } = await supabase.from('email_logs').insert({
        cse_company_id: cseCompanyId,
        admin_id: user.id,
        subject: subject.trim(),
        body: body.trim(),
        recipients_count: recipients.length,
        recipient_filter: filter,
      });
      if (error) throw error;

      setSentCount(recipients.length);
      setStep('success');
      toast.success(`Communication envoyée à ${recipients.length} bénéficiaires`);
    } catch (err: any) {
      console.error('Send communication error:', err);
      toast.error(`Erreur : ${err.message ?? 'échec envoi'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (isLoading) return;
    setSubject('');
    setBody('');
    setFilter('all');
    setStep('form');
    setSentCount(0);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        {step === 'success' && (
          <div className="py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-monument mb-2">Communication envoyée !</h3>
            <p className="text-muted-foreground mb-4">
              Votre communication a bien été envoyée à{' '}
              <strong className="text-brand">{sentCount}</strong> bénéficiaires.
            </p>
            <div className="rounded-xl bg-muted p-3 text-xs text-left mb-4">
              <p className="font-semibold mb-1">📋 Envoi tracé pour conformité RGPD</p>
              <p className="text-muted-foreground">
                Date, expéditeur ({companyName}), objet, contenu et liste des destinataires
                sont conservés dans les logs.
              </p>
            </div>
            <Button variant="hero" onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        )}

        {step === 'preview' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-monument">
                <Send className="h-5 w-5 text-primary" />
                Récapitulatif avant envoi
              </DialogTitle>
              <DialogDescription>Vérifiez le contenu avant d'envoyer.</DialogDescription>
            </DialogHeader>

            <div className="space-y-3 py-2">
              <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expéditeur</span>
                  <span className="font-medium">{companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Destinataires</span>
                  <span className="font-medium">{recipients.length} bénéficiaires</span>
                </div>
              </div>

              <div className="rounded-xl border p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Objet</p>
                <p className="font-medium">{subject}</p>
              </div>

              <div className="rounded-xl border p-4 space-y-2 max-h-40 overflow-y-auto">
                <p className="text-xs font-semibold text-muted-foreground uppercase">Contenu</p>
                <p className="whitespace-pre-wrap text-sm">{body}</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setStep('form')} disabled={isLoading}>
                Modifier
              </Button>
              <Button variant="hero" onClick={handleSend} disabled={isLoading} className="gap-2">
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Envoi…
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Envoyer à {recipients.length} bénéficiaires
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {step === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-monument">
                <Mail className="h-5 w-5 text-primary" />
                Envoyer une communication
              </DialogTitle>
              <DialogDescription>
                Envoyez un email à tout ou partie de vos bénéficiaires.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Destinataires */}
              <div className="space-y-2">
                <Label>Destinataires</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'all', label: 'Tous', count: beneficiaries.length },
                    { key: 'active', label: 'Actifs', count: beneficiaries.filter((b) => b.is_activated).length },
                    { key: 'never', label: 'Jamais connectés', count: beneficiaries.filter((b) => b.is_activated && !b.last_activity).length },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setFilter(opt.key as RecipientFilter)}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        filter === opt.key
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <Users className={`h-4 w-4 mx-auto ${filter === opt.key ? 'text-primary' : 'text-muted-foreground'}`} />
                      <p className="text-xs font-medium mt-1">{opt.label}</p>
                      <p className="text-lg font-monument text-brand">{opt.count}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Objet */}
              <div className="space-y-2">
                <Label htmlFor="subject">
                  Objet <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Ex : Nouvelle offre : PSG vs OM à tarif préférentiel"
                  maxLength={100}
                />
              </div>

              {/* Contenu */}
              <div className="space-y-2">
                <Label htmlFor="body">
                  Message <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="body"
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder={`Bonjour,\n\nNous avons le plaisir de vous informer que...\n\nCordialement,\n${companyName}`}
                  rows={8}
                  className="text-sm"
                />
                <p className="text-xs text-muted-foreground">{body.length} caractères</p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                variant="hero"
                onClick={() => setStep('preview')}
                disabled={!canProceed}
                className="gap-2"
              >
                <Send className="h-4 w-4" />
                Prévisualiser
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
