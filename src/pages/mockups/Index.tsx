import { Link } from "react-router-dom";
import { Handshake } from "lucide-react";

const mockups = [
  { name: "1. Onboarding / Welcome", path: "/mockup/onboarding" },
  { name: "2. Demo Feed (Guest)", path: "/mockup/demo-feed" },
  { name: "3. Sign Up / Log In", path: "/mockup/signup" },
  { name: "4. Identity Verification", path: "/mockup/verification" },
  { name: "5. AI Request Chat", path: "/mockup/ai-chat" },
  { name: "6. Request Feed", path: "/mockup/request-feed" },
  { name: "7. Request Details", path: "/mockup/request-details" },
  { name: "8. In-App Messaging", path: "/mockup/messaging" },
  { name: "9. Provider Dashboard", path: "/mockup/dashboard" },
  { name: "10. Portfolio Page", path: "/mockup/portfolio" },
  { name: "11. Billing / Subscription", path: "/mockup/billing" },
  { name: "12. Settings", path: "/mockup/settings" },
];

export default function MockupIndex() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center shadow-soft">
              <Handshake className="w-8 h-8 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-3xl font-bold font-poppins text-foreground">Fayvrs Lite</h1>
              <p className="text-muted-foreground">Mobile App Design Mockups</p>
            </div>
          </div>
          
          {/* Design System Info */}
          <div className="mt-6 p-4 bg-surface rounded-xl space-y-2 text-sm">
            <div className="flex gap-6 flex-wrap">
              <div>
                <span className="text-muted-foreground">Primary: </span>
                <span className="font-semibold text-primary">#17BFA9</span>
              </div>
              <div>
                <span className="text-muted-foreground">Secondary: </span>
                <span className="font-semibold text-secondary">#1B2B39</span>
              </div>
              <div>
                <span className="text-muted-foreground">Font: </span>
                <span className="font-semibold">Inter / Poppins</span>
              </div>
              <div>
                <span className="text-muted-foreground">Radius: </span>
                <span className="font-semibold">16px / 24px</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mockup Grid */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockups.map((mockup, index) => (
            <Link
              key={mockup.path}
              to={mockup.path}
              className="bg-white rounded-card p-6 shadow-soft hover:shadow-md transition-all hover:scale-105 group"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-hover text-white font-bold flex items-center justify-center flex-shrink-0 text-lg">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                    {mockup.name.split(". ")[1]}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Screen {index + 1} of 12
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>All screens designed for iPhone 14 (390×844 px)</p>
          <p className="mt-1">Light mode • Glassmorphism • Soft shadows</p>
        </div>
      </div>
    </div>
  );
}