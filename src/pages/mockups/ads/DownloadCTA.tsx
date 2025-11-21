import { Smartphone, Download, Sparkles, Apple, Play } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function DownloadCTA() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-glow to-secondary flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
            }}
          >
            <Sparkles 
              className="text-white/20" 
              style={{ width: `${Math.random() * 20 + 10}px`, height: `${Math.random() * 20 + 10}px` }}
            />
          </div>
        ))}
      </div>

      {/* Main content */}
      <div className="text-center z-10 max-w-4xl">
        {/* Logo */}
        <div className="mb-8 animate-scale-in">
          <h1 className="text-8xl font-bold text-white mb-4 tracking-tight">
            Fayvrs
          </h1>
          <p className="text-3xl text-white/90 font-light">
            Your local marketplace for anything
          </p>
        </div>

        {/* Phone mockup */}
        <div className="mb-12 animate-scale-in delay-100">
          <div className="relative inline-block">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full animate-pulse" />
            
            {/* Phone frame */}
            <div className="relative w-80 h-[600px] bg-card rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden">
              {/* Screen content preview */}
              <div className="bg-gradient-to-b from-background to-muted h-full p-6 flex flex-col items-center justify-center">
                <Smartphone className="w-24 h-24 text-primary mb-4" />
                <h3 className="text-2xl font-bold mb-2">Download Now</h3>
                <p className="text-muted-foreground text-center">
                  Available on iOS & Android
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Download buttons */}
        <div className="flex flex-col gap-6 items-center mb-12 animate-fade-in delay-200">
          {/* App Store */}
          <Card className="bg-white hover:scale-105 transition-transform cursor-pointer w-96 border-4">
            <div className="flex items-center gap-6 p-6">
              <div className="w-16 h-16 rounded-2xl bg-black flex items-center justify-center flex-shrink-0">
                <Apple className="w-10 h-10 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm text-muted-foreground">Download on the</div>
                <div className="text-3xl font-bold">App Store</div>
              </div>
            </div>
          </Card>

          {/* Google Play */}
          <Card className="bg-white hover:scale-105 transition-transform cursor-pointer w-96 border-4">
            <div className="flex items-center gap-6 p-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-green-500 flex items-center justify-center flex-shrink-0">
                <Play className="w-10 h-10 text-white" />
              </div>
              <div className="text-left flex-1">
                <div className="text-sm text-muted-foreground">GET IT ON</div>
                <div className="text-3xl font-bold">Google Play</div>
              </div>
            </div>
          </Card>
        </div>

        {/* QR Code section */}
        <div className="mb-12 animate-fade-in delay-300">
          <p className="text-xl text-white/80 mb-4">
            Or scan to download
          </p>
          <div className="inline-block bg-white p-6 rounded-2xl">
            <div className="w-40 h-40 bg-muted rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-2">📱</div>
                <div className="text-xs text-muted-foreground">QR Code</div>
              </div>
            </div>
          </div>
        </div>

        {/* Final CTA */}
        <div className="animate-fade-in delay-400">
          <div className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/20">
            <h2 className="text-5xl font-bold text-white mb-4">
              Get Started Today
            </h2>
            <p className="text-2xl text-white/80 mb-6">
              It's free to join!
            </p>
            <div className="flex items-center justify-center gap-3">
              <Download className="w-8 h-8 text-white" />
              <span className="text-xl text-white font-semibold">
                Download now and get your first request matched instantly
              </span>
            </div>
          </div>
        </div>

        {/* Bottom features */}
        <div className="grid grid-cols-3 gap-6 mt-12 animate-fade-in delay-500">
          <div className="text-white text-center">
            <div className="text-5xl mb-2">⚡</div>
            <div className="text-lg font-semibold">Instant Matching</div>
          </div>
          <div className="text-white text-center">
            <div className="text-5xl mb-2">✅</div>
            <div className="text-lg font-semibold">Verified Pros</div>
          </div>
          <div className="text-white text-center">
            <div className="text-5xl mb-2">💯</div>
            <div className="text-lg font-semibold">100% Free</div>
          </div>
        </div>
      </div>
    </div>
  );
}
