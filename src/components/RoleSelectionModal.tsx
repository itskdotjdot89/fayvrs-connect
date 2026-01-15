import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserCircle, Briefcase, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RoleSelectionModalProps {
  open: boolean;
  onComplete: (role: 'requester' | 'provider') => void;
  userId: string;
}

export function RoleSelectionModal({ open, onComplete, userId }: RoleSelectionModalProps) {
  const [selectedRole, setSelectedRole] = useState<'requester' | 'provider' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleContinue = async () => {
    if (!selectedRole) return;
    
    setIsSubmitting(true);
    try {
      // Check if role already exists
      const { data: existingRoles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId);
      
      const hasRole = existingRoles?.some(r => r.role === selectedRole);
      
      if (!hasRole) {
        // Insert the selected role
        const { error } = await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: selectedRole });
        
        if (error) throw error;
      }
      
      // Store the selection preference
      localStorage.setItem('activeRole', selectedRole);
      localStorage.setItem('roleSelectionComplete', 'true');
      
      toast({
        title: "Welcome to Fayvrs!",
        description: selectedRole === 'provider' 
          ? "Let's get you set up as a service provider"
          : "Start browsing for services or post a request"
      });
      
      onComplete(selectedRole);
    } catch (error) {
      console.error('Error setting role:', error);
      toast({
        title: "Error",
        description: "Failed to set your role. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-lg" onPointerDownOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle className="text-2xl text-center">How do you want to use Fayvrs?</DialogTitle>
          <DialogDescription className="text-center">
            Choose your primary role. You can switch between roles anytime.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-6">
          <button
            type="button"
            onClick={() => setSelectedRole('requester')}
            className={`p-6 border-2 rounded-xl transition-all text-left ${
              selectedRole === 'requester' 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-accent flex items-center justify-center mb-4">
              <UserCircle className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">I want to hire help</h3>
            <p className="text-sm text-muted-foreground">
              Post requests for services and hire verified local providers
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              ✓ Post requests for free<br />
              ✓ Get proposals from verified providers<br />
              ✓ Message providers directly
            </div>
          </button>
          
          <button
            type="button"
            onClick={() => setSelectedRole('provider')}
            className={`p-6 border-2 rounded-xl transition-all text-left ${
              selectedRole === 'provider' 
                ? 'border-primary bg-primary/5 shadow-md' 
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
          >
            <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <Briefcase className="h-8 w-8 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">I want to earn money</h3>
            <p className="text-sm text-muted-foreground">
              Find local customers and grow your service business
            </p>
            <div className="mt-4 text-xs text-muted-foreground">
              ✓ Get matched with local jobs<br />
              ✓ Build your portfolio<br />
              ✓ Subscription required for proposals
            </div>
          </button>
        </div>
        
        <Button 
          onClick={handleContinue}
          disabled={!selectedRole || isSubmitting}
          className="w-full"
          size="lg"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Setting up...
            </>
          ) : (
            "Continue"
          )}
        </Button>
        
        <p className="text-xs text-center text-muted-foreground">
          You'll have access to both features. This just sets your default view.
        </p>
      </DialogContent>
    </Dialog>
  );
}
