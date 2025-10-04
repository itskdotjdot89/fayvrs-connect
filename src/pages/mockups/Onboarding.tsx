import { Button } from "@/components/ui/button";
import { Handshake } from "lucide-react";

export default function Onboarding() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8 text-center">
        {/* Logo Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-soft">
            <Handshake className="w-10 h-10 text-white" strokeWidth={2.5} />
          </div>
        </div>

        {/* Title & Subtitle */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold font-poppins text-foreground">
            Fayvrs
          </h1>
          <p className="text-muted-foreground text-lg">
            No platform fees. Verified community.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="space-y-3 pt-8">
          <Button 
            size="lg" 
            className="w-full h-14 text-base font-semibold rounded-2xl shadow-soft"
          >
            Sign Up or Log In
          </Button>
          
          <Button 
            variant="outline" 
            size="lg"
            className="w-full h-14 text-base font-semibold rounded-2xl border-2"
          >
            Continue as Guest
          </Button>
        </div>

        {/* Bottom Spacing */}
        <div className="pt-12 text-xs text-muted-foreground">
          v1.0
        </div>
      </div>
    </div>
  );
}