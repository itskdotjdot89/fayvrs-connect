import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, DollarSign, Sparkles, RefreshCw } from "lucide-react";
import { Switch } from "@/components/ui/switch";

interface ProposalFormProps {
  requestId: string;
  requestTitle: string;
  requestDescription?: string;
  requestBudget?: { min?: number; max?: number };
  onSuccess?: () => void;
}

export function ProposalForm({ requestId, requestTitle, requestDescription = "", requestBudget, onSuccess }: ProposalFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");
  const [useAI, setUseAI] = useState(false);
  const [providerNotes, setProviderNotes] = useState("");
  const [generatedProposal, setGeneratedProposal] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const submitProposalMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Not authenticated");
      
      // Check if user already has a proposal for this request
      const { data: existingProposal } = await supabase
        .from('proposals')
        .select('id')
        .eq('request_id', requestId)
        .eq('provider_id', user.id)
        .single();

      if (existingProposal) {
        throw new Error("You have already submitted a proposal for this request");
      }

      const { error } = await supabase
        .from('proposals')
        .insert({
          request_id: requestId,
          provider_id: user.id,
          message: message.trim(),
          price: parseFloat(price),
          status: 'pending',
        });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Proposal submitted successfully!");
      setMessage("");
      setPrice("");
      queryClient.invalidateQueries({ queryKey: ['proposals', requestId] });
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to submit proposal");
    },
  });

  const generateProposalMutation = useMutation({
    mutationFn: async () => {
      if (!providerNotes.trim()) {
        throw new Error("Please provide some notes about your offer");
      }
      if (!price || parseFloat(price) <= 0) {
        throw new Error("Please provide a valid price");
      }

      const { data, error } = await supabase.functions.invoke('generate-proposal', {
        body: {
          providerInput: providerNotes.trim(),
          requestTitle,
          requestDescription,
          requestBudget,
          providerPrice: parseFloat(price),
        }
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setGeneratedProposal(data.proposal);
      setMessage(data.proposal);
      toast.success(`Proposal generated with ${data.model}!`);
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : "Failed to generate proposal");
    },
  });

  const handleGenerate = () => {
    setIsGenerating(true);
    generateProposalMutation.mutate();
    setTimeout(() => setIsGenerating(false), 500);
  };

  const handleRegenerate = () => {
    setGeneratedProposal("");
    setMessage("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim()) {
      toast.error("Please provide a message");
      return;
    }
    
    if (!price || parseFloat(price) <= 0) {
      toast.error("Please provide a valid price");
      return;
    }

    submitProposalMutation.mutate();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Proposal</CardTitle>
        <CardDescription>
          Make an offer for: {requestTitle}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* AI Assistant Toggle */}
          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <div>
                <Label htmlFor="ai-toggle" className="text-sm font-medium cursor-pointer">
                  AI Assistant
                </Label>
                <p className="text-xs text-muted-foreground">
                  Let AI help you write a professional proposal
                </p>
              </div>
            </div>
            <Switch
              id="ai-toggle"
              checked={useAI}
              onCheckedChange={(checked) => {
                setUseAI(checked);
                if (!checked) {
                  setGeneratedProposal("");
                  setProviderNotes("");
                }
              }}
            />
          </div>

          {/* Price Input - Always visible */}
          <div className="space-y-2">
            <Label htmlFor="price" className="flex items-center gap-1">
              <DollarSign className="w-4 h-4" />
              Your Price Quote
            </Label>
            <Input
              id="price"
              type="number"
              step="0.01"
              placeholder="Enter your price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              disabled={submitProposalMutation.isPending}
            />
          </div>

          {useAI ? (
            // AI-Assisted Mode
            <>
              {!generatedProposal ? (
                // Step 1: Enter notes
                <>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Brief Notes About Your Offer</Label>
                    <Textarea
                      id="notes"
                      placeholder="Example: 'Experienced plumber, 12 years. Can fix your sink tomorrow. Have all tools. Issue sounds like clog or loose pipe.'"
                      value={providerNotes}
                      onChange={(e) => setProviderNotes(e.target.value)}
                      className="min-h-[100px]"
                      disabled={isGenerating}
                    />
                    <p className="text-xs text-muted-foreground">
                      Just write a few quick notes. AI will expand this into a detailed proposal.
                    </p>
                  </div>

                  <Button
                    type="button"
                    onClick={handleGenerate}
                    disabled={!providerNotes.trim() || !price || isGenerating || generateProposalMutation.isPending}
                    className="w-full"
                  >
                    {generateProposalMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating Proposal...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Proposal with AI
                      </>
                    )}
                  </Button>
                </>
              ) : (
                // Step 2: Review & Submit
                <>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="generated">Generated Proposal</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRegenerate}
                      >
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Regenerate
                      </Button>
                    </div>
                    <Textarea
                      id="generated"
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[200px]"
                      disabled={submitProposalMutation.isPending}
                    />
                    <p className="text-xs text-muted-foreground">
                      Review and edit the proposal above before submitting.
                    </p>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full"
                    disabled={submitProposalMutation.isPending || !message.trim() || !price}
                  >
                    {submitProposalMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      'Submit Proposal'
                    )}
                  </Button>
                </>
              )}
            </>
          ) : (
            // Manual Mode
            <>
              <div className="space-y-2">
                <Label htmlFor="message">Your Proposal Message</Label>
                <Textarea
                  id="message"
                  placeholder="Explain your approach, experience, and why you're the right fit..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[120px]"
                  disabled={submitProposalMutation.isPending}
                />
              </div>

              <Button 
                type="submit" 
                className="w-full"
                disabled={submitProposalMutation.isPending || !message.trim() || !price}
              >
                {submitProposalMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  'Submit Proposal'
                )}
              </Button>
            </>
          )}
        </form>
      </CardContent>
    </Card>
  );
}
