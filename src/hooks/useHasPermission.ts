/**
 * useHasPermission — hook helper pour check les droits côté UI
 * ─────────────────────────────────────────────────────────────────────────
 * ⚠️ Toujours doublé par les RLS policies Supabase côté serveur.
 * Ce hook sert UNIQUEMENT à cacher/désactiver des éléments d'UI.
 *
 * Permissions supportées (V1) :
 *   - 'cse:read'               → lecteur+ sur un CSE
 *   - 'cse:manage_beneficiaries' → low+ sur un CSE
 *   - 'cse:manage_organization'  → high only
 *   - 'cse:create_bdc'         → low+
 *   - 'cse:view_finance'       → low+ (BDC + factures)
 *   - 'cse:recharge_wallet'    → high only
 *   - 'cse:distribute_wallet'  → high only
 *   - 'cse:send_communication' → low+
 *   - 'cse:manage_admins'      → high only
 *
 * NB : le composant <PermissionGate /> est dans PermissionGate.tsx — on
 * ne peut pas mixer hook et JSX dans un .ts (Vite rejette).
 */

import { useUserRoles } from '@/contexts/UserRolesContext';

export type Permission =
  | 'cse:read'
  | 'cse:manage_beneficiaries'
  | 'cse:manage_organization'
  | 'cse:create_bdc'
  | 'cse:view_finance'
  | 'cse:recharge_wallet'
  | 'cse:distribute_wallet'
  | 'cse:send_communication'
  | 'cse:manage_admins';

export const useHasPermission = (permission: Permission): boolean => {
  const { activeRole, hasCseRole } = useUserRoles();

  if (!activeRole) return false;

  // Pour l'instant V1 : tous les permissions "cse:*" nécessitent un rôle cse_admin actif
  if (!permission.startsWith('cse:')) return false;
  if (activeRole.role_type !== 'cse_admin') return false;
  if (!activeRole.org_id) return false;

  const orgId = activeRole.org_id;

  switch (permission) {
    case 'cse:read':
      return hasCseRole(orgId, 'lecteur');

    case 'cse:manage_beneficiaries':
    case 'cse:create_bdc':
    case 'cse:view_finance':
    case 'cse:send_communication':
      return hasCseRole(orgId, 'low');

    case 'cse:manage_organization':
    case 'cse:recharge_wallet':
    case 'cse:distribute_wallet':
    case 'cse:manage_admins':
      return hasCseRole(orgId, 'high');

    default:
      return false;
  }
};

// Re-export du composant pour garder la compat avec les imports existants
// `import { PermissionGate } from '@/hooks/useHasPermission'`
export { PermissionGate } from './PermissionGate';
