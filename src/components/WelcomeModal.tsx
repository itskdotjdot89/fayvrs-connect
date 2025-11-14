import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Sparkles, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface WelcomeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: 'requester' | 'provider';
  isSkipped: boolean;
}

export function WelcomeModal({ open, onOpenChange, role, isSkipped }: WelcomeModalProps) {
  const navigate = useNavigate();

  const handleBrowseRequests = () => {
    onOpenChange(false);
    navigate('/feed');
  };

  const handleCompleteProfile = () => {
    onOpenChange(false);
    navigate('/settings');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            {isSkipped ? <User className="h-6 w-6 text-primary" /> : <CheckCircle className="h-6 w-6 text-primary" />}
          </div>
          <DialogTitle className="text-center">
            {isSkipped ? "Welcome to Fayvrs!" : "Verification Submitted!"}
          </DialogTitle>
          <DialogDescription className="text-center">
            {role === 'provider' ? (
              isSkipped ? (
                "You can explore requests now, but you'll need to complete verification to respond."
              ) : (
                "Your verification is being reviewed (24-48 hours). Meanwhile, explore requests and set up your profile!"
              )
            ) : (
              "You're all set! Start browsing service requests or post your own."
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2 mt-4">
          <Button onClick={handleBrowseRequests} className="w-full">
            <Sparkles className="h-4 w-4 mr-2" />
            Browse Requests
          </Button>
          <Button onClick={handleCompleteProfile} variant="outline" className="w-full">
            <User className="h-4 w-4 mr-2" />
            Complete Profile
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
