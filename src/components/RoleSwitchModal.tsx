import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCircle, Briefcase, ArrowRight } from "lucide-react";

interface RoleSwitchModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  targetRole: 'requester' | 'provider';
  onConfirm: () => void;
  isLoading?: boolean;
}

export function RoleSwitchModal({ 
  open, 
  onOpenChange, 
  targetRole, 
  onConfirm,
  isLoading 
}: RoleSwitchModalProps) {
  const isProvider = targetRole === 'provider';
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isProvider ? (
              <>
                <Briefcase className="h-5 w-5 text-primary" />
                Switch to Provider Mode
              </>
            ) : (
              <>
                <UserCircle className="h-5 w-5 text-primary" />
                Switch to Customer Mode
              </>
            )}
          </DialogTitle>
          <DialogDescription className="space-y-3 pt-2">
            <p>
              {isProvider ? (
                "You're about to switch to Provider Mode. Here's what will change:"
              ) : (
                "You're about to switch to Customer Mode. Here's what will change:"
              )}
            </p>
            
            <div className="bg-muted rounded-lg p-4 space-y-2 text-sm">
              {isProvider ? (
                <>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>You'll see your Provider Dashboard with leads and proposals</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>You can respond to customer requests</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Active subscription required to send proposals</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>You'll see your Customer Dashboard with your requests</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>You can post new requests for services</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <ArrowRight className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <span>Review and select proposals from providers</span>
                  </div>
                </>
              )}
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            Cancel
          </Button>
          <Button 
            onClick={onConfirm}
            disabled={isLoading}
            className="w-full sm:w-auto"
          >
            {isLoading ? "Switching..." : `Switch to ${isProvider ? 'Provider' : 'Customer'}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
