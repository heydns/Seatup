/**
 * DemoSwitcher — sélecteur de rôle flottant pour les démos / pitchs.
 * ─────────────────────────────────────────────────────────────────────────
 * Écrit le rôle choisi dans localStorage puis recharge la page.
 * L'AuthProvider patché détecte ce localStorage et injecte un faux user
 * sans passer par Supabase.
 *
 * À placer dans : src/components/DemoSwitcher.tsx
 * À ajouter dans App.tsx (cf. instructions).
 */

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { User, Users, Trophy, LogOut, ChevronUp } from 'lucide-react';

const DEMO_KEY = 'seatup_demo_role';

type DemoRole = 'beneficiary' | 'cse_admin' | 'organizer_admin' | null;

const ROLES: { id: Exclude<DemoRole, null>; label: string; icon: any; target: string }[] = [
  { id: 'beneficiary', label: 'Marie (Bénéficiaire)', icon: User, target: '/home' },
  { id: 'cse_admin', label: 'CSE Orus', icon: Users, target: '/dashboard' },
  { id: 'organizer_admin', label: 'Club PSG', icon: Trophy, target: '/dashboard' },
];

export function DemoSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentRole, setCurrentRole] = useState<DemoRole>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(DEMO_KEY) as DemoRole;
      setCurrentRole(stored);
    } catch {
      /* ignore */
    }
  }, []);

  const switchRole = (role: Exclude<DemoRole, null>, target: string) => {
    try {
      localStorage.setItem(DEMO_KEY, role);
    } catch {
      /* ignore */
    }
    // Reset reservations entre 2 démos
    try {
      localStorage.removeItem('seatup_reservations_v1');
      localStorage.removeItem('seatup_wallet_v1');
    } catch {
      /* ignore */
    }
    window.location.href = target;
  };

  const exitDemo = () => {
    try {
      localStorage.removeItem(DEMO_KEY);
      localStorage.removeItem('seatup_reservations_v1');
      localStorage.removeItem('seatup_wallet_v1');
    } catch {
      /* ignore */
    }
    window.location.href = '/';
  };

  const currentLabel = ROLES.find((r) => r.id === currentRole)?.label ?? 'Mode démo';

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen && (
        <div className="mb-3 rounded-2xl bg-white shadow-xl border border-gray-200 overflow-hidden w-64 animate-fade-up">
          <div className="px-4 py-3 bg-gradient-primary text-white">
            <p className="text-xs uppercase tracking-wider opacity-80">Mode démo</p>
            <p className="font-monument font-semibold">Changer de rôle</p>
          </div>
          <div className="p-2 space-y-1">
            {ROLES.map((r) => {
              const Icon = r.icon;
              const isActive = currentRole === r.id;
              return (
                <button
                  key={r.id}
                  onClick={() => switchRole(r.id, r.target)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    isActive ? 'bg-primary/10 text-primary' : 'hover:bg-gray-50'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="text-sm font-medium">{r.label}</span>
                </button>
              );
            })}
          </div>
          {currentRole && (
            <div className="px-2 pb-2 pt-1 border-t border-gray-100">
              <button
                onClick={exitDemo}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 text-muted-foreground hover:bg-red-50 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Quitter le mode démo</span>
              </button>
            </div>
          )}
        </div>
      )}

      <Button
        variant="hero"
        onClick={() => setIsOpen((o) => !o)}
        className="rounded-full shadow-xl gap-2 px-5 py-6"
      >
        <span className="text-xs uppercase opacity-80">Démo</span>
        <span className="font-monument">{currentLabel}</span>
        <ChevronUp className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>
    </div>
  );
}
