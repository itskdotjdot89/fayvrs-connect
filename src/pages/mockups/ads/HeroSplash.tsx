import { Sparkles, MapPin, Wrench, Paintbrush, Camera, Zap } from "lucide-react";

export default function HeroSplash() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary via-primary-glow to-secondary flex flex-col items-center justify-center p-8 relative overflow-hidden">
      {/* Floating icons */}
      <MapPin className="absolute top-20 left-12 w-12 h-12 text-white/30 animate-pulse" />
      <Wrench className="absolute top-32 right-16 w-10 h-10 text-white/20 animate-pulse delay-75" />
      <Paintbrush className="absolute bottom-32 left-20 w-10 h-10 text-white/25 animate-pulse delay-150" />
      <Camera className="absolute bottom-20 right-24 w-12 h-12 text-white/30 animate-pulse delay-100" />
      <Zap className="absolute top-1/2 left-8 w-8 h-8 text-white/20 animate-pulse delay-200" />
      <Sparkles className="absolute top-1/3 right-12 w-10 h-10 text-white/25 animate-pulse" />

      {/* Main content */}
      <div className="text-center z-10 space-y-8">
        <div className="animate-scale-in">
          <h1 className="text-8xl font-bold text-white mb-4 tracking-tight">
            Fayvrs
          </h1>
          <div className="flex items-center justify-center gap-2 mb-8">
            <Sparkles className="w-6 h-6 text-white animate-pulse" />
            <p className="text-2xl text-white/90 font-light">
              Your local marketplace for anything
            </p>
            <Sparkles className="w-6 h-6 text-white animate-pulse delay-100" />
          </div>
        </div>

        <div className="space-y-4 animate-fade-in delay-200">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-xl text-white font-medium">
              🔨 Need a service? Post in seconds
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-xl text-white font-medium">
              💼 Offer a service? Get paid instantly
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <p className="text-xl text-white font-medium">
              🎯 AI matches you in real-time
            </p>
          </div>
        </div>
      </div>

      {/* Sparkle effects */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            <div className="w-2 h-2 bg-white/40 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
