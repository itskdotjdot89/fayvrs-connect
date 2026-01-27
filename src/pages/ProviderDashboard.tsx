import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, MessageCircle, CheckCircle, Calendar, TrendingUp, ArrowUpRight, 
  Loader2, Settings, Wallet, FileText, CreditCard, Briefcase, Clock,
  AlertCircle
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NearbyRequestsWidget } from "@/components/NearbyRequestsWidget";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReferralEarningsCard } from "@/components/ReferralEarningsCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user, subscriptionStatus } = useAuth();
  const { hasProviderAccess, isSubscribed, isVerified, loading: accessLoading, missingRequirements } = useProviderAccess();

  // Fetch profile for NearbyRequestsWidget
  const { data: profile, isLoading: loadingProfile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("latitude, longitude, current_latitude, current_longitude, service_radius")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch proposals count
  const { data: proposalsCount, isLoading: loadingProposals } = useQuery({
    queryKey: ['proposals-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user!.id);
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch pending proposals count
  const { data: pendingProposalsCount, isLoading: loadingPending } = useQuery({
    queryKey: ['pending-proposals-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user!.id)
        .eq('status', 'pending');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch selections count (active jobs)
  const { data: selectionsCount, isLoading: loadingSelections } = useQuery({
    queryKey: ['selections-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('proposals')
        .select('*', { count: 'exact', head: true })
        .eq('provider_id', user!.id)
        .eq('status', 'accepted');
      
      if (error) throw error;
      return count || 0;
    },
    enabled: !!user?.id,
  });

  // Fetch recent activity
  const { data: recentProposals, isLoading: loadingActivity, error: activityError } = useQuery({
    queryKey: ['recent-proposals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, requests(*)')
        .eq('provider_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Apple App Store Guideline 5.1.1: Don't block dashboard access for verification
  // Verification is only required for payouts and high-value jobs

  const stats = [
    { 
      label: "Active Jobs", 
      value: selectionsCount?.toString() || "0", 
      icon: Briefcase, 
      color: "text-verified",
      isLoading: loadingSelections,
      onClick: () => navigate('/feed?filter=active'),
      description: "Jobs you're working on"
    },
    { 
      label: "Pending", 
      value: pendingProposalsCount?.toString() || "0", 
      icon: Clock, 
      color: "text-orange-500",
      isLoading: loadingPending,
      onClick: () => navigate('/feed?filter=pending'),
      description: "Awaiting customer response"
    },
    { 
      label: "Total Sent", 
      value: proposalsCount?.toString() || "0", 
      icon: MessageCircle, 
      color: "text-purple-500", 
      isLoading: loadingProposals,
      onClick: () => navigate('/feed'),
      description: "All proposals sent"
    },
  ];

  // Quick actions for the dashboard
  const quickActions = [
    {
      label: "Browse Jobs",
      icon: Eye,
      onClick: () => navigate('/feed'),
      variant: "default" as const,
    },
    {
      label: "My Portfolio",
      icon: FileText,
      onClick: () => navigate('/portfolio'),
      variant: "outline" as const,
    },
    {
      label: "Manage Subscription",
      icon: CreditCard,
      onClick: () => navigate('/subscription-details'),
      variant: "outline" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-poppins text-foreground">Provider Dashboard</h1>
            <p className="text-sm text-muted-foreground">Your performance overview</p>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate('/provider-settings')}
            className="rounded-xl"
          >
            <Settings className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Verification Alert */}
        {!isVerified && isSubscribed && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>Complete verification to unlock payouts and high-value jobs</span>
              <Button size="sm" variant="outline" onClick={() => navigate('/identity-verification')}>
                Verify Now
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Subscription Status */}
        {isSubscribed ? (
          <Card 
            className="bg-gradient-to-br from-primary to-primary-hover text-white cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => navigate('/subscription-details')}
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <Badge className="bg-white/20 text-white border-white/30">Active</Badge>
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm opacity-90">Current Plan</p>
                <h2 className="text-2xl font-bold capitalize">
                  {subscriptionStatus?.plan === 'monthly'
                    ? 'Monthly'
                    : subscriptionStatus?.plan === 'yearly'
                      ? 'Annual'
                      : 'Pro'}{' '}
                  Subscription
                </h2>
              </div>
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm">
                  {subscriptionStatus?.plan
                    ? `$${subscriptionStatus.plan === 'monthly' ? '29.99/month' : '239.99/year'}`
                    : 'Active'}
                </span>
                <Button 
                  size="sm" 
                  variant="secondary" 
                  className="rounded-xl"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/customer-center');
                  }}
                >
                  Manage
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-2 border-primary bg-gradient-to-br from-primary/5 to-primary/10">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center flex-shrink-0">
                  <CreditCard className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-foreground">Start Earning Today</h3>
                  <p className="text-sm text-muted-foreground">
                    Subscribe to unlock unlimited leads and connect with customers in your area
                  </p>
                </div>
              </div>
              <div className="bg-white/50 rounded-lg p-3 space-y-1">
                <p className="text-sm font-medium text-foreground">What you get:</p>
                <ul className="text-xs text-muted-foreground space-y-1">
                  <li>✓ Unlimited job leads in your area</li>
                  <li>✓ Direct messaging with customers</li>
                  <li>✓ 7-day free trial included</li>
                </ul>
              </div>
              <Button 
                size="lg"
                className="w-full rounded-xl text-base font-semibold"
                onClick={() => navigate('/provider-paywall')}
              >
                View Subscription Options
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Starting at $29.99/month • Cancel anytime
              </p>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3">
          {quickActions.map((action) => (
            <Button
              key={action.label}
              variant={action.variant}
              className="flex-col h-auto py-4 px-2 gap-2 rounded-xl"
              onClick={action.onClick}
            >
              <action.icon className="w-5 h-5" />
              <span className="text-xs">{action.label}</span>
            </Button>
          ))}
        </div>

        {/* Referral Earnings - Clickable */}
        <div onClick={() => navigate('/referral-dashboard')} className="cursor-pointer">
          <ReferralEarningsCard variant="full" />
        </div>

        {/* Stats Grid - Clickable */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card 
              key={stat.label} 
              className="cursor-pointer hover:shadow-md transition-shadow"
              onClick={stat.onClick}
            >
              <CardContent className="p-4 space-y-2">
                <div className={`w-8 h-8 rounded-xl bg-accent flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-4 h-4" />
                </div>
                <div>
                  {stat.isLoading ? (
                    <Skeleton className="h-7 w-12 mb-1" />
                  ) : (
                    <p className="text-xl font-bold text-foreground">{stat.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Nearby Requests */}
        {loadingProfile ? (
          <Card>
            <CardContent className="p-6">
              <Skeleton className="h-32 w-full" />
            </CardContent>
          </Card>
        ) : (
          <NearbyRequestsWidget profile={profile} />
        )}

        {/* Recent Activity */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
            {recentProposals && recentProposals.length > 0 && (
              <Button variant="ghost" size="sm" onClick={() => navigate('/feed')}>
                View All
              </Button>
            )}
          </div>
          
          {activityError ? (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-destructive text-sm">Failed to load activity</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </CardContent>
            </Card>
          ) : loadingActivity ? (
            <Card>
              <CardContent className="p-4 space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : recentProposals && recentProposals.length > 0 ? (
            <div className="space-y-2">
              {recentProposals.map((proposal) => (
                <Card 
                  key={proposal.id} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => navigate(`/request/${proposal.request_id}`)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        proposal.status === 'accepted' 
                          ? 'bg-verified/10' 
                          : 'bg-purple-100'
                      }`}>
                        {proposal.status === 'accepted' ? (
                          <CheckCircle className="w-4 h-4 text-verified" />
                        ) : (
                          <MessageCircle className="w-4 h-4 text-purple-500" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {proposal.status === 'accepted' ? 'You were selected!' : 'Proposal sent'}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">{proposal.requests?.title}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(proposal.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button size="sm" variant="ghost" className="rounded-xl flex-shrink-0">
                        <ArrowUpRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No activity yet</p>
                <Button onClick={() => navigate('/feed')}>
                  Browse Requests
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Upgrade CTA (only show if on monthly) */}
        {subscriptionStatus?.plan === 'monthly' && (
          <Card 
            className="border-2 border-primary/20 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/provider-paywall')}
          >
            <CardContent className="p-6 space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-1">Save with Annual Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Upgrade to yearly and save over $100 per year
                  </p>
                </div>
              </div>
              <Button className="w-full rounded-xl">
                Upgrade to Annual - $239.99/year
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
