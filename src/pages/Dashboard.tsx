import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import CSEAdminDashboard from '@/components/dashboards/CSEAdminDashboard';
import OrganizerAdminDashboard from '@/components/dashboards/OrganizerAdminDashboard';
import { Loader2 } from 'lucide-react';

const Dashboard = () => {
  const { user, userProfile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // User connecté mais profile pas encore chargé — affiche un message plutôt que boucler
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

  switch (userProfile.role) {
    case 'beneficiary':
      return <Navigate to="/home" replace />;
    case 'cse_admin':
      return <CSEAdminDashboard />;
    case 'organizer_admin':
      return <OrganizerAdminDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export default Dashboard;