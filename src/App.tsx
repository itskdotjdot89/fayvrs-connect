import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { MobileLayout } from "./components/MobileLayout";
import { useIsMobile } from "./hooks/use-mobile";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import PostRequest from "./pages/PostRequest";
import Feed from "./pages/Feed";
import ProviderCheckout from "./pages/ProviderCheckout";
import IdentityVerification from "./pages/IdentityVerification";
import RequestDetails from "./pages/RequestDetails";
import Messages from "./pages/Messages";
import Conversations from "./pages/Conversations";
import ProviderDashboard from "./pages/ProviderDashboard";
import RequesterDashboard from "./pages/RequesterDashboard";
import Portfolio from "./pages/Portfolio";
import Settings from "./pages/Settings";
import ProviderSettings from "./pages/ProviderSettings";
import NotFound from "./pages/NotFound";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OnboardingWrapper } from "./components/OnboardingWrapper";
import KYCReview from "./pages/admin/KYCReview";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import ReferralLanding from "./pages/ReferralLanding";
import ReferralDashboard from "./pages/ReferralDashboard";

// Production Onboarding
import Onboarding from "./pages/Onboarding";

// Fayvrs Mockup Screens
import OnboardingMockup from "./pages/mockups/Onboarding";
import DemoFeed from "./pages/mockups/DemoFeed";
import SignUpLogin from "./pages/mockups/SignUpLogin";
import IdentityVerificationMockup from "./pages/mockups/IdentityVerification";
import AIRequestChat from "./pages/mockups/AIRequestChat";
import RequestFeed from "./pages/mockups/RequestFeed";
import RequestDetailsMockup from "./pages/mockups/RequestDetails";
import MessagingMockup from "./pages/mockups/Messaging";
import ProviderDashboardMockup from "./pages/mockups/ProviderDashboard";
import PortfolioMockup from "./pages/mockups/Portfolio";
import Billing from "./pages/mockups/Billing";
import SettingsMockup from "./pages/mockups/Settings";
import MockupIndex from "./pages/mockups/Index";

const queryClient = new QueryClient();

const AppContent = () => {
  const isMobile = useIsMobile();
  const LayoutComponent = isMobile ? MobileLayout : Layout;

  return (
    <OnboardingWrapper>
      <LayoutComponent>
        <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/post-request" element={<PostRequest />} />
            <Route path="/feed" element={<Feed />} />
            <Route path="/provider-checkout" element={<ProviderCheckout />} />
            <Route path="/identity-verification" element={<IdentityVerification />} />
            <Route path="/request/:id" element={<RequestDetails />} />
            <Route path="/conversations" element={<ProtectedRoute><Conversations /></ProtectedRoute>} />
            <Route path="/messages/:userId" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/provider-dashboard" element={<ProviderDashboard />} />
            <Route path="/requester-dashboard" element={<RequesterDashboard />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/provider-settings" element={<ProviderSettings />} />
            <Route path="/terms-of-service" element={<TermsOfService />} />
            <Route path="/privacy-policy" element={<PrivacyPolicy />} />
            <Route path="/r/:code" element={<ReferralLanding />} />
            <Route path="/referrals" element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />
            <Route path="/admin/kyc-review" element={
              <ProtectedRoute requiredRole="admin">
                <KYCReview />
              </ProtectedRoute>
            } />
              
              {/* Fayvrs Mockups */}
              <Route path="/mockups" element={<MockupIndex />} />
              <Route path="/mockup/onboarding" element={<OnboardingMockup />} />
              <Route path="/mockup/demo-feed" element={<DemoFeed />} />
              <Route path="/mockup/signup" element={<SignUpLogin />} />
              <Route path="/mockup/verification" element={<IdentityVerificationMockup />} />
              <Route path="/mockup/ai-chat" element={<AIRequestChat />} />
              <Route path="/mockup/request-feed" element={<RequestFeed />} />
              <Route path="/mockup/request-details" element={<RequestDetailsMockup />} />
              <Route path="/mockup/messaging" element={<MessagingMockup />} />
              <Route path="/mockup/dashboard" element={<ProviderDashboardMockup />} />
              <Route path="/mockup/portfolio" element={<PortfolioMockup />} />
              <Route path="/mockup/billing" element={<Billing />} />
              <Route path="/mockup/settings" element={<SettingsMockup />} />
              
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
      </LayoutComponent>
    </OnboardingWrapper>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
