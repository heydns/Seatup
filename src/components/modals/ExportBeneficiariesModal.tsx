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
import { Label } from '@/components/ui/label';
import { Download, Loader2, FileSpreadsheet, FileText, Check } from 'lucide-react';
import { toast } from 'sonner';

/**
 * ExportBeneficiariesModal — Prio 3 CSE : Export CSV/Excel
 * ─────────────────────────────────────────────────────────────────────────
 * Modal de sélection : statut à inclure + format. Génère et download le
 * fichier côté client (pas de round-trip serveur).
 */

export interface BeneficiaryForExport {
  first_name: string | null;
  last_name: string | null;
  email: string;
  is_activated: boolean;
  last_activity: string | null;
  created_at: string;
}

type StatusFilter = 'active' | 'inactive' | 'all';
type Format = 'csv' | 'xlsx';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  beneficiaries: BeneficiaryForExport[];
}

const escapeCsv = (v: string | null | undefined) => {
  if (v == null) return '';
  const s = String(v);
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return '"' + s.replace(/"/g, '""') + '"';
  }
  return s;
};

export default function ExportBeneficiariesModal({ open, onOpenChange, beneficiaries }: Props) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [format, setFormat] = useState<Format>('csv');
  const [isLoading, setIsLoading] = useState(false);
  const [done, setDone] = useState(false);

  const filtered = beneficiaries.filter((b) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return b.is_activated;
    return !b.is_activated;
  });

  const handleExport = async () => {
    if (filtered.length === 0) {
      toast.error('Aucun bénéficiaire à exporter avec ce filtre.');
      return;
    }

    setIsLoading(true);
    // Simule un léger delay pour l'UX
    await new Promise((r) => setTimeout(r, 500));

    const headers = ['Prénom', 'Nom', 'Email', 'Statut', 'Date d\'ajout', 'Dernière connexion'];
    const rows = filtered.map((b) => [
      b.first_name ?? '',
      b.last_name ?? '',
      b.email,
      b.is_activated ? 'Actif' : 'Inactif',
      new Date(b.created_at).toLocaleDateString('fr-FR'),
      b.last_activity ? new Date(b.last_activity).toLocaleDateString('fr-FR') : 'Jamais',
    ]);

    const today = new Date().toISOString().slice(0, 10);

    if (format === 'csv') {
      const csv = [
        headers.map(escapeCsv).join(','),
        ...rows.map((r) => r.map(escapeCsv).join(',')),
      ].join('\n');

      const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seatup-beneficiaires-${today}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      // XLSX simplifié : on génère un fichier XML compatible Excel
      // (format SpreadsheetML — Excel 2003+, universel, pas besoin de lib)
      const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
          xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Styles>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#FFFFFF"/>
      <Interior ss:Color="#3A7BFF" ss:Pattern="Solid"/>
    </Style>
  </Styles>
  <Worksheet ss:Name="Bénéficiaires">
    <Table>
      <Row ss:StyleID="Header">
        ${headers.map((h) => `<Cell><Data ss:Type="String">${h}</Data></Cell>`).join('')}
      </Row>
      ${rows
        .map(
          (r) =>
            `<Row>${r
              .map(
                (c) =>
                  `<Cell><Data ss:Type="String">${String(c).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`
              )
              .join('')}</Row>`
        )
        .join('\n')}
    </Table>
  </Worksheet>
</Workbook>`;
      const blob = new Blob([xml], { type: 'application/vnd.ms-excel' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `seatup-beneficiaires-${today}.xls`;
      a.click();
      URL.revokeObjectURL(url);
    }

    setDone(true);
    setIsLoading(false);
    toast.success(`Export prêt à télécharger (${filtered.length} bénéficiaires)`);
  };

  const handleClose = () => {
    if (isLoading) return;
    setStatusFilter('all');
    setFormat('csv');
    setDone(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        {done ? (
          <div className="py-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-monument mb-2">Export prêt !</h3>
            <p className="text-muted-foreground mb-4">
              <strong className="text-brand">{filtered.length}</strong> bénéficiaires exportés
              au format <strong>{format.toUpperCase()}</strong>. Le fichier a été téléchargé
              automatiquement.
            </p>
            <Button variant="hero" onClick={handleClose} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 font-monument">
                <Download className="h-5 w-5 text-primary" />
                Exporter les bénéficiaires
              </DialogTitle>
              <DialogDescription>
                Choisissez les bénéficiaires à inclure et le format du fichier.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-5 py-2">
              {/* Statut */}
              <div className="space-y-2">
                <Label>Statut à inclure</Label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { key: 'active', label: 'Actifs uniquement', count: beneficiaries.filter((b) => b.is_activated).length },
                    { key: 'inactive', label: 'Inactifs uniquement', count: beneficiaries.filter((b) => !b.is_activated).length },
                    { key: 'all', label: 'Tous', count: beneficiaries.length },
                  ].map((opt) => (
                    <button
                      key={opt.key}
                      type="button"
                      onClick={() => setStatusFilter(opt.key as StatusFilter)}
                      className={`rounded-xl border-2 p-3 text-center transition-all ${
                        statusFilter === opt.key
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/40'
                      }`}
                    >
                      <p className="text-xs font-medium">{opt.label}</p>
                      <p className="text-lg font-monument text-brand mt-1">{opt.count}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Format */}
              <div className="space-y-2">
                <Label>Format du fichier</Label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormat('csv')}
                    className={`rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${
                      format === 'csv' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <FileText className={`h-6 w-6 ${format === 'csv' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-left">
                      <p className="font-semibold text-sm">CSV</p>
                      <p className="text-xs text-muted-foreground">Universel</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormat('xlsx')}
                    className={`rounded-xl border-2 p-4 flex items-center gap-3 transition-all ${
                      format === 'xlsx' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/40'
                    }`}
                  >
                    <FileSpreadsheet className={`h-6 w-6 ${format === 'xlsx' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <div className="text-left">
                      <p className="font-semibold text-sm">Excel</p>
                      <p className="text-xs text-muted-foreground">Ouvre dans Excel</p>
                    </div>
                  </button>
                </div>
              </div>

              {/* Récap RGPD */}
              <div className="rounded-xl bg-muted p-3 text-xs">
                <p className="font-medium mb-1">🔒 Données incluses (conformité RGPD)</p>
                <p className="text-muted-foreground">
                  Prénom · Nom · Email · Statut · Date d'ajout · Dernière connexion
                </p>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose} disabled={isLoading}>
                Annuler
              </Button>
              <Button
                variant="hero"
                onClick={handleExport}
                disabled={filtered.length === 0 || isLoading}
                className="gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Génération…
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Exporter {filtered.length}
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
