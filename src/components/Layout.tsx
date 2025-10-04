import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { HandshakeIcon, Menu, X } from "lucide-react";
import { useState } from "react";
interface LayoutProps {
  children: ReactNode;
}
export const Layout = ({
  children
}: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  return <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <HandshakeIcon className="h-6 w-6 text-primary" />
            <span className="text-secondary">Fayvrs</span>
            <span className="text-primary text-sm font-normal">Lite</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/feed" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/feed') ? 'text-primary' : 'text-foreground'}`}>
              Browse Requests
            </Link>
            <Link to="/providers" className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/providers') ? 'text-primary' : 'text-foreground'}`}>
              Find Providers
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="sm">Sign In</Button>
            </Link>
            <Link to="/post-request">
              <Button size="sm">Post a Request</Button>
            </Link>
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
              <Link to="/providers" className="text-sm font-medium hover:text-primary transition-colors" onClick={() => setMobileMenuOpen(false)}>
                Find Providers
              </Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link to="/post-request" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">Post a Request</Button>
              </Link>
            </div>
          </div>}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      
    </div>;
};