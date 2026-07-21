import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowLeft, Search, Download, Loader2, FileText, ArrowUpDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';
import { PeriodFilter, defaultPeriod, type PeriodRange } from '@/components/PeriodFilter';
import { toast } from 'sonner';

/**
 * MerchantInvoices — Prio 3 Marchand : Historique factures
 * ─────────────────────────────────────────────────────────────────────────
 * Table paginated des invoices de l'organizer connecté avec filtre période,
 * recherche par numéro, badges statut, download PDF (généré côté client).
 */

interface Invoice {
  id: string;
  invoice_number: string;
  period_start: string;
  period_end: string;
  total_amount: number;
  status: 'pending' | 'paid' | 'overdue';
  paid_at: string | null;
  created_at: string;
}

const MerchantInvoices = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [period, setPeriod] = useState<PeriodRange>(defaultPeriod);
  const [sortKey, setSortKey] = useState<'date' | 'amount'>('date');
  const [sortAsc, setSortAsc] = useState(false);

  const organizerId = (userProfile as any)?.organizer_id;

  useEffect(() => {
    const load = async () => {
      if (!organizerId) return;
      setLoading(true);
      let q = supabase
        .from('invoices')
        .select('*')
        .eq('organizer_id', organizerId);

      if (period.from) q = q.gte('period_start', period.from.toISOString().slice(0, 10));
      if (period.to) q = q.lte('period_end', period.to.toISOString().slice(0, 10));

      const { data, error } = await q.order('created_at', { ascending: false });
      if (error) console.error('Load invoices:', error);
      setInvoices((data as Invoice[]) ?? []);
      setLoading(false);
    };
    load();
  }, [organizerId, period]);

  const filtered = useMemo(() => {
    let arr = invoices;
    if (search.trim()) {
      const q = search.toLowerCase();
      arr = arr.filter((i) => i.invoice_number.toLowerCase().includes(q));
    }
    return [...arr].sort((a, b) => {
      let cmp = 0;
      if (sortKey === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else cmp = a.total_amount - b.total_amount;
      return sortAsc ? cmp : -cmp;
    });
  }, [invoices, search, sortKey, sortAsc]);

  const toggleSort = (k: 'date' | 'amount') => {
    if (sortKey === k) setSortAsc(!sortAsc);
    else { setSortKey(k); setSortAsc(true); }
  };

  const downloadInvoicePDF = (invoice: Invoice) => {
    // Génération PDF simplifiée côté client : HTML → print-friendly
    const win = window.open('', '_blank');
    if (!win) return toast.error('Le popup a été bloqué. Autorisez les popups pour télécharger.');

    win.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Facture ${invoice.invoice_number}</title>
        <style>
          body { font-family: -apple-system, sans-serif; padding: 40px; max-width: 700px; margin: 0 auto; color: #1C1C1C; }
          h1 { color: #3A7BFF; font-size: 28px; margin-bottom: 4px; }
          .subtitle { color: #666; font-size: 14px; margin-bottom: 32px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 32px; }
          .block h3 { font-size: 12px; text-transform: uppercase; color: #666; margin-bottom: 8px; letter-spacing: 0.5px; }
          .block p { margin: 2px 0; font-size: 14px; }
          .amount-box { background: #F5F5F5; padding: 24px; border-radius: 12px; text-align: right; margin: 32px 0; }
          .amount-box .label { font-size: 12px; text-transform: uppercase; color: #666; }
          .amount-box .amount { font-size: 36px; font-weight: bold; color: #3A7BFF; }
          .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
          .status.paid { background: #DCFCE7; color: #166534; }
          .status.pending { background: #FEF3C7; color: #92400E; }
          .status.overdue { background: #FEE2E2; color: #991B1B; }
          .footer { margin-top: 48px; padding-top: 24px; border-top: 1px solid #ddd; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <h1>FACTURE</h1>
        <p class="subtitle">N° ${invoice.invoice_number}</p>

        <div class="grid">
          <div class="block">
            <h3>Émetteur</h3>
            <p><strong>Seatup SAS</strong></p>
            <p>Plateforme de billetterie sportive</p>
            <p>contact@seatup.co</p>
          </div>
          <div class="block">
            <h3>Destinataire</h3>
            <p><strong>${userProfile?.company_name ?? 'Organisateur'}</strong></p>
            <p>${userProfile?.email ?? ''}</p>
          </div>
        </div>

        <div class="grid">
          <div class="block">
            <h3>Période facturée</h3>
            <p>Du ${new Date(invoice.period_start).toLocaleDateString('fr-FR')}<br>
               au ${new Date(invoice.period_end).toLocaleDateString('fr-FR')}</p>
          </div>
          <div class="block">
            <h3>Statut</h3>
            <span class="status ${invoice.status}">${
              invoice.status === 'paid' ? 'PAYÉE' : invoice.status === 'pending' ? 'EN ATTENTE' : 'EN RETARD'
            }</span>
            ${invoice.paid_at ? `<p style="margin-top:8px">Payée le ${new Date(invoice.paid_at).toLocaleDateString('fr-FR')}</p>` : ''}
          </div>
        </div>

        <div class="amount-box">
          <div class="label">Montant total TTC</div>
          <div class="amount">${invoice.total_amount.toLocaleString('fr-FR')} €</div>
        </div>

        <div class="footer">
          Facture générée le ${new Date().toLocaleDateString('fr-FR')} · Seatup — Vivez le sport, simplement
        </div>

        <script>window.print()</script>
      </body>
      </html>
    `);
    win.document.close();
  };

  const getStatusBadge = (status: string) => {
    if (status === 'paid') return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Payée</Badge>;
    if (status === 'pending') return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">En attente</Badge>;
    return <Badge className="bg-red-100 text-red-700 hover:bg-red-100">En retard</Badge>;
  };

  if (!organizerId) return <div className="p-8 text-center text-muted-foreground">Non autorisé</div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-white/95 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-6 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-monument text-brand">Historique des factures</h1>
              <p className="text-sm text-muted-foreground">
                Consultez et téléchargez vos factures Seatup
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un n° de facture..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 w-80"
            />
          </div>
          <PeriodFilter value={period} onChange={setPeriod} />
        </div>

        <Card className="card-sport">
          <CardHeader>
            <CardTitle className="font-monument text-brand">
              {filtered.length} facture{filtered.length > 1 ? 's' : ''}
            </CardTitle>
            <CardDescription>Cliquez sur une ligne pour télécharger la facture PDF</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="py-12 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
            ) : filtered.length === 0 ? (
              <div className="py-12 text-center text-muted-foreground text-sm">
                Aucune facture disponible pour cette période.
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>N° facture</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => toggleSort('date')}>
                      <div className="flex items-center gap-1">Date d'émission <ArrowUpDown className="h-3 w-3" /></div>
                    </TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead className="cursor-pointer hover:text-primary" onClick={() => toggleSort('amount')}>
                      <div className="flex items-center gap-1">Montant <ArrowUpDown className="h-3 w-3" /></div>
                    </TableHead>
                    <TableHead>Statut</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map((inv) => (
                    <TableRow key={inv.id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-sm font-medium">{inv.invoice_number}</TableCell>
                      <TableCell className="text-sm">
                        {new Date(inv.created_at).toLocaleDateString('fr-FR')}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(inv.period_start).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })} → {new Date(inv.period_end).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </TableCell>
                      <TableCell className="font-semibold">{inv.total_amount.toLocaleString('fr-FR')} €</TableCell>
                      <TableCell>{getStatusBadge(inv.status)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => downloadInvoicePDF(inv)} className="gap-1">
                          <Download className="h-3 w-3" />
                          PDF
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MerchantInvoices;
