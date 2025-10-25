import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'provider' | 'requester';
}

export const ProtectedRoute = ({ children, requiredRole }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      if (!user) {
        setHasPermission(false);
        setChecking(false);
        return;
      }

      // If no required role, just check if user is authenticated
      if (!requiredRole) {
        setHasPermission(true);
        setChecking(false);
        return;
      }

      try {
        // Query user_roles table to check if user has the required role
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', requiredRole)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
          console.error('Error checking role:', error);
          setHasPermission(false);
        } else {
          setHasPermission(!!data);
        }
      } catch (error) {
        console.error('Failed to check permissions:', error);
        setHasPermission(false);
      } finally {
        setChecking(false);
      }
    };

    if (!authLoading) {
      checkRole();
    }
  }, [user, requiredRole, authLoading]);

  if (authLoading || checking) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || hasPermission === false) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
