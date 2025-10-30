import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { FileText, MessageSquare, CheckCircle, Clock, DollarSign } from "lucide-react";
import { NearbyProvidersWidget } from "@/components/NearbyProvidersWidget";
import { ReferralEarningsCard } from "@/components/ReferralEarningsCard";

export default function RequesterDashboard() {
  const { user } = useAuth();

  // Fetch user's requests with proposal counts
  const { data: requests, isLoading: requestsLoading } = useQuery({
    queryKey: ["requester-requests", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("requests")
        .select(`
          *,
          proposals:proposals(count)
        `)
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch recent proposals for user's requests
  const { data: recentProposals, isLoading: proposalsLoading } = useQuery({
    queryKey: ["requester-proposals", user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("proposals")
        .select(`
          *,
          profiles:profiles(full_name, avatar_url, is_verified),
          requests:requests!inner(user_id, title)
        `)
        .eq("requests.user_id", user?.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Calculate statistics
  const activeRequests = requests?.filter((r) => r.status === "open").length || 0;
  const inProgressRequests = requests?.filter((r) => r.status === "in_progress").length || 0;
  const totalProposals = requests?.reduce((sum, r) => sum + (r.proposals?.[0]?.count || 0), 0) || 0;
  const completedRequests = requests?.filter((r) => r.status === "completed").length || 0;

  if (requestsLoading || proposalsLoading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">My Dashboard</h1>
          <p className="text-muted-foreground">Manage your requests and track proposals</p>
        </div>
        <Button asChild>
          <Link to="/post-request">Post New Request</Link>
        </Button>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Requests</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeRequests}</div>
            <p className="text-xs text-muted-foreground">Open and accepting proposals</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proposals Received</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProposals}</div>
            <p className="text-xs text-muted-foreground">Total from all requests</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressRequests}</div>
            <p className="text-xs text-muted-foreground">Active projects</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedRequests}</div>
            <p className="text-xs text-muted-foreground">Finished projects</p>
          </CardContent>
        </Card>

        <ReferralEarningsCard variant="compact" />
      </div>

      {/* Nearby Providers Widget */}
      <NearbyProvidersWidget />

      <div className="grid gap-6 md:grid-cols-2">
        {/* My Requests */}
        <Card>
          <CardHeader>
            <CardTitle>My Requests</CardTitle>
            <CardDescription>Your recent service requests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {requests && requests.length > 0 ? (
              requests.slice(0, 5).map((request) => (
                <div key={request.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <Link to={`/request/${request.id}`} className="font-medium hover:underline">
                      {request.title}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={
                        request.status === "open" ? "default" :
                        request.status === "in_progress" ? "secondary" :
                        request.status === "completed" ? "outline" : "destructive"
                      }>
                        {request.status}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {request.proposals?.[0]?.count || 0} proposals
                      </span>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/request/${request.id}`}>View</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No requests yet</p>
                <Button asChild variant="link" className="mt-2">
                  <Link to="/post-request">Post your first request</Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Proposals */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Proposals</CardTitle>
            <CardDescription>Latest offers from providers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentProposals && recentProposals.length > 0 ? (
              recentProposals.map((proposal) => (
                <div key={proposal.id} className="flex items-start justify-between border-b pb-3 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{proposal.profiles?.full_name}</span>
                      {proposal.profiles?.is_verified && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {proposal.message}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline">
                        <DollarSign className="h-3 w-3 mr-1" />
                        {proposal.price}
                      </Badge>
                      <Badge variant={
                        proposal.status === "pending" ? "default" :
                        proposal.status === "accepted" ? "secondary" : "destructive"
                      }>
                        {proposal.status}
                      </Badge>
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm">
                    <Link to={`/request/${proposal.request_id}`}>View</Link>
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-20" />
                <p>No proposals yet</p>
                <p className="text-sm mt-1">Post a request to receive offers</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
