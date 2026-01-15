import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { UserCircle, Briefcase, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { RoleSwitchModal } from "./RoleSwitchModal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const RoleSwitcher = () => {
  const { activeRole, userRoles, switchRole } = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [pendingRole, setPendingRole] = useState<'requester' | 'provider' | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSwitch = (role: 'requester' | 'provider') => {
    if (role === activeRole) return;
    setPendingRole(role);
    setShowModal(true);
  };

  const confirmSwitch = async () => {
    if (!pendingRole) return;
    
    setIsLoading(true);
    try {
      await switchRole(pendingRole);
      
      // Navigate to appropriate dashboard after switching
      if (pendingRole === 'provider') {
        navigate('/provider-dashboard');
      } else if (pendingRole === 'requester') {
        navigate('/requester-dashboard');
      }
    } finally {
      setIsLoading(false);
      setShowModal(false);
      setPendingRole(null);
    }
  };

  // Only show if user has multiple roles
  if (userRoles.length <= 1) return null;

  const isProvider = activeRole === 'provider';

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2 rounded-xl"
          >
            {isProvider ? (
              <>
                <Briefcase className="h-4 w-4" />
                <span className="hidden sm:inline">Provider</span>
              </>
            ) : (
              <>
                <UserCircle className="h-4 w-4" />
                <span className="hidden sm:inline">Customer</span>
              </>
            )}
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={() => handleRoleSwitch('requester')}
            disabled={!userRoles.includes('requester')}
            className={activeRole === 'requester' ? 'bg-accent' : ''}
          >
            <UserCircle className="h-4 w-4 mr-2" />
            Customer Mode
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleRoleSwitch('provider')}
            disabled={!userRoles.includes('provider')}
            className={activeRole === 'provider' ? 'bg-accent' : ''}
          >
            <Briefcase className="h-4 w-4 mr-2" />
            Provider Mode
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoleSwitchModal
        open={showModal}
        onOpenChange={setShowModal}
        targetRole={pendingRole || 'requester'}
        onConfirm={confirmSwitch}
        isLoading={isLoading}
      />
    </>
  );
};
