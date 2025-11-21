import { Shield, CheckCircle, Mail, Phone, CreditCard, Award } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function TrustSafety() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-success/5 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Shield className="w-12 h-12 text-success animate-pulse" />
          <h2 className="text-5xl font-bold text-foreground">
            Your Safety Is Our Priority
          </h2>
        </div>
        <p className="text-2xl text-muted-foreground">
          Work with verified, trusted professionals
        </p>
      </div>

      {/* Main verification showcase */}
      <div className="w-full max-w-4xl mb-12">
        <Card className="p-12 animate-scale-in border-4 border-success">
          {/* Central verification badge */}
          <div className="text-center mb-12">
            <div className="w-40 h-40 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6 border-8 border-success">
              <Shield className="w-20 h-20 text-success" />
            </div>
            <h3 className="text-4xl font-bold mb-2">100% Verified</h3>
            <p className="text-xl text-muted-foreground">
              Every provider is thoroughly checked
            </p>
          </div>

          {/* Verification grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Email verified */}
            <div className="text-center animate-scale-in delay-100">
              <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 border-4 border-success">
                <Mail className="w-12 h-12 text-success" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-success" />
                <h4 className="text-xl font-bold">Email</h4>
              </div>
              <p className="text-muted-foreground">
                Confirmed identity
              </p>
            </div>

            {/* Phone verified */}
            <div className="text-center animate-scale-in delay-200">
              <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 border-4 border-success">
                <Phone className="w-12 h-12 text-success" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-success" />
                <h4 className="text-xl font-bold">Phone</h4>
              </div>
              <p className="text-muted-foreground">
                Real contact info
              </p>
            </div>

            {/* ID verified */}
            <div className="text-center animate-scale-in delay-300">
              <div className="w-24 h-24 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 border-4 border-success">
                <CreditCard className="w-12 h-12 text-success" />
              </div>
              <div className="flex items-center justify-center gap-2 mb-2">
                <CheckCircle className="w-6 h-6 text-success" />
                <h4 className="text-xl font-bold">ID</h4>
              </div>
              <p className="text-muted-foreground">
                Government issued
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Additional trust features */}
      <div className="w-full max-w-5xl grid grid-cols-2 gap-8 mb-12">
        {/* Background checks */}
        <Card className="p-8 animate-scale-in delay-400 border-2">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Shield className="w-10 h-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Background Checks</h3>
              <p className="text-lg text-muted-foreground mb-4">
                Optional enhanced verification for top providers
              </p>
              <ul className="space-y-2 text-base">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Criminal record check</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Identity verification</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>License validation</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Rating system */}
        <Card className="p-8 animate-scale-in delay-500 border-2">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center flex-shrink-0">
              <Award className="w-10 h-10 text-warning" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">Rating System</h3>
              <p className="text-lg text-muted-foreground mb-4">
                Real reviews from real customers
              </p>
              <ul className="space-y-2 text-base">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Verified reviews only</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Can't be faked</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span>Full transparency</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>
      </div>

      {/* Safety stats */}
      <div className="grid grid-cols-4 gap-6 w-full max-w-5xl mb-12 animate-fade-in delay-600">
        <Card className="p-6 text-center border-2">
          <div className="text-5xl font-bold text-success mb-2">100%</div>
          <div className="text-base text-muted-foreground">Verified Providers</div>
        </Card>
        <Card className="p-6 text-center border-2">
          <div className="text-5xl font-bold text-primary mb-2">4.8</div>
          <div className="text-base text-muted-foreground">Average Rating</div>
        </Card>
        <Card className="p-6 text-center border-2">
          <div className="text-5xl font-bold text-warning mb-2">98%</div>
          <div className="text-base text-muted-foreground">Satisfaction Rate</div>
        </Card>
        <Card className="p-6 text-center border-2">
          <div className="text-5xl font-bold text-success mb-2">24/7</div>
          <div className="text-base text-muted-foreground">Safety Support</div>
        </Card>
      </div>

      {/* Trust badges */}
      <div className="bg-muted rounded-3xl p-8 w-full max-w-4xl animate-fade-in delay-700">
        <h3 className="text-2xl font-bold text-center mb-6">
          Protected by Industry Standards
        </h3>
        <div className="grid grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-6xl mb-2">🔒</div>
            <p className="font-semibold">Secure Payments</p>
          </div>
          <div>
            <div className="text-6xl mb-2">🛡️</div>
            <p className="font-semibold">Data Protection</p>
          </div>
          <div>
            <div className="text-6xl mb-2">✅</div>
            <p className="font-semibold">Verified Platform</p>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-12 text-center animate-fade-in delay-800">
        <p className="text-4xl font-bold text-foreground mb-2">
          Trust. Safety. Peace of Mind.
        </p>
        <p className="text-xl text-muted-foreground">
          We've got your back, every step of the way
        </p>
      </div>
    </div>
  );
}
