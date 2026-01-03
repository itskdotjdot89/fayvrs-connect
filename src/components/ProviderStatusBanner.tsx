import { useAuth } from "@/contexts/AuthContext";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, CreditCard, Clock, CheckCircle, BadgeCheck } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";


/**
 * ProviderStatusBanner Component
 * 
 * APPLE APP STORE COMPLIANCE (Guideline 5.1.1):
 * - Only shows subscription requirement as blocking
 * - Verification is shown as optional/recommended, not required
 */

export function ProviderStatusBanner() {
  const { user, activeRole } = useAuth();
  const { hasProviderAccess, isVerified, isSubscribed } = useProviderAccess();

  // Fetch verification status details
  const { data: verificationStatus } = useQuery({
    queryKey: ['verification-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('identity_verifications')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();
      return data?.status || 'not_submitted';
    },
    enabled: !!user?.id && activeRole === 'provider',
  });

  // Don't show banner if not a provider
  if (activeRole !== 'provider') {
    return null;
  }

  // Show subscription requirement (blocking)
  if (!isSubscribed) {
    return (
      <Alert className="mb-4 border-primary/50 bg-primary/5">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4" />
          <AlertDescription className="flex-1">
            <span className="font-semibold">Subscription Required:</span> Subscribe to start responding to requests and receiving leads.
          </AlertDescription>
          <Link to="/provider-paywall">
            <Button size="sm" variant="default">
              Subscribe Now
            </Button>
          </Link>
        </div>
      </Alert>
    );
  }

  // Show verification as optional/pending (not blocking)
  if (!isVerified) {
    if (verificationStatus === 'pending') {
      return (
        <Alert className="mb-4 border-amber-500/30 bg-amber-50">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-amber-600" />
            <AlertDescription className="flex-1 text-amber-800">
              <span className="font-semibold">Verification Pending:</span> We're reviewing your documents (24-48 hours). You can submit proposals in the meantime!
            </AlertDescription>
          </div>
        </Alert>
      );
    } else {
      // Optional verification suggestion
      return (
        <Alert className="mb-4 border-muted bg-muted/30">
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-muted-foreground" />
            <AlertDescription className="flex-1">
              <span className="font-semibold">Get Verified (Optional):</span> Stand out with a verified badge and accept high-value jobs.
            </AlertDescription>
            <Link to="/identity-verification">
              <Button size="sm" variant="outline">
                Verify Now
              </Button>
            </Link>
          </div>
        </Alert>
      );
    }
  }

  // Verified and subscribed - show success
  return null;
}
