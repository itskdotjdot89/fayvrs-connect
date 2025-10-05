import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Menu, X, Settings, User } from "lucide-react";
import { useState } from "react";
import fayvrsLogo from "@/assets/fayvrs-logo.png";
import { useAuth } from "@/contexts/AuthContext";
import { RoleSwitcher } from "./RoleSwitcher";
import { NotificationBell } from "./NotificationBell";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
interface LayoutProps {
  children: ReactNode;
}
export const Layout = ({
  children
}: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, activeRole } = useAuth();
  const isActive = (path: string) => location.pathname === path;

  // Fetch user profile for avatar
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('avatar_url, full_name')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });
  return <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <img src={fayvrsLogo} alt="Fayvrs" className="h-8 w-8" />
            <span className="text-secondary">Fayvrs</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/feed" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/feed') ? 'text-primary' : 'text-foreground'}`}>
              Browse Requests
            </Link>
            {user && activeRole === 'provider' && (
              <>
                <Link to="/provider-dashboard" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/provider-dashboard') ? 'text-primary' : 'text-foreground'}`}>
                  Dashboard
                </Link>
                <Link to="/portfolio" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/portfolio') ? 'text-primary' : 'text-foreground'}`}>
                  Portfolio
                </Link>
              </>
            )}
            {user && activeRole === 'requester' && (
              <Link to="/requester-dashboard" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/requester-dashboard') ? 'text-primary' : 'text-foreground'}`}>
                Dashboard
              </Link>
            )}
            {user && <RoleSwitcher />}
            {user ? (
              <>
                <NotificationBell />
                <Link to="/post-request">
                  <Button variant="outline" size="sm">Post Request</Button>
                </Link>
                <Link to="/settings">
                  <Avatar className="w-8 h-8 cursor-pointer hover:ring-2 ring-primary transition-all">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="bg-primary text-white text-sm">
                      {profile?.full_name?.[0] || <User className="w-4 h-4" />}
                    </AvatarFallback>
                  </Avatar>
                </Link>
                <Button onClick={signOut} variant="ghost" size="sm">Sign Out</Button>
              </>
            ) : (
              <Link to="/auth">
                <Button size="sm">Get Started</Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && <div className="md:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link to="/feed" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Browse Requests
              </Link>
              {user && activeRole === 'provider' && (
                <>
                  <Link to="/provider-dashboard" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                  <Link to="/portfolio" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    Portfolio
                  </Link>
                </>
              )}
              {user && activeRole === 'requester' && (
                <Link to="/requester-dashboard" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                  Dashboard
                </Link>
              )}
              {user && (
                <div className="flex justify-center">
                  <RoleSwitcher />
                </div>
              )}
              {user ? (
                <>
                  <Link to="/post-request" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Post Request</Button>
                  </Link>
                  <Link to="/settings" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-white text-sm">
                        {profile?.full_name?.[0] || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    Settings
                  </Link>
                  <Button onClick={signOut} variant="ghost" size="sm" className="w-full">Sign Out</Button>
                </>
              ) : (
                <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                  <Button size="sm" className="w-full">Get Started</Button>
                </Link>
              )}
            </div>
          </div>}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      
    </div>;
};