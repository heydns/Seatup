/**
 * ImportBeneficiariesModal — Import en masse de bénéficiaires CSE (V1)
 * ─────────────────────────────────────────────────────────────────────────
 * User story V1 : "Gérer les bénéficiaires via Excel et gérer le turnover"
 *
 * Format attendu du CSV (colonnes obligatoires) :
 *   identifier,first_name,last_name,email
 *   AB123,Marie,Dupont,marie.dupont@entreprise.fr
 *
 * Fonctionnalités :
 *   - Upload CSV (XLSX à venir en V1.5 avec SheetJS)
 *   - Parsing avec gestion des guillemets, virgules dans champs, etc.
 *   - Validation ligne par ligne (format email, doublons dans fichier, doublons DB)
 *   - Preview avant import
 *   - Rapport d'erreurs détaillé (ligne + colonne + raison)
 *   - Import en batch Supabase + rapport final (succès/erreurs)
 *   - Template CSV téléchargeable
 */

import { useState, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Upload,
  FileText,
  Download,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EXPECTED_COLUMNS = ['identifier', 'first_name', 'last_name', 'email'] as const;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cseCompanyId: string;
  onSuccess?: () => void;
}

type Step = 'upload' | 'preview' | 'importing' | 'result';

interface ParsedRow {
  line: number; // 1-indexed, inclut la ligne d'en-tête
  identifier: string;
  first_name: string;
  last_name: string;
  email: string;
  errors: string[];
  isDuplicate: boolean;
  isDuplicateInDb: boolean;
}

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: Array<{ line: number; email: string; reason: string }>;
}

