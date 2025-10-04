import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Upload, Camera, FileCheck } from "lucide-react";

export default function IdentityVerification() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-verified to-primary flex items-center justify-center shadow-soft">
            <Shield className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold font-poppins text-foreground">
            Identity Verification Required
          </h1>
          <p className="text-muted-foreground">
            Verify your ID to access full features and build trust in the community.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-card p-6 shadow-soft space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-foreground mb-1">Upload ID</h3>
              <p className="text-sm text-muted-foreground">
                Photo of government-issued ID
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-foreground mb-1">Take Selfie</h3>
              <p className="text-sm text-muted-foreground">
                Quick photo to verify it's you
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <FileCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-foreground mb-1">Review</h3>
              <p className="text-sm text-muted-foreground">
                We'll verify within 24 hours
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button size="lg" className="w-full h-14 rounded-2xl shadow-soft text-base font-semibold">
          Get Started
        </Button>

        {/* Skip Link */}
        <p className="text-center text-sm text-muted-foreground">
          <a href="#" className="hover:text-primary transition-colors">
            I'll do this later
          </a>
        </p>
      </div>
    </div>
  );
}