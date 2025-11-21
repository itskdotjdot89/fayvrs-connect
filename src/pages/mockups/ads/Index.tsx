import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Camera, Download, Film } from "lucide-react";

export default function AdMockupsIndex() {
  const mockups = [
    { path: "/mockups/ads/hero-splash", title: "1. Hero Splash", description: "Opening shot - Brand introduction" },
    { path: "/mockups/ads/problem-screen", title: "2. Problem Statement", description: "Pain points - Before Fayvrs" },
    { path: "/mockups/ads/request-creation-showcase", title: "3. Request Creation", description: "Easy posting flow" },
    { path: "/mockups/ads/live-matching-screen", title: "4. Live Matching", description: "AI magic in action" },
    { path: "/mockups/ads/provider-notification", title: "5. Provider Alert", description: "Instant notifications" },
    { path: "/mockups/ads/proposals-comparison", title: "6. Compare Proposals", description: "Choose the best provider" },
    { path: "/mockups/ads/video-call-showcase", title: "7. Video Consultation", description: "Face-to-face before arrival" },
    { path: "/mockups/ads/real-time-tracking", title: "8. Live Tracking", description: "Know when they arrive" },
    { path: "/mockups/ads/success-screen", title: "9. Success Story", description: "Job completed - Happy ending" },
    { path: "/mockups/ads/earnings-showcase", title: "10. Provider Earnings", description: "Turn skills into income" },
    { path: "/mockups/ads/referral-earnings", title: "11. Referral Income", description: "Passive earnings" },
    { path: "/mockups/ads/trust-safety", title: "12. Trust & Safety", description: "Verification badges" },
    { path: "/mockups/ads/social-proof", title: "13. Social Proof", description: "Testimonials & stats" },
    { path: "/mockups/ads/download-cta", title: "14. Download CTA", description: "Closing shot - Call to action" },
  ];

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl font-bold mb-4">Fayvrs Ad Mockups</h1>
          <p className="text-xl text-muted-foreground mb-6">
            Screenshot these screens for video ad production (optimized for 9:16 mobile format)
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card className="p-4 bg-primary/5 border-primary">
              <div className="flex items-center gap-3 mb-2">
                <Camera className="w-6 h-6 text-primary" />
                <h3 className="font-bold">Screenshot Ready</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Each screen is optimized for 1080x1920 format
              </p>
            </Card>
            <Card className="p-4 bg-success/5 border-success">
              <div className="flex items-center gap-3 mb-2">
                <Film className="w-6 h-6 text-success" />
                <h3 className="font-bold">Story Arc</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Organized in narrative sequence for video ads
              </p>
            </Card>
            <Card className="p-4 bg-warning/5 border-warning">
              <div className="flex items-center gap-3 mb-2">
                <Download className="w-6 h-6 text-warning" />
                <h3 className="font-bold">Export Guide</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                See MOCKUP_EXPORT_GUIDE.md for instructions
              </p>
            </Card>
          </div>
        </div>

        {/* Mockups grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mockups.map((mockup) => (
            <Link key={mockup.path} to={mockup.path}>
              <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer h-full">
                <h3 className="text-xl font-bold mb-2">{mockup.title}</h3>
                <p className="text-muted-foreground mb-4">{mockup.description}</p>
                <div className="text-primary font-semibold">
                  View Screen →
                </div>
              </Card>
            </Link>
          ))}
        </div>

        {/* Documentation */}
        <div className="mt-12 space-y-6">
          <Card className="p-8 bg-muted">
            <h2 className="text-3xl font-bold mb-4">📖 Documentation</h2>
            <div className="space-y-2 text-lg">
              <p>• <strong>AD_STORYBOARD.md</strong> - Shot sequences for 15s, 30s, 60s ads</p>
              <p>• <strong>AD_VARIANTS.md</strong> - Requester, Provider, and Referral ad versions</p>
              <p>• <strong>MOCKUP_EXPORT_GUIDE.md</strong> - Screen recording & export instructions</p>
            </div>
          </Card>

          <Card className="p-8 bg-primary/5 border-2 border-primary">
            <h2 className="text-3xl font-bold mb-4">💡 Usage Tips</h2>
            <ul className="space-y-3 text-lg">
              <li>✓ Open each screen in fullscreen mode</li>
              <li>✓ Use browser dev tools to simulate mobile dimensions (375x812 or 390x844)</li>
              <li>✓ Take high-res screenshots or record screen video</li>
              <li>✓ Follow the narrative order for coherent storytelling</li>
              <li>✓ Add voiceover scripts from AD_STORYBOARD.md</li>
              <li>✓ Edit transitions and add music in your video editor</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  );
}