// Parser CSV minimaliste (gère guillemets)
const parseCsvLine = (line: string): string[] => {
  const result: string[] = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (c === ',' && !inQuotes) {
      result.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  result.push(cur.trim());
  return result;
};

export const ImportBeneficiariesModal = ({ open, onOpenChange, cseCompanyId, onSuccess }: Props) => {
  const [step, setStep] = useState<Step>('upload');
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStep('upload');
    setRows([]);
    setResult(null);
    setIsProcessing(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    reset();
    onOpenChange(false);
  };

  // ─── Téléchargement du template CSV ─────────────────────────────────
  const downloadTemplate = () => {
    const csv =
      'identifier,first_name,last_name,email\n' +
      'AB001,Marie,Dupont,marie.dupont@entreprise.fr\n' +
      'AB002,Thomas,Martin,thomas.martin@entreprise.fr\n';
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'seatup-beneficiaires-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  // ─── Parse + valide le fichier uploadé ──────────────────────────────
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isXlsx = /\.xlsx?$/i.test(file.name);
    if (isXlsx) {
      toast.error('Format Excel (.xlsx) non supporté en V1 — convertissez en CSV (Fichier → Enregistrer sous → CSV).');
      return;
    }

    if (!/\.csv$/i.test(file.name)) {
      toast.error('Fichier non reconnu. Utilisez un .csv.');
      return;
    }

    setIsProcessing(true);
    try {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);

      if (lines.length < 2) {
        toast.error('Fichier vide ou invalide');
        setIsProcessing(false);
        return;
      }

      // Validation de l'en-tête
      const header = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
      const missingCols = EXPECTED_COLUMNS.filter((col) => !header.includes(col));
      if (missingCols.length > 0) {
        toast.error(
          `Colonnes manquantes : ${missingCols.join(', ')}. Téléchargez le template pour voir le format attendu.`,
          { duration: 8000 }
        );
        setIsProcessing(false);
        return;
      }

      const colIdx: Record<typeof EXPECTED_COLUMNS[number], number> = {
        identifier: header.indexOf('identifier'),
        first_name: header.indexOf('first_name'),
        last_name: header.indexOf('last_name'),
        email: header.indexOf('email'),
      };

      // Parse les lignes
      const parsedRows: ParsedRow[] = [];
      const emailsInFile = new Map<string, number[]>(); // email → lignes

      for (let i = 1; i < lines.length; i++) {
        const cells = parseCsvLine(lines[i]);
        const line = i + 1; // 1-indexed, +1 car on skip l'en-tête
        const row: ParsedRow = {
          line,
          identifier: cells[colIdx.identifier] ?? '',
          first_name: cells[colIdx.first_name] ?? '',
          last_name: cells[colIdx.last_name] ?? '',
          email: (cells[colIdx.email] ?? '').toLowerCase(),
          errors: [],
          isDuplicate: false,
          isDuplicateInDb: false,
        };

        if (!row.identifier) row.errors.push('Identifier manquant');
        if (!row.first_name) row.errors.push('Prénom manquant');
        if (!row.last_name) row.errors.push('Nom manquant');
        if (!row.email) row.errors.push('Email manquant');
        else if (!EMAIL_REGEX.test(row.email)) row.errors.push("Format d'email invalide");

        if (row.email) {
          const existing = emailsInFile.get(row.email);
          if (existing) existing.push(line);
          else emailsInFile.set(row.email, [line]);
        }

        parsedRows.push(row);
      }

      // Marque les doublons dans le fichier
      emailsInFile.forEach((linesList) => {
        if (linesList.length > 1) {
          linesList.forEach((ln) => {
            const r = parsedRows.find((p) => p.line === ln);
            if (r) {
              r.isDuplicate = true;
              r.errors.push(`Doublon avec ligne(s) ${linesList.filter((x) => x !== ln).join(', ')}`);
            }
          });
        }
      });

      // Check doublons en DB (sur les emails valides)
      const validEmails = parsedRows.filter((r) => r.errors.length === 0).map((r) => r.email);
      if (validEmails.length > 0) {
        const { data: existingProfiles } = await supabase
          .from('profiles')
          .select('email')
          .in('email', validEmails)
          .eq('cse_company_id', cseCompanyId);

        if (existingProfiles) {
          const existingEmails = new Set(existingProfiles.map((p: any) => p.email?.toLowerCase()));
          parsedRows.forEach((r) => {
            if (existingEmails.has(r.email)) {
              r.isDuplicateInDb = true;
              r.errors.push('Déjà bénéficiaire du CSE');
            }
          });
        }
      }

      setRows(parsedRows);
      setStep('preview');
    } catch (err) {
      console.error('[import] Parse error:', err);
      toast.error('Erreur à la lecture du fichier');
    } finally {
      setIsProcessing(false);
    }
  };

  // ─── Lance l'import en DB ───────────────────────────────────────────
  const handleImport = async () => {
    const validRows = rows.filter((r) => r.errors.length === 0);
    if (validRows.length === 0) {
      toast.error('Aucune ligne valide à importer');
      return;
    }

    setStep('importing');
    const importResult: ImportResult = {
      total: rows.length,
      imported: 0,
      skipped: rows.length - validRows.length,
      errors: [],
    };

    // Insertion par batch de 50
    const BATCH_SIZE = 50;
    for (let i = 0; i < validRows.length; i += BATCH_SIZE) {
      const batch = validRows.slice(i, i + BATCH_SIZE);
      const payload = batch.map((r) => ({
        cse_company_id: cseCompanyId,
        email: r.email,
        first_name: r.first_name,
        last_name: r.last_name,
        identifier: r.identifier,
        role: 'beneficiary',
      }));

      const { error } = await supabase.from('profiles').insert(payload as any);

      if (error) {
        console.error('[import] Batch error:', error);
        batch.forEach((r) => {
          importResult.errors.push({
            line: r.line,
            email: r.email,
            reason: error.message || 'Erreur DB',
          });
        });
      } else {
        importResult.imported += batch.length;
      }
    }

    // Collecte les erreurs des lignes invalides (en haut du rapport)
    rows
      .filter((r) => r.errors.length > 0)
      .forEach((r) => {
        importResult.errors.push({
          line: r.line,
          email: r.email || '(vide)',
          reason: r.errors.join(' · '),
        });
      });

    setResult(importResult);
    setStep('result');
    if (importResult.imported > 0) {
      toast.success(`${importResult.imported} bénéficiaire${importResult.imported > 1 ? 's' : ''} importé${importResult.imported > 1 ? 's' : ''}`);
      onSuccess?.();
    }
  };

  // ─── Téléchargement du rapport d'erreurs ────────────────────────────
  const downloadErrorReport = () => {
    if (!result) return;
    const csv =
      'line,email,reason\n' +
      result.errors
        .map((e) => `${e.line},"${e.email}","${e.reason.replace(/"/g, '""')}"`)
        .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seatup-import-errors-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = rows.filter((r) => r.errors.length === 0).length;
  const errorCount = rows.filter((r) => r.errors.length > 0).length;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-monument">Importer des bénéficiaires</DialogTitle>
          <DialogDescription>
            Ajoutez plusieurs bénéficiaires d'un coup via un fichier CSV.
          </DialogDescription>
        </DialogHeader>

        {/* ═══ STEP 1 : UPLOAD ═════════════════════════════════════════ */}
        {step === 'upload' && (
          <div className="space-y-5 py-4">
            <Alert>
              <FileText className="h-4 w-4" />
              <AlertDescription>
                Format attendu : <strong>CSV</strong> avec les colonnes{' '}
                <code className="text-xs bg-muted px-1 rounded">identifier, first_name, last_name, email</code>.
                <br />
                <button
                  onClick={downloadTemplate}
                  className="text-primary hover:underline inline-flex items-center gap-1 mt-2 text-sm"
                >
                  <Download className="h-3 w-3" />
                  Télécharger le template CSV
                </button>
              </AlertDescription>
            </Alert>

            <div className="border-2 border-dashed rounded-xl p-8 text-center hover:bg-muted/30 transition-colors">
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                disabled={isProcessing}
                className="hidden"
                id="csv-upload"
              />
              <label htmlFor="csv-upload" className="cursor-pointer">
                {isProcessing ? (
                  <Loader2 className="h-12 w-12 text-primary mx-auto mb-3 animate-spin" />
                ) : (
                  <Upload className="h-12 w-12 text-primary mx-auto mb-3" />
                )}
                <p className="font-medium">
                  {isProcessing ? 'Analyse en cours...' : 'Cliquez pour sélectionner un fichier'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">CSV uniquement — max 10 MB</p>
              </label>
            </div>
          </div>
        )}

        {/* ═══ STEP 2 : PREVIEW ════════════════════════════════════════ */}
        {step === 'preview' && (
          <div className="space-y-4 py-4">
            <div className="flex gap-3">
              <Badge variant="default" className="bg-green-100 text-green-800 hover:bg-green-100">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                {validCount} valide{validCount > 1 ? 's' : ''}
              </Badge>
              {errorCount > 0 && (
                <Badge variant="destructive">
                  <XCircle className="h-3 w-3 mr-1" />
                  {errorCount} erreur{errorCount > 1 ? 's' : ''}
                </Badge>
              )}
            </div>

            <div className="max-h-96 overflow-y-auto border rounded-lg">
              <table className="w-full text-xs">
                <thead className="bg-muted sticky top-0">
                  <tr>
                    <th className="p-2 text-left">Ligne</th>
                    <th className="p-2 text-left">Identifier</th>
                    <th className="p-2 text-left">Email</th>
                    <th className="p-2 text-left">Nom</th>
                    <th className="p-2 text-left">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.line}
                      className={`border-t ${
                        r.errors.length > 0 ? 'bg-red-50' : ''
                      }`}
                    >
                      <td className="p-2 font-mono">{r.line}</td>
                      <td className="p-2">{r.identifier || '—'}</td>
                      <td className="p-2 truncate max-w-[180px]">{r.email || '—'}</td>
                      <td className="p-2">
                        {r.first_name} {r.last_name}
                      </td>
                      <td className="p-2">
                        {r.errors.length === 0 ? (
                          <span className="text-green-600 inline-flex items-center gap-1">
                            <CheckCircle2 className="h-3 w-3" /> OK
                          </span>
                        ) : (
                          <span className="text-red-600 text-xs">{r.errors.join(' · ')}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {errorCount > 0 && validCount > 0 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Les lignes en erreur seront ignorées. Seules les {validCount} lignes valides seront importées.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* ═══ STEP 3 : IMPORT EN COURS ════════════════════════════════ */}
        {step === 'importing' && (
          <div className="py-12 text-center">
            <Loader2 className="h-12 w-12 text-primary mx-auto animate-spin mb-4" />
            <p className="font-medium">Import en cours...</p>
            <p className="text-sm text-muted-foreground mt-1">Ne fermez pas la fenêtre</p>
          </div>
        )}

        {/* ═══ STEP 4 : RÉSULTAT ═══════════════════════════════════════ */}
        {step === 'result' && result && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg bg-muted p-4 text-center">
                <div className="text-2xl font-bold">{result.total}</div>
                <div className="text-xs text-muted-foreground">Total lignes</div>
              </div>
              <div className="rounded-lg bg-green-50 p-4 text-center">
                <div className="text-2xl font-bold text-green-600">{result.imported}</div>
                <div className="text-xs text-green-700">Importés</div>
              </div>
              <div className="rounded-lg bg-red-50 p-4 text-center">
                <div className="text-2xl font-bold text-red-600">
                  {result.total - result.imported}
                </div>
                <div className="text-xs text-red-700">Erreurs</div>
              </div>
            </div>

            {result.errors.length > 0 && (
              <>
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Téléchargez le rapport d'erreurs pour voir le détail ligne par ligne.
                  </AlertDescription>
                </Alert>
                <Button variant="outline" onClick={downloadErrorReport} className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger le rapport d'erreurs
                </Button>
              </>
            )}
          </div>
        )}

        <DialogFooter>
          {step === 'preview' && (
            <>
              <Button variant="outline" onClick={reset}>
                <ArrowLeft className="h-4 w-4 mr-1" />
                Changer de fichier
              </Button>
              <Button
                variant="hero"
                onClick={handleImport}
                disabled={validCount === 0 || isProcessing}
              >
                Importer {validCount} bénéficiaire{validCount > 1 ? 's' : ''}
              </Button>
            </>
          )}
          {step === 'result' && (
            <Button variant="hero" onClick={handleClose}>
              Fermer
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
