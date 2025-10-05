import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { UserCircle, Briefcase } from "lucide-react";

export const RoleSwitcher = () => {
  const { activeRole, userRoles, switchRole } = useAuth();

  // Only show if user has multiple roles
  if (userRoles.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
      <Button
        variant={activeRole === 'requester' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchRole('requester')}
        disabled={!userRoles.includes('requester')}
        className="gap-2"
      >
        <UserCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Customer</span>
      </Button>
      <Button
        variant={activeRole === 'provider' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => switchRole('provider')}
        disabled={!userRoles.includes('provider')}
        className="gap-2"
      >
        <Briefcase className="h-4 w-4" />
        <span className="hidden sm:inline">Provider</span>
      </Button>
    </div>
  );
};
