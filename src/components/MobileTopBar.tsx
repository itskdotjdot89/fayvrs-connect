import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";
import { ProfileMenu } from "./ProfileMenu";
import fayvrsLogo from "@/assets/fayvrs-logo.png";
import { NotificationBell } from "./NotificationBell";
import { ThemeToggle } from "./ThemeToggle";

export const MobileTopBar = () => {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  // Fetch user profile for avatar
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name, username')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b pt-safe">
        <div className="flex items-center justify-between h-14 px-4">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src={fayvrsLogo} alt="Fayvrs" className="h-8 w-8" />
            <span className="font-bold text-lg text-secondary">Fayvrs</span>
          </Link>

          {/* Right Side */}
          <div className="flex items-center gap-3">
            {user && <NotificationBell />}
            <ThemeToggle />
            {user && (
              <button onClick={() => setMenuOpen(true)}>
                <Avatar className="w-9 h-9 ring-2 ring-primary/20 hover:ring-primary/40 transition-all">
                  <AvatarImage src={profile?.avatar_url} />
                  <AvatarFallback className="bg-primary text-white text-sm">
                    {profile?.full_name?.[0] || <User className="w-4 h-4" />}
                  </AvatarFallback>
                </Avatar>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Profile Menu Sheet */}
      <ProfileMenu open={menuOpen} onOpenChange={setMenuOpen} profile={profile} />
    </>
  );
};
