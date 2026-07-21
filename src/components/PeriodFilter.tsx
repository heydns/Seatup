import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Calendar as CalIcon, Check } from 'lucide-react';

/**
 * PeriodFilter — Sélecteur de période réutilisable (Prio 3)
 * ─────────────────────────────────────────────────────────────────────────
 * Utilisé sur dashboards CSE et Marchand + page factures + stats.
 * Émet un objet { from, to } (Date | null) que le parent utilise pour filtrer.
 */

export type PeriodRange = { from: Date | null; to: Date | null; label: string };

interface PresetOption {
  key: string;
  label: string;
  compute: () => PeriodRange;
}

const PRESETS: PresetOption[] = [
  {
    key: 'month',
    label: 'Ce mois-ci',
    compute: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), now.getMonth(), 1);
      const to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
      return { from, to, label: 'Ce mois-ci' };
    },
  },
  {
    key: '30d',
    label: '30 derniers jours',
    compute: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      return { from, to, label: '30 derniers jours' };
    },
  },
  {
    key: 'quarter',
    label: 'Ce trimestre',
    compute: () => {
      const now = new Date();
      const q = Math.floor(now.getMonth() / 3);
      const from = new Date(now.getFullYear(), q * 3, 1);
      const to = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59);
      return { from, to, label: 'Ce trimestre' };
    },
  },
  {
    key: 'year',
    label: 'Cette année',
    compute: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1);
      const to = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
      return { from, to, label: 'Cette année' };
    },
  },
  {
    key: 'all',
    label: 'Depuis toujours',
    compute: () => ({ from: null, to: null, label: 'Depuis toujours' }),
  },
];

interface Props {
  value: PeriodRange;
  onChange: (period: PeriodRange) => void;
}

export function PeriodFilter({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState<Date | undefined>(value.from ?? undefined);
  const [customTo, setCustomTo] = useState<Date | undefined>(value.to ?? undefined);
  const [pickingCustom, setPickingCustom] = useState(false);

  const applyPreset = (preset: PresetOption) => {
    onChange(preset.compute());
    setOpen(false);
    setPickingCustom(false);
  };

  const applyCustom = () => {
    if (!customFrom || !customTo) return;
    const from = new Date(customFrom);
    from.setHours(0, 0, 0, 0);
    const to = new Date(customTo);
    to.setHours(23, 59, 59, 999);
    const label = `${from.toLocaleDateString('fr-FR')} → ${to.toLocaleDateString('fr-FR')}`;
    onChange({ from, to, label });
    setOpen(false);
    setPickingCustom(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[180px] justify-start">
          <CalIcon className="h-4 w-4" />
          <span className="font-medium">{value.label}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white border shadow-lg z-50" align="end">
        {pickingCustom ? (
          <div className="p-3 space-y-3">
            <p className="text-xs font-semibold text-muted-foreground">Du</p>
            <CalendarComponent
              mode="single"
              selected={customFrom}
              onSelect={setCustomFrom}
              className="p-0"
            />
            <p className="text-xs font-semibold text-muted-foreground">Au</p>
            <CalendarComponent
              mode="single"
              selected={customTo}
              onSelect={setCustomTo}
              className="p-0"
            />
            <div className="flex gap-2 pt-2 border-t">
              <Button variant="outline" size="sm" onClick={() => setPickingCustom(false)}>
                Retour
              </Button>
              <Button
                variant="hero"
                size="sm"
                onClick={applyCustom}
                disabled={!customFrom || !customTo}
                className="flex-1 gap-1"
              >
                <Check className="h-3 w-3" />
                Appliquer
              </Button>
            </div>
          </div>
        ) : (
          <div className="p-1 min-w-[200px]">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                onClick={() => applyPreset(p)}
                className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-primary/5 transition-colors ${
                  value.label === p.label ? 'bg-primary/10 text-primary font-medium' : ''
                }`}
              >
                {p.label}
              </button>
            ))}
            <div className="border-t my-1" />
            <button
              onClick={() => setPickingCustom(true)}
              className="w-full text-left px-3 py-2 rounded-md text-sm hover:bg-primary/5 transition-colors flex items-center gap-2"
            >
              <CalIcon className="h-3 w-3" />
              Période personnalisée…
            </button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}

// Valeur par défaut : depuis toujours
export const defaultPeriod: PeriodRange = { from: null, to: null, label: 'Depuis toujours' };

// Helper pour appliquer un filtre période sur une query Supabase
export const applyPeriodFilter = <T,>(query: T, column: string, period: PeriodRange): T => {
  let q = query as any;
  if (period.from) q = q.gte(column, period.from.toISOString());
  if (period.to) q = q.lte(column, period.to.toISOString());
  return q as T;
};
