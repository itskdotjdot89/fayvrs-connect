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
import { Badge } from "./ui/badge";
interface LayoutProps {
  children: ReactNode;
}
export const Layout = ({
  children
}: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const { user, signOut, activeRole, userRoles } = useAuth();
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

  // Fetch pending verification count for admin
  const { data: pendingCount } = useQuery({
    queryKey: ['pending-verifications-count'],
    queryFn: async () => {
      if (!user) return 0;
      
      // Check if user is admin
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
    refetchInterval: 30000, // Refresh every 30 seconds
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
            {user && userRoles.includes('admin') && (
              <Link to="/admin/kyc-review" className={`text-sm font-medium hover:text-primary transition-colors relative ${isActive('/admin/kyc-review') ? 'text-primary' : 'text-foreground'}`}>
                KYC Review
                {pendingCount && pendingCount > 0 && (
                  <Badge className="ml-2 bg-red-500 text-white" variant="destructive">
                    {pendingCount}
                  </Badge>
                )}
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
              <>
                <Link to="/auth">
                  <Button size="sm">Get Started</Button>
                </Link>
              </>
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
              {user && userRoles.includes('admin') && (
                <Link to="/admin/kyc-review" className="text-sm font-medium hover:text-primary transition-colors relative" onClick={() => setMobileMenuOpen(false)}>
                  KYC Review
                  {pendingCount && pendingCount > 0 && (
                    <Badge className="ml-2 bg-red-500 text-white" variant="destructive">
                      {pendingCount}
                    </Badge>
                  )}
                </Link>
              )}
              {user && (
                <div className="flex justify-center">
                  <RoleSwitcher />
                </div>
              )}
              {user ? (
                <>
                  <Link to="/settings" className="flex items-center gap-2 text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                    <Avatar className="w-8 h-8">
                      <AvatarImage src={profile?.avatar_url} />
                      <AvatarFallback className="bg-primary text-white text-sm">
                        {profile?.full_name?.[0] || <User className="w-4 h-4" />}
                      </AvatarFallback>
                    </Avatar>
                    Settings
                  </Link>
                  <Link to="/post-request" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" size="sm" className="w-full">Post Request</Button>
                  </Link>
                  <Button onClick={signOut} variant="ghost" size="sm" className="w-full">Sign Out</Button>
                </>
              ) : (
                <>
                  <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                    <Button size="sm" className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </div>}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <img src={fayvrsLogo} alt="Fayvrs" className="h-6 w-6" />
                <span className="font-bold text-lg text-secondary">Fayvrs</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Connect with local service providers for all your needs.
              </p>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/terms-of-service" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/community-guidelines" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Community Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Refund Policy
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Safety & Help</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/safety-center" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Safety Center
                  </Link>
                </li>
                <li>
                  <Link to="/subscription-details" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Subscription Details
                  </Link>
                </li>
                <li>
                  <Link to="/support" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li>
                  <a href="mailto:contact@fayvrs.com" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    contact@fayvrs.com
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Fayvrs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>;
};