import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, UserCircle } from "lucide-react";

export function RoleBanner() {
  const { activeRole, user } = useAuth();
  
  if (!user || !activeRole) return null;
  
  const isProvider = activeRole === 'provider';
  
  return (
    <div className={`w-full py-2 px-4 text-center text-sm font-medium ${
      isProvider 
        ? 'bg-primary/10 text-primary border-b border-primary/20' 
        : 'bg-accent text-accent-foreground border-b border-accent'
    }`}>
      <div className="flex items-center justify-center gap-2">
        {isProvider ? (
          <>
            <Briefcase className="h-4 w-4" />
            <span>You are in Provider Mode</span>
          </>
        ) : (
          <>
            <UserCircle className="h-4 w-4" />
            <span>You are in Customer Mode</span>
          </>
        )}
      </div>
    </div>
  );
}
