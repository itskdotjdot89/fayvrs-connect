import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, CheckCircle, Calendar, TrendingUp, ArrowUpRight, Loader2, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { NearbyRequestsWidget } from "@/components/NearbyRequestsWidget";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { hasProviderAccess, loading: accessLoading, missingRequirements } = useProviderAccess();

  // Fetch subscription
  const { data: subscription, isLoading: loadingSubscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('provider_subscriptions')
        .select('*')
        .eq('provider_id', user!.id)
        .eq('status', 'active')
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch proposals count
  const { data: proposalsCount } = useQuery({
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

  // Fetch selections count
  const { data: selectionsCount } = useQuery({
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
  const { data: recentProposals } = useQuery({
    queryKey: ['recent-proposals', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, requests(*)')
        .eq('provider_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(3);
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  if (accessLoading || loadingSubscription) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to verification if needed
  if (missingRequirements.needsVerification) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Verification Required</CardTitle>
            <CardDescription>
              Complete identity verification to access provider features
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              You can browse requests without verification, but you'll need to verify your identity to:
            </p>
            <ul className="text-sm space-y-2 ml-4 list-disc text-muted-foreground">
              <li>Submit proposals to requests</li>
              <li>Access the provider dashboard</li>
              <li>Message requesters</li>
            </ul>
            <Button onClick={() => navigate('/identity-verification')} className="w-full">
              Complete Verification
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const stats = [
    { label: "Proposals", value: proposalsCount?.toString() || "0", icon: MessageCircle, color: "text-purple-500" },
    { label: "Selections", value: selectionsCount?.toString() || "0", icon: CheckCircle, color: "text-verified" },
    { 
      label: "Renewal", 
      value: subscription?.expires_at 
        ? new Date(subscription.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : "N/A", 
      icon: Calendar, 
      color: "text-orange-500" 
    },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold font-poppins text-foreground">Dashboard</h1>
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
        {/* Subscription Status */}
        {subscription ? (
          <div className="bg-gradient-to-br from-primary to-primary-hover rounded-card p-6 shadow-soft text-white space-y-3">
            <div className="flex items-center justify-between">
              <Badge className="bg-white/20 text-white border-white/30">
                {subscription.status === 'active' ? 'Active' : 'Inactive'}
              </Badge>
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm opacity-90">Current Plan</p>
              <h2 className="text-2xl font-bold capitalize">{subscription.plan} Subscription</h2>
            </div>
            <div className="flex items-center justify-between pt-2">
              <span className="text-sm">${subscription.plan === 'monthly' ? '30/month' : '240/year'}</span>
              <Button 
                size="sm" 
                variant="secondary" 
                className="rounded-xl"
                onClick={() => navigate('/provider-checkout')}
              >
                Manage
              </Button>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-card p-6 shadow-soft space-y-3 border-2 border-primary">
            <h3 className="font-semibold text-foreground">No Active Subscription</h3>
            <p className="text-sm text-muted-foreground">
              Subscribe to start receiving leads and connect with customers
            </p>
            <Button 
              className="w-full rounded-xl"
              onClick={() => navigate('/provider-checkout')}
            >
              Subscribe Now
            </Button>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-card p-4 shadow-soft space-y-2">
              <div className={`w-8 h-8 rounded-xl bg-accent flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Nearby Requests */}
        <NearbyRequestsWidget />

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground px-1">Recent Activity</h3>
          
          {recentProposals && recentProposals.length > 0 ? (
            recentProposals.map((proposal) => (
              <div 
                key={proposal.id} 
                className="bg-white rounded-card p-4 shadow-soft cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/request/${proposal.request_id}`)}
              >
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
                    <p className="text-xs text-muted-foreground">{proposal.requests?.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(proposal.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Button size="sm" variant="ghost" className="rounded-xl flex-shrink-0">
                    <ArrowUpRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-card p-8 shadow-soft text-center">
              <p className="text-muted-foreground">No recent activity</p>
              <Button 
                className="mt-4"
                onClick={() => navigate('/feed')}
              >
                Browse Requests
              </Button>
            </div>
          )}
        </div>

        {/* Upgrade CTA (only show if on monthly) */}
        {subscription?.plan === 'monthly' && (
          <div className="bg-white rounded-card p-6 shadow-soft space-y-3 border-2 border-primary/20">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-foreground mb-1">Save 33% with Annual</h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade to yearly and save $120 per year
                </p>
              </div>
            </div>
            <Button 
              className="w-full rounded-xl"
              onClick={() => navigate('/provider-checkout')}
            >
              Upgrade to Annual - $240/year
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
