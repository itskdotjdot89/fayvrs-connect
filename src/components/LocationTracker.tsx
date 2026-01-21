import { useEffect } from "react";
import { useLocationTracking } from "@/hooks/useLocationTracking";
import { useAuth } from "@/contexts/AuthContext";

export const LocationTracker = () => {
  let user: any = null;
  let loading = true;
  let userRoles: string[] = [];

  try {
    const auth = useAuth();
    user = auth.user;
    loading = auth.loading;
    userRoles = auth.userRoles || [];
  } catch (e) {
    // LocationTracker may render outside AuthProvider in preview/edge cases
    return null;
  }

  const shouldTrack = !!user && !loading && userRoles.includes("provider");

  // Only enable location tracking for providers after auth completes
  useLocationTracking(shouldTrack);

  return null;
};
