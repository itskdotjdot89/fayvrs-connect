import { Link } from "react-router-dom";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User, Settings, LogOut, Shield, Briefcase, UserCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "./ui/button";
import { RoleSwitcher } from "./RoleSwitcher";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProfileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: { avatar_url: string; full_name: string } | null | undefined;
}

export const ProfileMenu = ({ open, onOpenChange, profile }: ProfileMenuProps) => {
  const { user, signOut, activeRole, userRoles } = useAuth();

  // Fetch pending verification count for admin
  const { data: pendingCount } = useQuery({
    queryKey: ['pending-verifications-count'],
    queryFn: async () => {
      if (!user) return 0;
      
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();
      
      if (!roleData) return 0;
      
      const { count } = await supabase
        .from('identity_verifications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');
      
      return count || 0;
    },
    enabled: !!user,
  });

  const handleLinkClick = () => {
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-left mb-6">
          <SheetTitle className="sr-only">Profile Menu</SheetTitle>
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-white text-xl">
                {profile?.full_name?.[0] || <User className="w-8 h-8" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-bold">{profile?.full_name || "User"}</h2>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge className="mt-1 text-xs" variant="secondary">
                {activeRole === 'provider' ? (
                  <><Briefcase className="w-3 h-3 mr-1" /> Provider</>
                ) : (
                  <><UserCircle className="w-3 h-3 mr-1" /> Customer</>
                )}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <div className="space-y-4">
          {/* Role Switcher */}
          {userRoles.length > 1 && (
            <>
              <div className="flex justify-center">
                <RoleSwitcher />
              </div>
              <Separator />
            </>
          )}

          {/* Menu Items */}
          <div className="space-y-2">
            <Link to="/settings" onClick={handleLinkClick}>
              <Button variant="ghost" className="w-full justify-start text-base h-12">
                <Settings className="w-5 h-5 mr-3" />
                Settings
              </Button>
            </Link>

            {activeRole === 'provider' && (
              <Link to="/portfolio" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start text-base h-12">
                  <Briefcase className="w-5 h-5 mr-3" />
                  Portfolio
                </Button>
              </Link>
            )}

            {userRoles.includes('admin') && (
              <Link to="/admin/kyc-review" onClick={handleLinkClick}>
                <Button variant="ghost" className="w-full justify-start text-base h-12 relative">
                  <Shield className="w-5 h-5 mr-3" />
                  KYC Review
                  {pendingCount && pendingCount > 0 && (
                    <Badge className="ml-auto bg-destructive text-white">
                      {pendingCount}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
          </div>

          <Separator />

          {/* Legal Links */}
          <div className="space-y-2">
            <Link to="/terms-of-service" onClick={handleLinkClick}>
              <Button variant="ghost" className="w-full justify-start text-sm h-10 text-muted-foreground">
                Terms of Service
              </Button>
            </Link>
            <Link to="/privacy-policy" onClick={handleLinkClick}>
              <Button variant="ghost" className="w-full justify-start text-sm h-10 text-muted-foreground">
                Privacy Policy
              </Button>
            </Link>
          </div>

          <Separator />

          {/* Sign Out */}
          <Button 
            onClick={() => {
              signOut();
              onOpenChange(false);
            }} 
            variant="ghost" 
            className="w-full justify-start text-base h-12 text-destructive hover:text-destructive hover:bg-destructive/10"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};
