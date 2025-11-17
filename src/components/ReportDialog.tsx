import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Flag } from "lucide-react";
import { toast } from "sonner";

interface ReportDialogProps {
  reportedUserId?: string;
  reportedRequestId?: string;
  reportedMessageId?: string;
  triggerButton?: React.ReactNode;
}

export function ReportDialog({ 
  reportedUserId, 
  reportedRequestId, 
  reportedMessageId,
  triggerButton 
}: ReportDialogProps) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("");

  const reportMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("Must be logged in to report");
      
      const { error } = await supabase
        .from('user_reports' as any)
        .insert({
          reporter_id: user.id,
          reported_user_id: reportedUserId || null,
          reported_request_id: reportedRequestId || null,
          reported_message_id: reportedMessageId || null,
          reason: reason,
        } as any);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Report submitted successfully");
      setOpen(false);
      setReason("");
    },
    onError: () => {
      toast.error("Failed to submit report");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      toast.error("Please provide a reason for reporting");
      return;
    }
    reportMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton || (
          <Button variant="ghost" size="sm">
            <Flag className="w-4 h-4 mr-2" />
            Report
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us keep Fayvrs safe by reporting inappropriate content or behavior.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Textarea
              id="reason"
              placeholder="Please describe why you're reporting this..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={reportMutation.isPending}>
              {reportMutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
