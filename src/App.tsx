import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import PostRequest from "./pages/PostRequest";
import Feed from "./pages/Feed";
import ProviderCheckout from "./pages/ProviderCheckout";
import IdentityVerification from "./pages/IdentityVerification";
import NotFound from "./pages/NotFound";

// Fayvrs Mockup Screens
import Onboarding from "./pages/mockups/Onboarding";
import DemoFeed from "./pages/mockups/DemoFeed";
import SignUpLogin from "./pages/mockups/SignUpLogin";
import IdentityVerificationMockup from "./pages/mockups/IdentityVerification";
import AIRequestChat from "./pages/mockups/AIRequestChat";
import RequestFeed from "./pages/mockups/RequestFeed";
import RequestDetails from "./pages/mockups/RequestDetails";
import Messaging from "./pages/mockups/Messaging";
import ProviderDashboard from "./pages/mockups/ProviderDashboard";
import Portfolio from "./pages/mockups/Portfolio";
import Billing from "./pages/mockups/Billing";
import Settings from "./pages/mockups/Settings";
import MockupIndex from "./pages/mockups/Index";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthProvider>
        <BrowserRouter>
          <Layout>
            <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/post-request" element={<PostRequest />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/provider-checkout" element={<ProviderCheckout />} />
            <Route path="/identity-verification" element={<IdentityVerification />} />
              
              {/* Fayvrs Mockups */}
              <Route path="/mockups" element={<MockupIndex />} />
              <Route path="/mockup/onboarding" element={<Onboarding />} />
              <Route path="/mockup/demo-feed" element={<DemoFeed />} />
              <Route path="/mockup/signup" element={<SignUpLogin />} />
              <Route path="/mockup/verification" element={<IdentityVerificationMockup />} />
              <Route path="/mockup/ai-chat" element={<AIRequestChat />} />
              <Route path="/mockup/request-feed" element={<RequestFeed />} />
              <Route path="/mockup/request-details" element={<RequestDetails />} />
              <Route path="/mockup/messaging" element={<Messaging />} />
              <Route path="/mockup/dashboard" element={<ProviderDashboard />} />
              <Route path="/mockup/portfolio" element={<Portfolio />} />
              <Route path="/mockup/billing" element={<Billing />} />
              <Route path="/mockup/settings" element={<Settings />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
