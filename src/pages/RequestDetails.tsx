import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, ArrowLeft, MessageCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ProposalForm } from "@/components/ProposalForm";
import { useProviderAccess } from "@/hooks/useProviderAccess";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function RequestDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, activeRole } = useAuth();
  const queryClient = useQueryClient();
  const [showProposalForm, setShowProposalForm] = useState(false);
  const { hasProviderAccess, missingRequirements } = useProviderAccess();

  // Fetch request details (only public profile fields)
  const { data: request, isLoading: loadingRequest } = useQuery({
    queryKey: ['request', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('requests')
        .select('*, profiles(id, username, full_name, avatar_url, location, bio, is_verified)')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Fetch proposals for this request (only public profile fields)
  const { data: proposals, isLoading: loadingProposals } = useQuery({
    queryKey: ['proposals', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('proposals')
        .select('*, profiles(id, username, full_name, avatar_url, location, bio, is_verified)')
        .eq('request_id', id)
        .order('price', { ascending: true });
      
      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Select provider mutation
  const selectProviderMutation = useMutation({
    mutationFn: async (proposalId: string) => {
      // Update proposal status
      const { error: proposalError } = await supabase
        .from('proposals')
        .update({ status: 'accepted' })
        .eq('id', proposalId);

      if (proposalError) throw proposalError;

      // Update request with selected proposal
      const { error: requestError } = await supabase
        .from('requests')
        .update({ 
          status: 'in_progress',
          selected_proposal_id: proposalId 
        })
        .eq('id', id);

      if (requestError) throw requestError;
    },
    onSuccess: () => {
      toast.success("Provider selected successfully!");
      queryClient.invalidateQueries({ queryKey: ['request', id] });
      queryClient.invalidateQueries({ queryKey: ['proposals', id] });
    },
    onError: () => {
      toast.error("Failed to select provider");
    },
  });

  if (loadingRequest) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!request) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Request not found</h2>
          <Button onClick={() => navigate('/feed')}>Back to Feed</Button>
        </div>
      </div>
    );
  }

  const isOwner = user?.id === request.user_id;
  const isProvider = activeRole === 'provider' && !isOwner;
  
  // Check if current user already has a proposal
  const hasUserProposal = proposals?.some(p => p.provider_id === user?.id);

  return (
    <div className="min-h-screen bg-surface pb-6">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Request Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Request Info Card */}
        <div className="bg-white rounded-card p-5 shadow-soft space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-foreground leading-snug flex-1">
              {request.title}
            </h2>
            <Badge variant="outline" className="rounded-full flex-shrink-0">
              {request.request_type}
            </Badge>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            {request.description}
          </p>

          {/* Display request images if any */}
          {request.images && request.images.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {request.images.map((imageUrl: string, index: number) => (
                <img
                  key={index}
                  src={imageUrl}
                  alt={`Request image ${index + 1}`}
                  className="w-24 h-24 object-cover rounded-lg border border-border"
                />
              ))}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Location</p>
                <p className="font-medium text-foreground">{request.location || 'Remote'}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-medium text-foreground capitalize">{request.status}</p>
              </div>
            </div>
          </div>

          {request.budget_min && request.budget_max && (
            <div className="pt-2 flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              <span className="text-2xl font-bold text-primary">
                ${request.budget_min}-${request.budget_max}
              </span>
            </div>
          )}
        </div>

        {/* Proposals Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-foreground">
              Proposals ({proposals?.length || 0})
            </h3>
            {proposals && proposals.length > 0 && (
              <span className="text-sm text-muted-foreground">Sorted by price</span>
            )}
          </div>

          {loadingProposals ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : proposals && proposals.length > 0 ? (
            proposals.map((proposal) => (
              <div key={proposal.id} className="bg-white rounded-card p-4 shadow-soft space-y-3">
                <div className="flex items-start gap-3">
                  <Avatar className="w-12 h-12 border-2 border-accent">
                    <AvatarImage src={proposal.profiles?.avatar_url} />
                    <AvatarFallback className="bg-primary text-white font-semibold">
                      {proposal.profiles?.full_name?.substring(0, 2).toUpperCase() || 'PR'}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-foreground text-sm">
                        @{proposal.profiles?.username || proposal.profiles?.full_name || 'Provider'}
                      </h4>
                      {proposal.profiles?.is_verified && (
                        <Badge variant="default" className="text-xs px-2 py-0 rounded-full bg-verified">
                          ✓ Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {proposal.message}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-border">
                  {proposal.price && (
                    <span className="text-lg font-bold text-primary">${proposal.price}</span>
                  )}
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="rounded-xl"
                      onClick={() => navigate(`/messages/${proposal.provider_id}`)}
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      Chat
                    </Button>
                    {isOwner && proposal.status === 'pending' && (
                      <Button 
                        size="sm" 
                        className="rounded-xl"
                        onClick={() => selectProviderMutation.mutate(proposal.id)}
                        disabled={selectProviderMutation.isPending}
                      >
                        {selectProviderMutation.isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          'Select'
                        )}
                      </Button>
                    )}
                    {proposal.status === 'accepted' && (
                      <Badge className="bg-verified">Selected</Badge>
                    )}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white rounded-card p-8 shadow-soft text-center">
              <p className="text-muted-foreground">No proposals yet</p>
            </div>
          )}
        </div>

        {/* Proposal Form for Providers */}
        {isProvider && request.status === 'open' && !hasUserProposal && (
          hasProviderAccess ? (
            <ProposalForm 
              requestId={request.id} 
              requestTitle={request.title}
              requestDescription={request.description}
              requestBudget={{ min: request.budget_min, max: request.budget_max }}
              onSuccess={() => setShowProposalForm(false)}
            />
          ) : (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button 
                      className="w-full" 
                      disabled
                    >
                      Submit Proposal
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="font-semibold mb-1">
                    {missingRequirements.needsVerification && "Verification required"}
                    {missingRequirements.needsVerification && missingRequirements.needsSubscription && " & "}
                    {!missingRequirements.needsVerification && missingRequirements.needsSubscription && "Subscription required"}
                  </p>
                  <p className="text-xs">
                    {missingRequirements.needsVerification && "Complete identity verification "}
                    {missingRequirements.needsVerification && missingRequirements.needsSubscription && "and subscribe "}
                    {!missingRequirements.needsVerification && missingRequirements.needsSubscription && "Subscribe "}
                    to respond to requests
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )
        )}
        
        {isProvider && hasUserProposal && (
          <Card className="bg-accent/50">
            <CardContent className="py-4 text-center">
              <p className="text-sm text-muted-foreground">
                You have already submitted a proposal for this request
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
