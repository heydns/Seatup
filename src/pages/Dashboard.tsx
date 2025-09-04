import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Navigate } from 'react-router-dom';
import BeneficiaryDashboard from '@/components/dashboards/BeneficiaryDashboard';
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

  if (!user || !userProfile) {
    return <Navigate to="/auth" replace />;
  }

  switch (userProfile.role) {
    case 'beneficiary':
      return <BeneficiaryDashboard />;
    case 'cse_admin':
      return <CSEAdminDashboard />;
    case 'organizer_admin':
      return <OrganizerAdminDashboard />;
    default:
      return <Navigate to="/auth" replace />;
  }
};

export default Dashboard;