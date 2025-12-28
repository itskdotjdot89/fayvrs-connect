import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MessageSquare } from "lucide-react";

interface SMSOptInDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (phone: string) => Promise<void>;
  isLoading?: boolean;
}

export function SMSOptInDialog({ open, onOpenChange, onSubmit, isLoading }: SMSOptInDialogProps) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    // Basic phone validation
    const phoneRegex = /^\+?[1-9]\d{9,14}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, "");
    
    if (!phoneRegex.test(cleanPhone)) {
      setError("Please enter a valid phone number (e.g., +1234567890)");
      return;
    }

    setError("");
    await onSubmit(cleanPhone);
  };

  const handleCancel = () => {
    setPhone("");
    setError("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            Enable SMS Notifications
          </DialogTitle>
          <DialogDescription>
            Enter your phone number to receive important updates via SMS. 
            Standard messaging rates may apply.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 123-4567"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError("");
              }}
              className={error ? "border-destructive" : ""}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <p className="text-xs text-muted-foreground">
              Include country code (e.g., +1 for US). Your phone number is only used for SMS notifications.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading || !phone.trim()}>
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              "Enable SMS"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
