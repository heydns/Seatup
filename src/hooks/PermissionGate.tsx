/**
 * PermissionGate — wrapper composant pour cacher des enfants selon permission
 * ─────────────────────────────────────────────────────────────────────────
 * Séparé de useHasPermission.ts car JSX nécessite extension .tsx
 *
 * Usage :
 *   <PermissionGate permission="cse:recharge_wallet">
 *     <Button>Recharger la cagnotte</Button>
 *   </PermissionGate>
 *
 * Avec fallback :
 *   <PermissionGate
 *     permission="cse:manage_organization"
 *     fallback={<p>Accès refusé</p>}
 *   >
 *     <AdminSettings />
 *   </PermissionGate>
 */

import React from 'react';
import { useHasPermission, type Permission } from './useHasPermission';

interface PermissionGateProps {
  permission: Permission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  children,
  fallback = null,
}) => {
  const allowed = useHasPermission(permission);
  return <>{allowed ? children : fallback}</>;
};
