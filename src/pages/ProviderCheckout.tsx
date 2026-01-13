import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ProviderCheckout() {
  const navigate = useNavigate();

  // Redirect ALL users to RevenueCat paywall (unified payment flow)
  useEffect(() => {
    navigate('/provider-paywall', { replace: true });
  }, [navigate]);

  // Show loading while redirect happens
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
        <p className="text-muted-foreground">Loading subscription options...</p>
      </div>
    </div>
  );
}
