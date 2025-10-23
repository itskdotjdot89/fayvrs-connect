import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { UserCircle, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const RoleSwitcher = () => {
  const { activeRole, userRoles, switchRole } = useAuth();
  const navigate = useNavigate();

  const handleRoleSwitch = async (role: 'requester' | 'provider') => {
    await switchRole(role);
    
    // Navigate to appropriate dashboard after switching
    if (role === 'provider') {
      navigate('/provider-dashboard');
    } else if (role === 'requester') {
      navigate('/requester-dashboard');
    }
  };

  // Only show if user has multiple roles
  if (userRoles.length <= 1) return null;

  return (
    <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-1">
      <Button
        variant={activeRole === 'requester' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleRoleSwitch('requester')}
        disabled={!userRoles.includes('requester')}
        className="gap-2"
      >
        <UserCircle className="h-4 w-4" />
        <span className="hidden sm:inline">Customer</span>
      </Button>
      <Button
        variant={activeRole === 'provider' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => handleRoleSwitch('provider')}
        disabled={!userRoles.includes('provider')}
        className="gap-2"
      >
        <Briefcase className="h-4 w-4" />
        <span className="hidden sm:inline">Provider</span>
      </Button>
    </div>
  );
};
