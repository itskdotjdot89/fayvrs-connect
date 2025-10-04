import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { HandshakeIcon, Menu, X } from "lucide-react";
import { useState } from "react";

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col">
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
            <Link 
              to="/feed" 
              className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/feed') ? 'text-primary' : 'text-foreground'}`}
            >
              Browse Requests
            </Link>
            <Link 
              to="/providers" 
              className={`text-sm font-medium hover:text-primary transition-colors ${isActive('/providers') ? 'text-primary' : 'text-foreground'}`}
            >
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
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container mx-auto px-4 py-4 flex flex-col gap-4">
              <Link 
                to="/feed" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Browse Requests
              </Link>
              <Link 
                to="/providers" 
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Find Providers
              </Link>
              <Link to="/auth" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" size="sm" className="w-full">Sign In</Button>
              </Link>
              <Link to="/post-request" onClick={() => setMobileMenuOpen(false)}>
                <Button size="sm" className="w-full">Post a Request</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-secondary text-secondary-foreground py-12 mt-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <HandshakeIcon className="h-5 w-5 text-primary" />
                <span className="font-bold">Fayvrs Lite</span>
              </div>
              <p className="text-sm text-secondary-foreground/80">
                Direct connections for freelance and local services. No customer fees.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-3">For Customers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/feed" className="hover:text-primary transition-colors">Browse Requests</Link></li>
                <li><Link to="/post-request" className="hover:text-primary transition-colors">Post a Request</Link></li>
                <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">For Providers</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/providers" className="hover:text-primary transition-colors">Find Providers</Link></li>
                <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link to="/auth" className="hover:text-primary transition-colors">Sign Up</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
                <li><Link to="/support" className="hover:text-primary transition-colors">Support</Link></li>
                <li><Link to="/terms" className="hover:text-primary transition-colors">Terms</Link></li>
                <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-secondary-foreground/20 text-sm text-center text-secondary-foreground/60">
            © 2025 Fayvrs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
