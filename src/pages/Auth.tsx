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
import { User, Briefcase, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import fayvrsLogo from "@/assets/fayvrs-logo-full.png";
export default function Auth() {
  const [role, setRole] = useState<"requester" | "provider">("requester");
  const [isSignUp, setIsSignUp] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");
  const [usernameChecking, setUsernameChecking] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPhoneAuth, setShowPhoneAuth] = useState(false);
  const [showOTPInput, setShowOTPInput] = useState(false);
  const [showPasswordReset, setShowPasswordReset] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [mode, setMode] = useState<string | null>(null);
  const [referralCode, setReferralCode] = useState<string | null>(null);
  const {
    user,
    signUp,
    signIn,
    signInWithGoogle,
    signInWithApple,
    signInWithPhone,
    verifyOTP,
    resetPassword
  } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  useEffect(() => {
    const handlePasswordReset = async () => {
      // Check for password reset mode in URL
      const urlParams = new URLSearchParams(window.location.search);
      const resetMode = urlParams.get('mode');
      
      // Check if we have a recovery token in the URL hash
      const hashParams = new URLSearchParams(window.location.hash.substring(1));
      const accessToken = hashParams.get('access_token');
      const type = hashParams.get('type');
      
      if (type === 'recovery' && accessToken) {
        setMode('reset');
        setShowPasswordReset(false);
        return;
      }
      
      if (resetMode === 'reset') {
        setMode('reset');
        setShowPasswordReset(false);
        return;
      }

      if (user && mode !== 'reset') {
        navigate('/feed');
      }
    };

    handlePasswordReset();

    // Check for referral code in localStorage
    const storedCode = localStorage.getItem('referral_code');
    const storedExpiry = localStorage.getItem('referral_expires');
    
    if (storedCode && storedExpiry) {
      const expiryTime = parseInt(storedExpiry);
      if (Date.now() < expiryTime) {
        setReferralCode(storedCode);
      } else {
        // Clear expired referral code
        localStorage.removeItem('referral_code');
        localStorage.removeItem('referral_expires');
      }
    }
  }, [user, navigate, mode]);
  // Username validation function
  const checkUsernameAvailability = async (usernameValue: string) => {
    if (!usernameValue) {
      setUsernameError("");
      setUsernameAvailable(null);
      return;
    }

    // Format validation
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
    if (!usernameRegex.test(usernameValue)) {
      setUsernameError("Username must be 3-20 characters (letters, numbers, underscores only)");
      setUsernameAvailable(false);
      return;
    }

    setUsernameChecking(true);
    setUsernameError("");

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', usernameValue.toLowerCase())
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUsernameError("Username is already taken");
        setUsernameAvailable(false);
      } else {
        setUsernameAvailable(true);
      }
    } catch (error) {
      console.error('Error checking username:', error);
      setUsernameError("Error checking username availability");
      setUsernameAvailable(false);
    } finally {
      setUsernameChecking(false);
    }
  };

  // Debounce username check
  useEffect(() => {
    if (!isSignUp) return;
    
    const timer = setTimeout(() => {
      if (username) {
        checkUsernameAvailability(username);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [username, isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      // Validate username for signup
      if (!username) {
        toast({
          title: "Username required",
          description: "Please enter a username",
          variant: "destructive",
        });
        return;
      }

      if (!usernameAvailable) {
        toast({
          title: "Invalid username",
          description: usernameError || "Please choose a valid username",
          variant: "destructive",
        });
        return;
      }
    }

    setIsLoading(true);
    if (isSignUp) {
      const {
        error
      } = await signUp(email, password, fullName, role, phone, referralCode || undefined);
      if (!error) {
        // Get the current session to access the new user
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          // Update profile with username
          await supabase
            .from('profiles')
            .update({ username: username.toLowerCase() })
            .eq('id', session.user.id);
        }
        
        // Clear referral code from localStorage after successful signup
        localStorage.removeItem('referral_code');
        localStorage.removeItem('referral_expires');
        // Navigate to feed instead of forcing verification - verification is optional
        navigate('/feed');
      }
    } else {
      const {
        error
      } = await signIn(email, password);
      if (!error) {
        navigate('/feed');
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
        navigate('/feed');
      }
    }
    setIsLoading(false);
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await resetPassword(resetEmail);
    setIsLoading(false);
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive"
      });
      return;
    }

    if (newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Attempting to update password...');
      
      // First check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Current session:', session ? 'exists' : 'none', sessionError);
      
      if (sessionError || !session) {
        toast({
          title: "Error",
          description: "Your password reset link has expired. Please request a new one.",
          variant: "destructive"
        });
        setMode(null);
        setShowPasswordReset(true);
        return;
      }

      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });
      
      console.log('Update result:', error ? error.message : 'success');
      
      if (error) {
        toast({
          title: "Error",
          description: error.message || "Failed to update password",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: "Password updated successfully"
        });
        // Clear the URL parameters
        window.history.replaceState({}, document.title, "/auth");
        navigate('/feed');
      }
    } catch (err) {
      console.error('Password update error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
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
              {mode === 'reset' ? "Reset Password" : showPasswordReset ? "Reset Password" : isSignUp ? "Sign Up" : "Sign In"}
            </CardTitle>
            <CardDescription>
              {mode === 'reset' ? "Enter your new password" : showPasswordReset ? "Enter your email to receive a reset link" : isSignUp ? "Choose your account type to get started" : "Enter your credentials to access your account"}
            </CardDescription>
          </CardHeader>
          <CardContent>

            {/* Password Reset Mode - Update Password */}
            {mode === 'reset' && (
              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input 
                    id="newPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)} 
                    required 
                    minLength={6}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input 
                    id="confirmPassword" 
                    type="password" 
                    placeholder="••••••••" 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    required 
                    minLength={6}
                  />
                  {newPassword !== confirmPassword && confirmPassword && (
                    <p className="text-xs text-destructive">Passwords do not match</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading || newPassword !== confirmPassword}>
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </form>
            )}

            {/* Password Reset Form - Request Link */}
            {!mode && showPasswordReset && (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="resetEmail">Email</Label>
                  <Input 
                    id="resetEmail" 
                    type="email" 
                    placeholder="you@example.com" 
                    value={resetEmail} 
                    onChange={e => setResetEmail(e.target.value)} 
                    required 
                  />
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>

                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full" 
                  onClick={() => setShowPasswordReset(false)}
                >
                  Back to Sign In
                </Button>
              </form>
            )}

            {/* Phone Auth Form */}
            {!mode && !showPasswordReset && showPhoneAuth && <form onSubmit={handlePhoneSubmit} className="space-y-4 mb-6">
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

            {/* Referral Code Indicator */}
            {!mode && !showPasswordReset && !showPhoneAuth && isSignUp && referralCode && (
              <div className="mb-4 p-3 bg-primary/10 border border-primary/20 rounded-lg text-center">
                <p className="text-sm font-medium text-primary">🎉 Referral code applied!</p>
                <p className="text-xs text-muted-foreground mt-1">You'll get your first month free</p>
              </div>
            )}

            {/* Email/Password Form */}
            {!mode && !showPasswordReset && !showPhoneAuth && isSignUp && <div className="mb-6">
                <Label className="mb-3 block text-center">I'm primarily interested in:</Label>
                <div className="grid grid-cols-2 gap-4">
                  <button type="button" onClick={() => setRole("requester")} className={`p-4 border-2 rounded-lg transition-all ${role === "requester" ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                    <User className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-sm">Customer</p>
                    <p className="text-xs text-muted-foreground mt-1">Post requests • Free with verification</p>
                  </button>
                  <button type="button" onClick={() => setRole("provider")} className={`p-4 border-2 rounded-lg transition-all ${role === "provider" ? "border-primary bg-accent" : "border-border hover:border-primary/50"}`}>
                    <Briefcase className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="font-semibold text-sm">Provider</p>
                    <p className="text-xs text-muted-foreground mt-1">Get leads • Subscription required</p>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  ✨ You'll have access to both features after signing up
                </p>
              </div>}

            {!mode && !showPasswordReset && !showPhoneAuth && <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && <>
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" value={fullName} onChange={e => setFullName(e.target.value)} required={isSignUp} />
                </div>
              </>}

              {isSignUp && (
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <div className="relative">
                    <Input 
                      id="username" 
                      type="text" 
                      placeholder="johndoe" 
                      value={username} 
                      onChange={e => setUsername(e.target.value.toLowerCase())} 
                      required
                      minLength={3}
                      maxLength={20}
                      pattern="[a-zA-Z0-9_]+"
                      className={usernameError ? "border-destructive" : usernameAvailable ? "border-primary" : ""}
                    />
                    {usernameChecking && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                    {!usernameChecking && usernameAvailable !== null && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {usernameAvailable ? (
                          <CheckCircle className="h-4 w-4 text-primary" />
                        ) : (
                          <span className="text-destructive text-lg">✕</span>
                        )}
                      </div>
                    )}
                  </div>
                  {usernameError && (
                    <p className="text-xs text-destructive">{usernameError}</p>
                  )}
                  {!usernameError && username && (
                    <p className="text-xs text-muted-foreground">
                      3-20 characters, letters, numbers, and underscores only
                    </p>
                  )}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                {!isSignUp && (
                  <button
                    type="button"
                    onClick={() => setShowPasswordReset(true)}
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
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

              <div className="relative my-4">
                <Separator />
                <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-card px-2 text-xs text-muted-foreground">
                  or continue with
                </span>
              </div>

              <Button 
                type="button" 
                variant="outline" 
                className="w-full" 
                onClick={() => signInWithGoogle()}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </Button>
              </form>}

            {!mode && !showPasswordReset && (
              <div className="mt-6 text-center">
                <button onClick={() => setIsSignUp(!isSignUp)} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  {isSignUp ? <>Already have an account? <span className="font-semibold">Sign in</span></> : <>Don't have an account? <span className="font-semibold">Sign up</span></>}
                </button>
              </div>
            )}

            {isSignUp && <div className="mt-6 pt-6 border-t">
                <p className="text-xs text-muted-foreground text-center">
                  By creating an account, you agree to our{" "}
                  <Link to="/terms-of-service" className="text-primary hover:underline">Terms of Service</Link>
                  {" "}and{" "}
                  <Link to="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>.
                </p>
              </div>}
          </CardContent>
        </Card>
      </div>
    </div>;
}