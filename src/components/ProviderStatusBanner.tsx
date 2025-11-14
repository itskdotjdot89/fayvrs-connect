import { useAuth } from "@/contexts/AuthContext";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Shield, CreditCard, Clock, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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

  // Don't show banner if not a provider or has full access
  if (activeRole !== 'provider' || hasProviderAccess) {
    return null;
  }

  // Determine banner state and content
  let icon = <Shield className="h-4 w-4" />;
  let title = "";
  let description = "";
  let actionButton = null;

  if (!isVerified) {
    if (verificationStatus === 'pending') {
      icon = <Clock className="h-4 w-4" />;
      title = "Verification Pending";
      description = "We're reviewing your verification documents (typically 24-48 hours). You can browse requests but can't respond yet.";
    } else {
      icon = <Shield className="h-4 w-4" />;
      title = "Verification Required";
      description = "Complete identity verification to start responding to requests and earning commissions.";
      actionButton = (
        <Link to="/identity-verification">
          <Button size="sm" variant="default">
            Verify Now
          </Button>
        </Link>
      );
    }
  } else if (!isSubscribed) {
    icon = <CreditCard className="h-4 w-4" />;
    title = "Subscription Required";
    description = "You're verified! Subscribe to start responding to requests and receiving leads.";
    actionButton = (
      <Link to="/provider-checkout">
        <Button size="sm" variant="default">
          Subscribe Now
        </Button>
      </Link>
    );
  }

  return (
    <Alert className="mb-4 border-primary/50 bg-primary/5">
      <div className="flex items-center gap-2">
        {icon}
        <AlertDescription className="flex-1">
          <span className="font-semibold">{title}:</span> {description}
        </AlertDescription>
        {actionButton}
      </div>
    </Alert>
  );
}
