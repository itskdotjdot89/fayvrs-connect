import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id?: string;
  plan?: 'monthly' | 'yearly';
  subscription_end?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  activeRole: 'requester' | 'provider' | 'admin' | null;
  userRoles: ('requester' | 'provider' | 'admin')[];
  switchRole: (role: 'requester' | 'provider' | 'admin') => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'requester' | 'provider', phone?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  signInWithPhone: (phone: string) => Promise<{ error: any }>;
  verifyOTP: (phone: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [activeRole, setActiveRole] = useState<'requester' | 'provider' | 'admin' | null>(null);
  const [userRoles, setUserRoles] = useState<('requester' | 'provider' | 'admin')[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        setLoading(false);
        
        // Load user roles when session changes
        if (currentSession?.user) {
          setTimeout(() => {
            loadUserRoles(currentSession.user.id);
          }, 0);
        } else {
          setUserRoles([]);
          setActiveRole(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      setLoading(false);
      
      if (currentSession?.user) {
        loadUserRoles(currentSession.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserRoles = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);

      if (error) throw error;

      const roles = data.map(r => r.role as 'requester' | 'provider');
      setUserRoles(roles);
      
      // Set active role to the first available role, or from localStorage
      const savedRole = localStorage.getItem('activeRole') as 'requester' | 'provider' | null;
      if (savedRole && roles.includes(savedRole)) {
        setActiveRole(savedRole);
      } else if (roles.length > 0) {
        setActiveRole(roles[0]);
        localStorage.setItem('activeRole', roles[0]);
      }
    } catch (error) {
      console.error('Error loading user roles:', error);
    }
  };

  const switchRole = async (role: 'requester' | 'provider') => {
    if (!userRoles.includes(role)) {
      toast({
        title: "Role not available",
        description: "You don't have access to this role",
        variant: "destructive"
      });
      return;
    }
    
    setActiveRole(role);
    localStorage.setItem('activeRole', role);
    
    toast({
      title: "Role switched",
      description: `Switched to ${role} mode`
    });
  };

  // Check subscription whenever session changes
  useEffect(() => {
    const checkSubscription = async () => {
      if (!session) {
        setSubscriptionStatus(null);
        return;
      }

      try {
        const { data, error } = await supabase.functions.invoke('check-subscription', {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });

        if (error) throw error;
        setSubscriptionStatus(data);
      } catch (error) {
        console.error('Error checking subscription:', error);
        setSubscriptionStatus(null);
      }
    };

    checkSubscription();

    // Periodic subscription check (every 60 seconds)
    if (!session) return;

    const interval = setInterval(() => {
      checkSubscription();
    }, 60000);

    return () => clearInterval(interval);
  }, [session]);

  const signUp = async (email: string, password: string, fullName: string, role: 'requester' | 'provider', phone?: string) => {
    const redirectUrl = `${window.location.origin}/identity-verification`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          role: role,
          phone: phone
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Account created! Please complete identity verification."
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/identity-verification`
      }
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signInWithApple = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/identity-verification`
      }
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signInWithPhone = async (phone: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      phone
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "OTP sent",
        description: "Check your phone for the verification code"
      });
    }

    return { error };
  };

  const verifyOTP = async (phone: string, token: string) => {
    const { error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: 'sms'
    });

    if (error) {
      toast({
        title: "Verification failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Phone verified successfully"
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You've been signed out successfully"
    });
  };

  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('request-password-reset', {
        body: { email }
      });
      
      if (error) {
        toast({
          title: "Error",
          description: "Failed to send reset email",
          variant: "destructive",
        });
        return { error };
      }
      
      toast({
        title: "Check your email",
        description: "We've sent you a password reset link",
      });
      return { error: null };
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to send reset email",
        variant: "destructive",
      });
      return { error };
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      loading, 
      subscriptionStatus,
      activeRole,
      userRoles,
      switchRole,
      signUp, 
      signIn,
      signInWithGoogle,
      signInWithApple,
      signInWithPhone,
      verifyOTP,
      signOut,
      resetPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};