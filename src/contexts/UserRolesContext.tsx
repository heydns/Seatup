/**
 * UserRolesContext — gestion multi-rôles et switch d'espace (V1)
 * ─────────────────────────────────────────────────────────────────────────
 * Un user peut avoir N rôles dans M organisations :
 *   - Bénéficiaire d'un CSE
 *   - Admin d'un ou plusieurs CSE (high / low / lecteur)
 *   - Admin d'un ou plusieurs clubs (organizer)
 *   - Super admin SeatUp (préparé V2)
 *
 * Expose :
 *   - roles : liste complète des rôles du user
 *   - activeRole : rôle actuellement sélectionné (persisté en localStorage)
 *   - setActiveRole(role) : switch d'espace (met à jour localStorage + navigate)
 *   - canSwitchSpace : TRUE si plusieurs rôles → afficher dropdown
 *   - isLoading : chargement des rôles
 *
 * Fait automatiquement le fallback vers l'ancien `profiles.role` si les
 * nouvelles user_roles ne sont pas encore migrées pour un user donné.
 */

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/components/AuthProvider';

export type UserRoleType = 'beneficiary' | 'cse_admin' | 'organizer_admin' | 'seatup_admin';
export type CseRoleLevel = 'high' | 'low' | 'lecteur';

export interface UserRole {
  role_type: UserRoleType;
  org_id: string | null;
  org_name: string;
  cse_role: CseRoleLevel | null;
}

interface UserRolesContextType {
  roles: UserRole[];
  activeRole: UserRole | null;
  setActiveRole: (role: UserRole) => void;
  canSwitchSpace: boolean;
  isLoading: boolean;
  refreshRoles: () => Promise<void>;
  // Helpers de permission
  hasRole: (roleType: UserRoleType, orgId?: string) => boolean;
  hasCseRole: (orgId: string, minLevel: CseRoleLevel) => boolean;
}

const ACTIVE_ROLE_KEY = 'seatup_active_role_v1';

const UserRolesContext = createContext<UserRolesContextType | undefined>(undefined);

export const useUserRoles = () => {
  const ctx = useContext(UserRolesContext);
  if (ctx === undefined) {
    throw new Error('useUserRoles must be used within UserRolesProvider');
  }
  return ctx;
};

// Hiérarchie des niveaux CSE : high ⊇ low ⊇ lecteur
const cseRoleSatisfies = (actual: CseRoleLevel | null, min: CseRoleLevel): boolean => {
  if (!actual) return false;
  const order: Record<CseRoleLevel, number> = { lecteur: 1, low: 2, high: 3 };
  return order[actual] >= order[min];
};

const roleKey = (r: Pick<UserRole, 'role_type' | 'org_id'>) => `${r.role_type}:${r.org_id ?? 'global'}`;

const loadStoredActiveRole = (): { role_type: UserRoleType; org_id: string | null } | null => {
  try {
    const raw = localStorage.getItem(ACTIVE_ROLE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.role_type === 'string') return parsed;
    return null;
  } catch {
    return null;
  }
};

export const UserRolesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [activeRole, setActiveRoleState] = useState<UserRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRoles = useCallback(async () => {
    if (!user) {
      setRoles([]);
      setActiveRoleState(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Essaie d'abord la nouvelle RPC get_my_roles (V1)
      const { data, error } = await supabase.rpc('get_my_roles');

      let fetchedRoles: UserRole[] = [];

      if (!error && Array.isArray(data) && data.length > 0) {
        fetchedRoles = data as UserRole[];
      } else {
        // Fallback : utiliser l'ancien profiles.role
        if (userProfile) {
          fetchedRoles = [
            {
              role_type: (userProfile.role ?? 'beneficiary') as UserRoleType,
              org_id: null,
              org_name: userProfile.company_name ?? 'Mon organisation',
              cse_role: userProfile.role === 'cse_admin' ? 'high' : null,
            },
          ];
        }
      }

      setRoles(fetchedRoles);

      // Restore activeRole depuis localStorage si valide, sinon premier rôle
      const stored = loadStoredActiveRole();
      if (stored) {
        const match = fetchedRoles.find(
          (r) => r.role_type === stored.role_type && r.org_id === stored.org_id
        );
        if (match) {
          setActiveRoleState(match);
          return;
        }
      }
      setActiveRoleState(fetchedRoles[0] ?? null);
    } catch (err) {
      console.error('[UserRoles] fetchRoles error:', err);
      setRoles([]);
      setActiveRoleState(null);
    } finally {
      setIsLoading(false);
    }
  }, [user, userProfile]);

  useEffect(() => {
    if (authLoading) return;
    fetchRoles();
  }, [authLoading, fetchRoles]);

  const setActiveRole = useCallback((role: UserRole) => {
    setActiveRoleState(role);
    try {
      localStorage.setItem(
        ACTIVE_ROLE_KEY,
        JSON.stringify({ role_type: role.role_type, org_id: role.org_id })
      );
    } catch {
      /* ignore */
    }
  }, []);

  const hasRole = useCallback(
    (roleType: UserRoleType, orgId?: string) => {
      return roles.some(
        (r) => r.role_type === roleType && (orgId === undefined || r.org_id === orgId)
      );
    },
    [roles]
  );

  const hasCseRole = useCallback(
    (orgId: string, minLevel: CseRoleLevel) => {
      return roles.some(
        (r) => r.role_type === 'cse_admin' && r.org_id === orgId && cseRoleSatisfies(r.cse_role, minLevel)
      );
    },
    [roles]
  );

  const value: UserRolesContextType = {
    roles,
    activeRole,
    setActiveRole,
    canSwitchSpace: roles.length > 1,
    isLoading,
    refreshRoles: fetchRoles,
    hasRole,
    hasCseRole,
  };

  return <UserRolesContext.Provider value={value}>{children}</UserRolesContext.Provider>;
};
