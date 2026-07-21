import { useEffect, useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Users,
  User as UserIcon,
  FileUp,
  Loader2,
  Check,
  AlertCircle,
  Download,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

/**
 * DistributeWalletModal — Prio 2 CSE #5 + FIX-5
 * ─────────────────────────────────────────────────────────────────────────
 * 3 modes de distribution (retour Alex) :
 *  1. Répartition égale (masse totale)
 *  2. Individuel (sélection d'un bénéficiaire + montant)
 *  3. Import CSV (partielle par batch)
 */

interface BeneficiaryOpt {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string;
  allocated_budget: number | null;
}

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cseCompanyId: string;
  activeBeneficiariesCount: number;
  availableBudget: number;
  onSuccess?: () => void;
}

interface CsvResult {
  email: string;
  status: 'ok' | 'not_found' | 'invalid';
  amount: number;
}

export default function DistributeWalletModal({
  open,
  onOpenChange,
  cseCompanyId,
  activeBeneficiariesCount,
  availableBudget,
  onSuccess,
}: Props) {
  const [tab, setTab] = useState<'egal' | 'individuel' | 'csv'>('egal');
  const [isLoading, setIsLoading] = useState(false);

  // ── Mode "égal" ──
  const [egalAmount, setEgalAmount] = useState('');

  // ── Mode "individuel" ──
  const [beneficiaries, setBeneficiaries] = useState<BeneficiaryOpt[]>([]);
  const [selectedBenId, setSelectedBenId] = useState('');
  const [indivAmount, setIndivAmount] = useState('');

  // ── Mode "CSV" ──
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [csvItems, setCsvItems] = useState<{ email: string; amount: number }[]>([]);
  const [csvResults, setCsvResults] = useState<CsvResult[] | null>(null);

  // Load bénéficiaires pour le mode individuel
  useEffect(() => {
    if (open && cseCompanyId) {
      supabase
        .from('profiles')
        .select('id, first_name, last_name, email, allocated_budget')
        .eq('cse_company_id', cseCompanyId)
        .eq('role', 'beneficiary')
        .is('deleted_at', null)
        .order('last_name')
        .then(({ data }) => setBeneficiaries((data as BeneficiaryOpt[]) ?? []));
    }
  }, [open, cseCompanyId]);

  // ─── Distribution égale ──────────────────────────────────
  const handleEgal = async () => {
    const total = parseInt(egalAmount, 10);
    if (isNaN(total) || total <= 0) return;
    const perBen = Math.floor(total / activeBeneficiariesCount);
    if (perBen < 1) {
      toast.error('Montant trop faible pour être réparti entre les bénéficiaires');
      return;
    }
    if (perBen * activeBeneficiariesCount > availableBudget) {
      toast.error(`Le montant dépasse la cagnotte disponible (${availableBudget} €)`);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('distribute_to_beneficiaries', {
        p_cse_company_id: cseCompanyId,
        p_amount_per_beneficiary: perBen,
      });
      if (error) throw error;
      const res = Array.isArray(data) ? data[0] : data;
      toast.success(`${res?.total_distributed ?? perBen * activeBeneficiariesCount} € distribués à ${res?.updated_count ?? activeBeneficiariesCount} bénéficiaires`);
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(`Erreur : ${err.message ?? 'échec distribution'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Distribution individuelle ───────────────────────────
  const handleIndividual = async () => {
    const amt = parseInt(indivAmount, 10);
    if (!selectedBenId || isNaN(amt) || amt <= 0) return;

    setIsLoading(true);
    try {
      const { error } = await supabase.rpc('distribute_to_beneficiary', {
        p_beneficiary_id: selectedBenId,
        p_amount: amt,
      });
      if (error) throw error;
      const ben = beneficiaries.find((b) => b.id === selectedBenId);
      toast.success(`${amt} € distribués à ${ben?.first_name ?? ''} ${ben?.last_name ?? ''}`);
      handleClose();
      onSuccess?.();
    } catch (err: any) {
      toast.error(`Erreur : ${err.message ?? 'échec distribution'}`);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Import CSV ──────────────────────────────────────────
  const handleCsvUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCsvFile(file);
    setCsvResults(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      // Skip header if starts with "email"
      const rows = lines[0].toLowerCase().startsWith('email') ? lines.slice(1) : lines;
      const items = rows
        .map((line) => {
          const [email, amountStr] = line.split(/[,;]/).map((s) => s?.trim());
          return { email: email ?? '', amount: parseInt(amountStr ?? '0', 10) };
        })
        .filter((i) => i.email && i.amount > 0);
      setCsvItems(items);
    };
    reader.readAsText(file);
  };

  const handleCsvSubmit = async () => {
    if (csvItems.length === 0) return;
    const totalCsv = csvItems.reduce((s, i) => s + i.amount, 0);
    if (totalCsv > availableBudget) {
      toast.error(`Le total CSV (${totalCsv} €) dépasse la cagnotte (${availableBudget} €)`);
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('distribute_csv', { p_items: csvItems });
      if (error) throw error;
      setCsvResults(data as CsvResult[]);
      const okCount = (data as CsvResult[]).filter((r) => r.status === 'ok').length;
      toast.success(`${okCount} / ${csvItems.length} bénéficiaires crédités`);
      onSuccess?.();
    } catch (err: any) {
      toast.error(`Erreur : ${err.message ?? 'échec import'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadTemplate = () => {
    const csv = 'email,amount\nmarie.charon@seatup.co,50\npierre.martin@orus.fr,75\n';
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_distribution.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClose = () => {
    if (isLoading) return;
    setTab('egal');
    setEgalAmount('');
    setSelectedBenId('');
    setIndivAmount('');
    setCsvFile(null);
    setCsvItems([]);
    setCsvResults(null);
    onOpenChange(false);
  };

  const noActive = activeBeneficiariesCount === 0;
  const csvTotal = csvItems.reduce((s, i) => s + i.amount, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-monument">
            <Users className="h-5 w-5 text-primary" />
            Distribuer aux bénéficiaires
          </DialogTitle>
          <DialogDescription>
            3 modes disponibles. Cagnotte disponible :{' '}
            <strong className="text-brand">{availableBudget.toLocaleString('fr-FR')} €</strong>
          </DialogDescription>
        </DialogHeader>

        {noActive ? (
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-sm text-amber-900">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <p>
              Aucun bénéficiaire actif dans votre CSE. Ajoutez d'abord des bénéficiaires et
              assurez-vous qu'ils ont activé leur compte.
            </p>
          </div>
        ) : (
          <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="egal">
                <Users className="h-4 w-4 mr-1" />
                Égalitaire
              </TabsTrigger>
              <TabsTrigger value="individuel">
                <UserIcon className="h-4 w-4 mr-1" />
                Individuel
              </TabsTrigger>
              <TabsTrigger value="csv">
                <FileUp className="h-4 w-4 mr-1" />
                Import CSV
              </TabsTrigger>
            </TabsList>

            {/* ═══ MODE ÉGAL ═══ */}
            <TabsContent value="egal" className="space-y-4 pt-4">
              <div className="rounded-xl bg-muted p-3 text-sm space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bénéficiaires actifs</span>
                  <span className="font-medium">{activeBeneficiariesCount}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="egalAmt">
                  Montant global à distribuer <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="egalAmt"
                    type="number"
                    min="1"
                    value={egalAmount}
                    onChange={(e) => setEgalAmount(e.target.value)}
                    placeholder="5000"
                    disabled={isLoading}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                </div>
              </div>

              {parseInt(egalAmount, 10) > 0 && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-4 text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Par bénéficiaire</span>
                    <span className="font-medium">
                      {Math.floor(parseInt(egalAmount, 10) / activeBeneficiariesCount)} €
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Distribué au total</span>
                    <span className="font-medium">
                      {Math.floor(parseInt(egalAmount, 10) / activeBeneficiariesCount) *
                        activeBeneficiariesCount}{' '}
                      €
                    </span>
                  </div>
                </div>
              )}

              <Button
                variant="hero"
                onClick={handleEgal}
                disabled={!egalAmount || isLoading}
                className="w-full gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Distribuer à tous
              </Button>
            </TabsContent>

            {/* ═══ MODE INDIVIDUEL ═══ */}
            <TabsContent value="individuel" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="benSel">
                  Bénéficiaire <span className="text-destructive">*</span>
                </Label>
                <Select value={selectedBenId} onValueChange={setSelectedBenId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez un bénéficiaire..." />
                  </SelectTrigger>
                  <SelectContent>
                    {beneficiaries.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.first_name} {b.last_name} · {b.email} · {b.allocated_budget ?? 0} €
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="indivAmt">
                  Montant à ajouter <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="indivAmt"
                    type="number"
                    min="1"
                    value={indivAmount}
                    onChange={(e) => setIndivAmount(e.target.value)}
                    placeholder="100"
                    disabled={isLoading}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">€</span>
                </div>
              </div>

              <Button
                variant="hero"
                onClick={handleIndividual}
                disabled={!selectedBenId || !indivAmount || isLoading}
                className="w-full gap-2"
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Créditer ce bénéficiaire
              </Button>
            </TabsContent>

            {/* ═══ MODE CSV ═══ */}
            <TabsContent value="csv" className="space-y-4 pt-4">
              <div className="rounded-xl bg-muted p-3 text-xs space-y-2">
                <p className="font-medium">Format attendu :</p>
                <code className="block bg-white p-2 rounded text-xs font-mono">
                  email,amount
                  <br />
                  marie.charon@seatup.co,50
                  <br />
                  pierre.martin@orus.fr,75
                </code>
                <Button variant="outline" size="sm" onClick={downloadTemplate} className="gap-1 h-7">
                  <Download className="h-3 w-3" />
                  Template CSV
                </Button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="csv">Fichier CSV</Label>
                <Input
                  id="csv"
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleCsvUpload}
                  disabled={isLoading}
                  className="file:mr-3 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-sm file:bg-primary file:text-white hover:file:bg-primary/90"
                />
              </div>

              {csvItems.length > 0 && !csvResults && (
                <div className="rounded-xl bg-primary/5 border border-primary/20 p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Lignes valides</span>
                    <span className="font-medium">{csvItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Total à distribuer</span>
                    <span className="font-medium">{csvTotal.toLocaleString('fr-FR')} €</span>
                  </div>
                  <div className="max-h-32 overflow-y-auto text-xs bg-white rounded p-2 space-y-1">
                    {csvItems.slice(0, 20).map((i, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="truncate">{i.email}</span>
                        <span className="font-medium">{i.amount} €</span>
                      </div>
                    ))}
                    {csvItems.length > 20 && (
                      <p className="text-center text-muted-foreground">… et {csvItems.length - 20} de plus</p>
                    )}
                  </div>
                </div>
              )}

              {csvResults && (
                <div className="rounded-xl bg-muted p-3 space-y-1 max-h-40 overflow-y-auto">
                  <p className="font-medium text-sm mb-2">Résultats :</p>
                  {csvResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="truncate flex-1">{r.email}</span>
                      <span className="font-medium">{r.amount} €</span>
                      {r.status === 'ok' ? (
                        <Check className="h-3 w-3 text-green-600 ml-2" />
                      ) : (
                        <span className="text-red-600 ml-2 text-xs">
                          {r.status === 'not_found' ? 'Introuvable' : 'Invalide'}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {!csvResults ? (
                <Button
                  variant="hero"
                  onClick={handleCsvSubmit}
                  disabled={csvItems.length === 0 || isLoading}
                  className="w-full gap-2"
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  Distribuer selon CSV
                </Button>
              ) : (
                <Button variant="hero" onClick={handleClose} className="w-full">
                  Fermer
                </Button>
              )}
            </TabsContent>
          </Tabs>
        )}

        {noActive && (
          <DialogFooter>
            <Button variant="outline" onClick={handleClose}>Fermer</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
