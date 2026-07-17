import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Loader2 } from 'lucide-react';

/**
 * ConfirmDeleteModal — Modal de confirmation générique de suppression
 * ─────────────────────────────────────────────────────────────────────────
 * Utilisé pour :
 *  - Supprimer bénéficiaires (Prio 2 CSE #2)
 *  - Supprimer événement (Prio 2 Marchand #7)
 *  - Etc.
 */

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode;
  confirmLabel?: string;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
  variant?: 'danger' | 'warning';
}

export default function ConfirmDeleteModal({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = 'Supprimer',
  onConfirm,
  isLoading = false,
  variant = 'danger',
}: Props) {
  const colorClass = variant === 'danger' ? 'text-red-600 bg-red-100' : 'text-amber-600 bg-amber-100';

  return (
    <Dialog open={open} onOpenChange={(o) => !isLoading && onOpenChange(o)}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className={`mx-auto w-14 h-14 rounded-full flex items-center justify-center ${colorClass}`}>
            <AlertTriangle className="h-7 w-7" />
          </div>
          <DialogTitle className="text-center font-monument mt-3">{title}</DialogTitle>
          <DialogDescription className="text-center pt-2 text-base">
            {description}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="sm:justify-center gap-2 pt-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant={variant === 'danger' ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Suppression...
              </>
            ) : (
              confirmLabel
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
