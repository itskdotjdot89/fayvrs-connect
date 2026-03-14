import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useAuth } from "@/contexts/AuthContext";

export const LocationTracker = () => {
  let user: any = null;
  let loading = true;

  try {
    const auth = useAuth();
    user = auth.user;
    loading = auth.loading;
  } catch (e) {
    // LocationTracker may render outside AuthProvider in preview/edge cases
    return null;
  }

  // Track location for ALL authenticated users (not just providers)
  // This ensures both requesters and providers can find each other
  const shouldTrack = !!user && !loading;

  useLocationTracking(shouldTrack);

  return null;
};
