import { MapPin, Zap, Users, Clock } from "lucide-react";

export default function LiveMatchingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in z-10">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Zap className="w-10 h-10 text-primary animate-pulse" />
          <h2 className="text-5xl font-bold text-foreground">
            AI Finds the Perfect Match
          </h2>
        </div>
        <p className="text-2xl text-muted-foreground">
          Instantly connecting you with nearby professionals
        </p>
      </div>

      {/* Map simulation */}
      <div className="relative w-full max-w-3xl h-[500px] bg-muted rounded-3xl border-4 border-border overflow-hidden mb-8">
        {/* Request pin (center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
          <div className="relative">
            {/* Pulsing rings */}
            <div className="absolute inset-0 -m-8 rounded-full bg-primary/20 animate-ping" />
            <div className="absolute inset-0 -m-16 rounded-full bg-primary/10 animate-ping delay-100" />
            <div className="absolute inset-0 -m-24 rounded-full bg-primary/5 animate-ping delay-200" />
            
            {/* Main pin */}
            <div className="relative w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-xl border-4 border-white">
              <MapPin className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap">
              <div className="bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                Your Request
              </div>
            </div>
          </div>
        </div>

        {/* Provider pins */}
        {[
          { top: '20%', left: '30%', delay: '0ms' },
          { top: '25%', left: '65%', delay: '100ms' },
          { top: '60%', left: '25%', delay: '200ms' },
          { top: '65%', left: '70%', delay: '300ms' },
          { top: '40%', left: '80%', delay: '400ms' },
        ].map((pos, i) => (
          <div
            key={i}
            className="absolute animate-scale-in"
            style={{ 
              top: pos.top, 
              left: pos.left,
              animationDelay: pos.delay 
            }}
          >
            <div className="relative">
              {/* Connection line to center */}
              <svg className="absolute w-full h-full pointer-events-none opacity-30">
                <line
                  x1="50%"
                  y1="50%"
                  x2="50%"
                  y2="-200%"
                  stroke="hsl(var(--primary))"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  className="animate-pulse"
                />
              </svg>
              
              <div className="w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-lg border-4 border-white animate-pulse">
                <Users className="w-7 h-7 text-white" />
              </div>
            </div>
          </div>
        ))}

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="grid grid-cols-8 grid-rows-8 w-full h-full">
            {[...Array(64)].map((_, i) => (
              <div key={i} className="border border-foreground" />
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-3xl animate-scale-in delay-500">
        <div className="bg-card rounded-2xl p-6 text-center border-2 border-primary">
          <div className="text-5xl font-bold text-primary mb-2">12</div>
          <div className="text-lg text-muted-foreground">Providers Matched</div>
        </div>
        <div className="bg-card rounded-2xl p-6 text-center border-2 border-success">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Clock className="w-8 h-8 text-success" />
            <div className="text-5xl font-bold text-success">0.3s</div>
          </div>
          <div className="text-lg text-muted-foreground">Response Time</div>
        </div>
        <div className="bg-card rounded-2xl p-6 text-center border-2 border-warning">
          <div className="text-5xl font-bold text-warning mb-2">100%</div>
          <div className="text-lg text-muted-foreground">AI Accuracy</div>
        </div>
      </div>
    </div>
  );
}
