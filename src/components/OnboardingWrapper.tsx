import { ReactNode, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { hasSeenOnboarding } from '@/utils/onboardingHelper';

interface OnboardingWrapperProps {
  children: ReactNode;
}

export const OnboardingWrapper = ({ children }: OnboardingWrapperProps) => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // Skip onboarding check for onboarding route, mockup routes, and auth route
    if (location.pathname === '/onboarding' || location.pathname.startsWith('/mockup') || location.pathname === '/auth') {
      return;
    }

    // If user is not authenticated and hasn't seen onboarding, redirect to onboarding
    if (!user && !hasSeenOnboarding() && location.pathname !== '/onboarding') {
      // Store the intended destination
      const intendedPath = location.pathname !== '/' ? location.pathname : null;
      if (intendedPath) {
        sessionStorage.setItem('intended_path', intendedPath);
      }
      navigate('/onboarding', { replace: true });
    }
  }, [user, loading, location.pathname, navigate]);

  // Show loading spinner only during initial auth check
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
};
