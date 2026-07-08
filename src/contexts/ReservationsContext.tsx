/**
 * Seatup — ReservationsContext
 * ─────────────────────────────────────────────────────────────────────────
 * Gère les réservations du bénéficiaire connecté + l'état de sa cagnotte,
 * tout en mémoire (avec persistance localStorage pour qu'une démo survive
 * à un refresh).
 *
 * Aucune dépendance API — pure démo fake data.
 *
 * Usage :
 *   1. Wrapper dans App.tsx :   <ReservationsProvider>{App}</ReservationsProvider>
 *   2. Dans un composant :       const { reserve, myReservations, wallet } = useReservations()
 */

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { mockEvents, mockReservations, type MockEvent, type MockReservation } from '@/data/mockData';

const DEMO_BENEFICIARY_ID = 1; // Marie Dupont par défaut
const STORAGE_KEY = 'seatup_reservations_v1';
const WALLET_STORAGE_KEY = 'seatup_wallet_v1';
const DEFAULT_TOTAL_BUDGET = 500;

export interface UserReservation extends MockReservation {
  event?: MockEvent;
}

interface WalletState {
  totalBudget: number;
  usedBudget: number;
  remainingBudget: number;
}

interface ReservationsContextValue {
  myReservations: UserReservation[];
  upcomingReservations: UserReservation[];
  pastReservations: UserReservation[];
  wallet: WalletState;
  reserve: (eventId: number, quantity: number) => UserReservation | null;
  cancel: (reservationId: number) => void;
  topUpWallet: (amount: number) => void;
  resetDemo: () => void;
}

const ReservationsContext = createContext<ReservationsContextValue | null>(null);

export const useReservations = (): ReservationsContextValue => {
  const ctx = useContext(ReservationsContext);
  if (!ctx) throw new Error('useReservations doit être utilisé à l\'intérieur de <ReservationsProvider>');
  return ctx;
};

interface ReservationsProviderProps {
  beneficiaryId?: number;
  children: React.ReactNode;
}

export const ReservationsProvider: React.FC<ReservationsProviderProps> = ({
  beneficiaryId = DEMO_BENEFICIARY_ID,
  children,
}) => {
  const [reservations, setReservations] = useState<MockReservation[]>(() => {
    if (typeof window === 'undefined') return mockReservations;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return mockReservations;
  });

  const [wallet, setWallet] = useState<WalletState>(() => {
    if (typeof window === 'undefined') {
      return { totalBudget: DEFAULT_TOTAL_BUDGET, usedBudget: 160, remainingBudget: DEFAULT_TOTAL_BUDGET - 160 };
    }
    try {
      const raw = localStorage.getItem(WALLET_STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch {
      /* ignore */
    }
    return { totalBudget: DEFAULT_TOTAL_BUDGET, usedBudget: 160, remainingBudget: DEFAULT_TOTAL_BUDGET - 160 };
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reservations));
    } catch {
      /* quota / safari private mode */
    }
  }, [reservations]);

  useEffect(() => {
    try {
      localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(wallet));
    } catch {
      /* idem */
    }
  }, [wallet]);

  const myReservations = useMemo<UserReservation[]>(
    () =>
      reservations
        .filter((r) => r.beneficiaryId === beneficiaryId)
        .map((r) => ({ ...r, event: mockEvents.find((e) => e.ID_event === r.eventId) }))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    [reservations, beneficiaryId]
  );

  const upcomingReservations = useMemo<UserReservation[]>(() => {
    const now = new Date();
    return myReservations.filter(
      (r) => r.event && new Date(r.event.Date) >= now && r.status === 'confirmed'
    );
  }, [myReservations]);

  const pastReservations = useMemo<UserReservation[]>(() => {
    const now = new Date();
    return myReservations.filter((r) => r.event && new Date(r.event.Date) < now);
  }, [myReservations]);

  const reserve: ReservationsContextValue['reserve'] = (eventId, quantity) => {
    const event = mockEvents.find((e) => e.ID_event === eventId);
    if (!event) return null;

    const ourPrice = parseInt(event.Our_Price.replace('€', ''), 10);
    const originalPrice = parseInt(event.Original_Price.replace('€', ''), 10);
    const totalCost = ourPrice * quantity;

    if (totalCost > wallet.remainingBudget) return null;

    const newReservation: MockReservation = {
      id: Date.now(),
      beneficiaryId,
      eventId,
      date: new Date().toISOString().slice(0, 10),
      quantity,
      originalPrice: originalPrice * quantity,
      subsidizedAmount: (originalPrice - ourPrice) * quantity,
      finalPrice: totalCost,
      status: 'confirmed',
    };

    setReservations((prev) => [newReservation, ...prev]);
    setWallet((prev) => ({
      ...prev,
      usedBudget: prev.usedBudget + totalCost,
      remainingBudget: prev.remainingBudget - totalCost,
    }));

    return { ...newReservation, event };
  };

  const cancel: ReservationsContextValue['cancel'] = (reservationId) => {
    setReservations((prev) => {
      const target = prev.find((r) => r.id === reservationId);
      if (target && target.status === 'confirmed') {
        setWallet((w) => ({
          ...w,
          usedBudget: Math.max(0, w.usedBudget - target.finalPrice),
          remainingBudget: w.remainingBudget + target.finalPrice,
        }));
      }
      return prev.map((r) =>
        r.id === reservationId ? { ...r, status: 'cancelled' as const } : r
      );
    });
  };

  const topUpWallet: ReservationsContextValue['topUpWallet'] = (amount) => {
    setWallet((prev) => ({
      ...prev,
      totalBudget: prev.totalBudget + amount,
      remainingBudget: prev.remainingBudget + amount,
    }));
  };

  const resetDemo: ReservationsContextValue['resetDemo'] = () => {
    setReservations(mockReservations);
    setWallet({ totalBudget: DEFAULT_TOTAL_BUDGET, usedBudget: 160, remainingBudget: DEFAULT_TOTAL_BUDGET - 160 });
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(WALLET_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  };

  const value: ReservationsContextValue = {
    myReservations,
    upcomingReservations,
    pastReservations,
    wallet,
    reserve,
    cancel,
    topUpWallet,
    resetDemo,
  };

  return <ReservationsContext.Provider value={value}>{children}</ReservationsContext.Provider>;
};
