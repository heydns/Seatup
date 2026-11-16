/**
 * SpaceSwitcher — dropdown pour switcher entre espaces (V1)
 * ─────────────────────────────────────────────────────────────────────────
 * Affiché dans le header UNIQUEMENT si l'utilisateur a plusieurs rôles.
 * Change l'espace actif + redirige vers le bon dashboard.
 */

import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Briefcase, User, Building2, ShieldCheck } from 'lucide-react';
import { useUserRoles, type UserRole, type UserRoleType } from '@/contexts/UserRolesContext';

const roleIcon = (type: UserRoleType) => {
  switch (type) {
    case 'beneficiary':
      return <User className="h-4 w-4" />;
    case 'cse_admin':
      return <Briefcase className="h-4 w-4" />;
    case 'organizer_admin':
      return <Building2 className="h-4 w-4" />;
    case 'seatup_admin':
      return <ShieldCheck className="h-4 w-4" />;
  }
};

const roleLabel = (type: UserRoleType): string => {
  switch (type) {
    case 'beneficiary':
      return 'Espace Bénéficiaire';
    case 'cse_admin':
      return 'Espace CSE';
    case 'organizer_admin':
      return 'Espace Organisateur';
    case 'seatup_admin':
      return 'Back-office SeatUp';
  }
};

const roleRoute = (type: UserRoleType): string => {
  switch (type) {
    case 'beneficiary':
      return '/home';
    case 'cse_admin':
    case 'organizer_admin':
      return '/dashboard';
    case 'seatup_admin':
      return '/dashboard';
  }
};

export const SpaceSwitcher = () => {
  const navigate = useNavigate();
  const { roles, activeRole, setActiveRole, canSwitchSpace } = useUserRoles();

  // Si un seul rôle, pas de switcher
  if (!canSwitchSpace || !activeRole) return null;

  const handleSwitch = (role: UserRole) => {
    setActiveRole(role);
    navigate(roleRoute(role.role_type));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2 min-w-[180px] justify-between">
          <span className="flex items-center gap-2 truncate">
            {roleIcon(activeRole.role_type)}
            <span className="truncate">{roleLabel(activeRole.role_type)}</span>
          </span>
          <ChevronDown className="h-4 w-4 flex-shrink-0" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>Mes espaces</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {roles.map((role) => {
          const isActive =
            role.role_type === activeRole.role_type && role.org_id === activeRole.org_id;
          return (
            <DropdownMenuItem
              key={`${role.role_type}:${role.org_id ?? 'global'}`}
              onClick={() => handleSwitch(role)}
              className={`flex items-start gap-2 py-2 cursor-pointer ${
                isActive ? 'bg-primary/5' : ''
              }`}
            >
              {roleIcon(role.role_type)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">{roleLabel(role.role_type)}</div>
                <div className="text-xs text-muted-foreground truncate">
                  {role.org_name}
                  {role.cse_role && ` · ${role.cse_role}`}
                </div>
              </div>
              {isActive && (
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
