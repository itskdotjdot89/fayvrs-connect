import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { Layout } from "./components/Layout";
import { MobileLayout } from "./components/MobileLayout";
import { useIsMobile } from "./hooks/use-mobile";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { OnboardingWrapper } from "./components/OnboardingWrapper";
import { Loader2 } from "lucide-react";

// Critical pages - loaded immediately
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import Feed from "./pages/Feed";
import NotFound from "./pages/NotFound";

// Lazy load non-critical pages
const PostRequest = lazy(() => import("./pages/PostRequest"));
const ProviderCheckout = lazy(() => import("./pages/ProviderCheckout"));
const IdentityVerification = lazy(() => import("./pages/IdentityVerification"));
const RequestDetails = lazy(() => import("./pages/RequestDetails"));
const Messages = lazy(() => import("./pages/Messages"));
const Conversations = lazy(() => import("./pages/Conversations"));
const ProviderDashboard = lazy(() => import("./pages/ProviderDashboard"));
const RequesterDashboard = lazy(() => import("./pages/RequesterDashboard"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Settings = lazy(() => import("./pages/Settings"));
const ProviderSettings = lazy(() => import("./pages/ProviderSettings"));
const TermsOfService = lazy(() => import("./pages/TermsOfService"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const CommunityGuidelines = lazy(() => import("./pages/CommunityGuidelines"));
const RefundPolicy = lazy(() => import("./pages/RefundPolicy"));
const SafetyCenter = lazy(() => import("./pages/SafetyCenter"));
const Support = lazy(() => import("./pages/Support"));
const SubscriptionDetails = lazy(() => import("./pages/SubscriptionDetails"));
const AppStoreReadiness = lazy(() => import("./pages/AppStoreReadiness"));
const DataDeletion = lazy(() => import("./pages/DataDeletion"));
const ReferralLanding = lazy(() => import("./pages/ReferralLanding"));
const ReferralDashboard = lazy(() => import("./pages/ReferralDashboard"));
const PublicProfile = lazy(() => import("./pages/PublicProfile"));
const Onboarding = lazy(() => import("./pages/Onboarding"));

// Admin pages - lazy loaded
const KYCReview = lazy(() => import("./pages/admin/KYCReview"));
const ModerationQueue = lazy(() => import("./pages/admin/ModerationQueue"));

// Mockup pages - lazy loaded
const OnboardingMockup = lazy(() => import("./pages/mockups/Onboarding"));
const DemoFeed = lazy(() => import("./pages/mockups/DemoFeed"));
const SignUpLogin = lazy(() => import("./pages/mockups/SignUpLogin"));
const IdentityVerificationMockup = lazy(() => import("./pages/mockups/IdentityVerification"));
const AIRequestChat = lazy(() => import("./pages/mockups/AIRequestChat"));
const RequestFeed = lazy(() => import("./pages/mockups/RequestFeed"));
const RequestDetailsMockup = lazy(() => import("./pages/mockups/RequestDetails"));
const MessagingMockup = lazy(() => import("./pages/mockups/Messaging"));
const ProviderDashboardMockup = lazy(() => import("./pages/mockups/ProviderDashboard"));
const PortfolioMockup = lazy(() => import("./pages/mockups/Portfolio"));
const Billing = lazy(() => import("./pages/mockups/Billing"));
const SettingsMockup = lazy(() => import("./pages/mockups/Settings"));
const MockupIndex = lazy(() => import("./pages/mockups/Index"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    },
  },
});

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
  </div>
);

const AppContent = () => {
  const isMobile = useIsMobile();
  const LayoutComponent = isMobile ? MobileLayout : Layout;

  return (
    <OnboardingWrapper>
      <LayoutComponent>
        <Suspense fallback={<LoadingFallback />}>
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
            <Route path="/community-guidelines" element={<CommunityGuidelines />} />
            <Route path="/refund-policy" element={<RefundPolicy />} />
            <Route path="/safety-center" element={<SafetyCenter />} />
            <Route path="/support" element={<Support />} />
            <Route path="/subscription-details" element={<SubscriptionDetails />} />
            <Route path="/app-store-readiness" element={<AppStoreReadiness />} />
            <Route path="/data-deletion" element={<DataDeletion />} />
            <Route path="/r/:code" element={<ReferralLanding />} />
            <Route path="/referrals" element={<ProtectedRoute><ReferralDashboard /></ProtectedRoute>} />
            <Route path="/profile/:username" element={<PublicProfile />} />
            <Route path="/admin/kyc-review" element={
              <ProtectedRoute requiredRole="admin">
                <KYCReview />
              </ProtectedRoute>
            } />
            <Route path="/admin/moderation-queue" element={
              <ProtectedRoute requiredRole="admin">
                <ModerationQueue />
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
        </Suspense>
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
