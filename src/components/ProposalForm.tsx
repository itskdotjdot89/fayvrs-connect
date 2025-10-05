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
import { Loader2, DollarSign } from "lucide-react";

interface ProposalFormProps {
  requestId: string;
  requestTitle: string;
  onSuccess?: () => void;
}

export function ProposalForm({ requestId, requestTitle, onSuccess }: ProposalFormProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [price, setPrice] = useState("");

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
        </form>
      </CardContent>
    </Card>
  );
}
