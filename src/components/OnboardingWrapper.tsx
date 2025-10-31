import { ReactNode, useEffect, useState } from 'react';
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
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) return;

    // Skip onboarding check for onboarding route, mockup routes, and auth route
    if (location.pathname === '/onboarding' || location.pathname.startsWith('/mockup') || location.pathname === '/auth') {
      setChecked(true);
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

    setChecked(true);
  }, [user, loading, location.pathname, navigate]);

  // Don't render children until we've checked onboarding status
  if (!checked) {
    return null;
  }

  return <>{children}</>;
};
