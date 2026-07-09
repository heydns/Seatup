/**
 * AuthProvider — version avec support du mode démo (bypass Supabase)
 * ─────────────────────────────────────────────────────────────────────────
 * REMPLACE entièrement src/components/AuthProvider.tsx
 *
 * Comportement :
 *  - Si localStorage contient `seatup_demo_role` → injecte un faux user/profile
 *    SANS appeler Supabase. Tu peux donc utiliser /home, /dashboard, /events
 *    sans avoir à te logger.
 *  - Sinon → comportement Supabase normal (intact).
 *
 * Le sélecteur en bas à droite (DemoSwitcher) gère le localStorage pour toi.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, firstName: string, lastName: string, role: string, companyName?: string) => Promise<{ error: any; data?: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<{ error: any }>;
}

interface UserProfile {
  id: string;
  // user_id est un alias de id, gardé pour compat avec les composants existants
  user_id?: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  role: 'beneficiary' | 'cse_admin' | 'organizer_admin';
  created_at: string;
  updated_at: string;
  avatar_url: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// ─────────────────────────────────────────────────────────────────────────────
// DEMO MODE — fake users injectés quand localStorage.seatup_demo_role est set
// ─────────────────────────────────────────────────────────────────────────────

const DEMO_KEY = 'seatup_demo_role';
type DemoRole = 'beneficiary' | 'cse_admin' | 'organizer_admin';

const DEMO_PROFILES: Record<DemoRole, UserProfile> = {
  beneficiary: {
    id: 'demo-ben-1',
    user_id: 'demo-ben-1',
    email: 'marie.dupont@orus.fr',
    first_name: 'Marie',
    last_name: 'Dupont',
    company_name: 'Orus',
    role: 'beneficiary',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    avatar_url: null,
  },
  cse_admin: {
    id: 'demo-cse-1',
    user_id: 'demo-cse-1',
    email: 'cse@orus.fr',
    first_name: 'Sophie',
    last_name: 'RH',
    company_name: 'Orus',
    role: 'cse_admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    avatar_url: null,
  },
  organizer_admin: {
    id: 'demo-org-1',
    user_id: 'demo-org-1',
    email: 'club@psg.fr',
    first_name: 'Olivier',
    last_name: 'PSG',
    company_name: 'Paris Saint-Germain',
    role: 'organizer_admin',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    avatar_url: null,
  },
};

const getDemoRole = (): DemoRole | null => {
  if (typeof window === 'undefined') return null;
  try {
    const stored = localStorage.getItem(DEMO_KEY);
    if (stored === 'beneficiary' || stored === 'cse_admin' || stored === 'organizer_admin') {
      return stored;
    }
  } catch {
    /* ignore */
  }
  return null;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROVIDER
// ─────────────────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const demoRole = getDemoRole();

  const [user, setUser] = useState<User | null>(
    demoRole ? ({ id: DEMO_PROFILES[demoRole].user_id, email: DEMO_PROFILES[demoRole].email } as User) : null
  );
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(
    demoRole ? DEMO_PROFILES[demoRole] : null
  );
  const [loading, setLoading] = useState(!demoRole);

  useEffect(() => {
    // ── Mode démo : on n'appelle JAMAIS Supabase
    if (demoRole) {
      setUser({ id: DEMO_PROFILES[demoRole].user_id, email: DEMO_PROFILES[demoRole].email } as User);
      setUserProfile(DEMO_PROFILES[demoRole]);
      setLoading(false);
      return;
    }

    // ── Mode normal : Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          setTimeout(async () => {
            try {
              const { data: profile, error } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();

              if (error) {
                console.error('Error fetching profile:', error);
              } else if (profile) {
                // Ajoute user_id = id pour compat avec les composants Lovable existants
                setUserProfile({ ...profile, user_id: profile.id } as UserProfile);
              }
            } catch (error) {
              console.error('Profile fetch error:', error);
            } finally {
              setLoading(false);
            }
          }, 0);
        } else {
          setUserProfile(null);
          setLoading(false);
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (!session) {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, [demoRole]);

  const signUp = async (email: string, password: string, firstName: string, lastName: string, role: string, companyName?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          first_name: firstName,
          last_name: lastName,
          role: role as 'beneficiary' | 'cse_admin' | 'organizer_admin',
          company_name: companyName || null,
        },
      },
    });
    return { error, data };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signOut = async () => {
    // En mode démo : on vide juste le localStorage et on reload
    if (demoRole) {
      try {
        localStorage.removeItem(DEMO_KEY);
        localStorage.removeItem('seatup_reservations_v1');
        localStorage.removeItem('seatup_wallet_v1');
      } catch {
        /* ignore */
      }
      window.location.href = '/';
      return { error: null };
    }
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    session,
    userProfile,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
