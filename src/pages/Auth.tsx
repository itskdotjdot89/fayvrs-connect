import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { User, Briefcase } from "lucide-react";
import { Link } from "react-router-dom";
import fayvrsLogo from "@/assets/fayvrs-logo-full.png";
export default function Auth() {
  const [role, setRole] = useState<"requester" | "provider">("requester");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const {
    user,
    signUp,
    signIn,
    signInWithPhone,
    verifyOTP
  } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (user) {
      navigate('/feed');
    }
  }, [user, navigate]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (isSignUp) {
      const {
        error
      } = await signUp(email, password, fullName, role, phone);
      if (!error) {
        navigate('/identity-verification');
      }
    } else {
      const {
        error
      } = await signIn(email, password);
      if (!error) {
        navigate('/identity-verification');
      }
    }
    setIsLoading(false);
  };
  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    if (!showOTPInput) {
      const {
        error
      } = await signInWithPhone(phone);
      if (!error) {
        setShowOTPInput(true);
      }
    } else {
      const {
        error
      } = await verifyOTP(phone, otp);
      if (!error) {
        navigate('/identity-verification');
      }
    }
    setIsLoading(false);
  };
  return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gradient-to-b from-accent/30 to-background py-12 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src={fayvrsLogo} alt="Fayvrs" className="h-32 w-auto" />
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isSignUp ? "Create Your Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignUp ? "Join the marketplace with no customer fees" : "Sign in to continue"}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {isSignUp ? "Sign Up" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {isSignUp ? "Choose your account type to get started" : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Phone Auth Form */}
            {showPhoneAuth && <form onSubmit={handlePhoneSubmit} className="space-y-4 mb-6">
                {!showOTPInput ? <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={e => setPhone(e.target.value)} required />
                  </div> : <div className="space-y-2">
                    <Label htmlFor="otp">Verification Code</Label>
                    <Input id="otp" type="text" placeholder="123456" value={otp} onChange={e => setOtp(e.target.value)} required maxLength={6} />
                  </div>}

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Loading..." : showOTPInput ? "Verify Code" : "Send Code"}
                </Button>

                <Button type="button" variant="ghost" className="w-full" onClick={() => {
              setShowPhoneAuth(false);
              setShowOTPInput(false);
              setPhone("");
              setOtp("");
            }}>
                  Back to other options
                </Button>
              </form>}

            {/* Email/Password Form */}
            {!showPhoneAuth && isSignUp && <div className="mb-6">
                <Label className="mb-3 block">I want to:</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => setRole("requester")} className={`p-4 border-2 rounded-lg transition-all ${role === "requester" ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                    <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-sm">Find Services</p>
                    <p className="text-xs text-muted-foreground mt-1">Post requests</p>
                  </button>
                  <button onClick={() => setRole("provider")} className={`p-4 border-2 rounded-lg transition-all ${role === "provider" ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                    <Briefcase className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-sm">Offer Services</p>
                    <p className="text-xs text-muted-foreground mt-1">Get leads</p>
                  </button>
                </div>
              </div>}

            {!showPhoneAuth && <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required={isSignUp} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone Number</Label>
                  <Input id="signup-phone" type="tel" placeholder="+1 (555) 123-4567" value={phone} onChange={e => setPhone(e.target.value)} required={isSignUp} />
                </div>
              </>}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
              </div>

              {isSignUp && role === "provider" && <div className="p-4 bg-accent rounded-lg">
                  <p className="text-sm font-medium mb-2">Provider Subscription Required</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="default">$30/month</Badge>
                    <span className="text-xs text-muted-foreground">or</span>
                    <Badge variant="outline">$240/year</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    After creating your account, you'll be redirected to complete your subscription
                  </p>
                </div>}

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Loading..." : isSignUp ? "Create Account" : "Sign In"}
              </Button>
              </form>}

            <div className="mt-6 text-center">
              <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                {isSignUp ? <>Already have an account? <span className="font-semibold">Sign in</span></> : <>Don't have an account? <span className="font-semibold">Sign up</span></>}
              </button>
            </div>

            {isSignUp && <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our{" "}
                  <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                  {" "}Identity verification required for all users.
                </p>
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
}