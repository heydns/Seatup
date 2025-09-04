import React from 'react';
import { useAuth } from '@/components/AuthProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const AuthDebug: React.FC = () => {
  const { user, userProfile, session, loading } = useAuth();

  if (!user) {
    return null; // Don't show debug info when not logged in
  }

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-white/95 backdrop-blur-sm shadow-lg z-50">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Debug Auth Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs space-y-2">
        <div>
          <strong>Loading:</strong> {loading ? 'Yes' : 'No'}
        </div>
        <div>
          <strong>User ID:</strong> {user?.id?.slice(0, 8)}...
        </div>
        <div>
          <strong>Email:</strong> {user?.email}
        </div>
        <div>
          <strong>Email Confirmed:</strong> {user?.email_confirmed_at ? 'Yes' : 'No'}
        </div>
        {userProfile && (
          <div className="space-y-1">
            <div>
              <strong>Profile:</strong>
            </div>
            <div className="pl-2">
              <div><strong>Role:</strong> <Badge variant="outline">{userProfile.role}</Badge></div>
              <div><strong>Name:</strong> {userProfile.first_name} {userProfile.last_name}</div>
              {userProfile.company_name && (
                <div><strong>Company:</strong> {userProfile.company_name}</div>
              )}
            </div>
          </div>
        )}
        <div>
          <strong>Session:</strong> {session ? 'Active' : 'None'}
        </div>
      </CardContent>
    </Card>
  );
};