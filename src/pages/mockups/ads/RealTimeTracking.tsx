import { MapPin, Clock, Navigation, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function RealTimeTracking() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Navigation className="w-10 h-10 text-primary animate-pulse" />
          <h2 className="text-5xl font-bold text-foreground">
            Track in Real-Time
          </h2>
        </div>
        <p className="text-2xl text-muted-foreground">
          Know exactly when they'll arrive
        </p>
      </div>

      {/* Map view */}
      <div className="w-full max-w-3xl bg-muted rounded-3xl overflow-hidden shadow-2xl mb-8 border-4 border-border animate-scale-in">
        {/* Top info bar */}
        <div className="bg-card p-6 border-b-2 border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                <span className="text-2xl font-bold text-white">MJ</span>
              </div>
              <div>
                <h3 className="text-2xl font-bold">Mike Johnson</h3>
                <p className="text-lg text-muted-foreground">On the way to you</p>
              </div>
            </div>
            <button className="w-14 h-14 bg-success rounded-full flex items-center justify-center shadow-lg">
              <Phone className="w-7 h-7 text-white" />
            </button>
          </div>
        </div>

        {/* Map simulation */}
        <div className="relative h-[500px] bg-gradient-to-br from-blue-50 to-green-50">
          {/* Grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="grid grid-cols-6 grid-rows-6 w-full h-full">
              {[...Array(36)].map((_, i) => (
                <div key={i} className="border border-foreground" />
              ))}
            </div>
          </div>

          {/* Route line */}
          <svg className="absolute inset-0 w-full h-full">
            <path
              d="M 150 100 Q 300 150 400 300 T 500 400"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              fill="none"
              strokeDasharray="15,10"
              className="opacity-40"
            />
          </svg>

          {/* Provider's car (animated) */}
          <div className="absolute top-1/3 left-1/3 animate-pulse">
            <div className="relative">
              {/* Motion trail */}
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 w-12 h-1 bg-primary/30 rounded-full" />
              
              <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <Navigation className="w-10 h-10 text-white" />
              </div>
              
              {/* Info popup */}
              <div className="absolute -top-20 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-primary text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                  Mike's Location
                </div>
              </div>
            </div>
          </div>

          {/* Your location */}
          <div className="absolute bottom-1/4 right-1/4">
            <div className="relative">
              {/* Pulsing rings */}
              <div className="absolute inset-0 -m-4 rounded-full bg-success/20 animate-ping" />
              <div className="absolute inset-0 -m-8 rounded-full bg-success/10 animate-ping delay-100" />
              
              <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center shadow-xl border-4 border-white">
                <MapPin className="w-8 h-8 text-white" />
              </div>
              
              <div className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="bg-success text-white px-4 py-2 rounded-lg font-bold shadow-lg">
                  Your Location
                </div>
              </div>
            </div>
          </div>

          {/* Distance markers */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
            <div className="bg-white/90 backdrop-blur-sm px-6 py-3 rounded-xl shadow-lg border-2 border-primary">
              <p className="text-lg font-semibold text-center">2.4 miles</p>
            </div>
          </div>
        </div>

        {/* Bottom status bar */}
        <div className="bg-card p-6 border-t-2 border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-primary" />
              <div>
                <div className="text-3xl font-bold text-primary">12 min</div>
                <div className="text-sm text-muted-foreground">Estimated arrival</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">2:45 PM</div>
              <div className="text-sm text-muted-foreground">Expected time</div>
            </div>
          </div>

          {/* Live updates feed */}
          <div className="space-y-2">
            <div className="bg-muted rounded-lg p-3 flex items-center gap-3">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
              <span className="text-sm">Mike is on Main Street</span>
              <span className="text-xs text-muted-foreground ml-auto">Just now</span>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 flex items-center gap-3 opacity-70">
              <div className="w-2 h-2 bg-muted-foreground rounded-full" />
              <span className="text-sm">Picked up supplies</span>
              <span className="text-xs text-muted-foreground ml-auto">5 min ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="text-center animate-fade-in delay-200">
        <p className="text-3xl font-bold text-foreground mb-2">
          Real-Time Peace of Mind
        </p>
        <p className="text-xl text-muted-foreground">
          No more wondering when they'll show up
        </p>
      </div>
    </div>
  );
}
