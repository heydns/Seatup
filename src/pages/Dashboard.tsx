import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useUserRoles } from '@/contexts/UserRolesContext';
import { Navigate } from 'react-router-dom';
import CSEAdminDashboard from '@/components/dashboards/CSEAdminDashboard';
import OrganizerAdminDashboard from '@/components/dashboards/OrganizerAdminDashboard';
import { Loader2 } from 'lucide-react';

/**
 * Dashboard — router par rôle actif
 * ─────────────────────────────────────────────────────────────────────────
 * V1 : utilise `activeRole` du UserRolesContext (nouveau système multi-rôles)
 * et PAS `userProfile.role` (ancien système mono-rôle).
 *
 * Fallback : si pas de activeRole (user sans user_roles mais avec profile.role
 * défini), on utilise l'ancien `userProfile.role` pour ne pas casser les users
 * historiques du MVP.
 */
const Dashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth();
  const { activeRole, isLoading: rolesLoading } = useUserRoles();

  if (authLoading || rolesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground mb-4">
            Chargement de votre profil…
          </p>
          <p className="text-xs text-muted-foreground">
            Si ce message persiste, ouvre F12 → Console → vérifie les erreurs Supabase.
          </p>
        </div>
      </div>
    );
  }

  // Priorité V1 : activeRole (nouveau système multi-rôles)
  // Fallback : userProfile.role (ancien système, pour compat MVP)
  const roleType = activeRole?.role_type ?? userProfile.role;

  switch (roleType) {
    case 'beneficiary':
      return <Navigate to="/home" replace />;
    case 'cse_admin':
      return <CSEAdminDashboard />;
    case 'organizer_admin':
      return <OrganizerAdminDashboard />;
    case 'seatup_admin':
      return <Navigate to="/admin/seatup" replace />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export default Dashboard;
