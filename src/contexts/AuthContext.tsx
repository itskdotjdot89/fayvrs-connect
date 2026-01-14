import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { isNative } from '@/utils/platform';

interface SubscriptionStatus {
  subscribed: boolean;
  product_id?: string;
  plan?: 'monthly' | 'yearly';
  subscription_end?: string;
  source?: 'revenuecat' | 'apple' | 'google';
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  subscriptionStatus: SubscriptionStatus | null;
  activeRole: 'requester' | 'provider' | 'admin' | null;
  userRoles: ('requester' | 'provider' | 'admin')[];
  switchRole: (role: 'requester' | 'provider' | 'admin') => Promise<void>;
  refreshSubscriptionStatus: () => Promise<void>;
  signUp: (email: string, password: string, fullName: string, role: 'requester' | 'provider', phone?: string, referralCode?: string) => Promise<{ error: any }>;
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

  const switchRole = async (role: 'requester' | 'provider' | 'admin') => {
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

  // Manually refresh subscription status (called after purchase completes)
  // Now relies on RevenueCat - this is just for syncing to database
  const refreshSubscriptionStatus = async () => {
    if (!session || !user) return;
    
    // Simply query the local database for subscription status
    // RevenueCat webhooks keep this in sync
    try {
      const { data, error } = await supabase
        .from('provider_subscriptions')
        .select('*')
        .eq('provider_id', user.id)
        .eq('status', 'active')
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        const source = isNative() ? 'apple' : 'revenuecat';
        setSubscriptionStatus({
          subscribed: true,
          plan: data.plan as 'monthly' | 'yearly',
          subscription_end: data.expires_at,
          source
        });
        console.log('[AuthContext] Subscription status refreshed from database:', data);
      } else {
        setSubscriptionStatus({ subscribed: false });
      }
    } catch (error) {
      console.error('Error refreshing subscription status:', error);
    }
  };

  // Check subscription whenever session changes
  // RevenueCat webhooks keep the database in sync - we just read from the database
  // IMPORTANT: This runs in the background and does NOT block initial app render
  useEffect(() => {
    if (!session || !user) {
      setSubscriptionStatus(null);
      return;
    }

    // Query database for subscription status (kept in sync by RevenueCat webhooks)
    const syncSubscriptionStatus = async () => {
      try {
        const { data, error } = await supabase
          .from('provider_subscriptions')
          .select('*')
          .eq('provider_id', user.id)
          .eq('status', 'active')
          .single();

        if (error && error.code !== 'PGRST116') throw error;
        
        if (data) {
          const source = isNative() ? 'apple' : 'revenuecat';
          setSubscriptionStatus({
            subscribed: true,
            plan: data.plan as 'monthly' | 'yearly',
            subscription_end: data.expires_at,
            source
          });
        } else {
          setSubscriptionStatus({ subscribed: false });
        }
      } catch (error) {
        console.error('Error syncing subscription status:', error);
        // Don't clear subscription status on error - RevenueCat is the source of truth
      }
    };

    // Small delay to prioritize UI render first
    const timeout = setTimeout(syncSubscriptionStatus, 100);

    // Periodic subscription sync (every 60 seconds)
    const interval = setInterval(syncSubscriptionStatus, 60000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [session, user]);

  const signUp = async (email: string, password: string, fullName: string, role: 'requester' | 'provider', phone?: string, referralCode?: string) => {
    // Apple App Store Guideline 5.1.1: Don't force verification after signup
    const redirectUrl = `${window.location.origin}/feed`;
    
    const { data, error } = await supabase.auth.signUp({
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
        description: "Welcome to Fayvrs! Your account has been created."
      });

      // Apply referral code if provided
      if (referralCode && data.user) {
        try {
          await supabase.functions.invoke('apply-referral-code', {
            body: { referral_code: referralCode }
          });
        } catch (err) {
          console.error('Error applying referral code:', err);
          // Don't show error to user - signup was successful
        }
      }
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    // Apple App Store Guideline 5.1.1: Don't force verification after OAuth
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/feed`
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
    // Apple App Store Guideline 5.1.1: Don't force verification after OAuth
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: {
        redirectTo: `${window.location.origin}/feed`
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
      refreshSubscriptionStatus,
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