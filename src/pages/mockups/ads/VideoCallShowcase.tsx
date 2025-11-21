import { Video, Maximize, Clock, CheckCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function VideoCallShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Video className="w-10 h-10 text-primary" />
          <h2 className="text-5xl font-bold text-foreground">
            Meet Face-to-Face
          </h2>
        </div>
        <p className="text-2xl text-muted-foreground">
          Virtual consultations before they arrive
        </p>
      </div>

      {/* Video call mockup */}
      <div className="w-full max-w-4xl bg-black rounded-3xl overflow-hidden shadow-2xl mb-8 animate-scale-in">
        {/* Top bar */}
        <div className="bg-black/80 backdrop-blur-sm p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-success rounded-full animate-pulse" />
            <span className="text-white font-semibold">Live Call - 02:34</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-white" />
            <span className="text-white">Saved 2 hours</span>
          </div>
        </div>

        {/* Main video area - Provider's view */}
        <div className="relative h-96 bg-muted">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-white shadow-xl">
                <AvatarImage src="/placeholder.svg" />
                <AvatarFallback className="text-4xl font-bold bg-primary text-white">
                  MJ
                </AvatarFallback>
              </Avatar>
              <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full">
                <p className="text-white font-bold text-xl">Mike Johnson</p>
                <p className="text-white/80">Inspecting the issue...</p>
              </div>
            </div>
          </div>

          {/* Picture-in-picture - Your view */}
          <div className="absolute top-4 right-4 w-32 h-40 bg-card rounded-2xl border-4 border-white shadow-xl overflow-hidden">
            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
              <span className="text-xs font-semibold text-foreground">You</span>
            </div>
          </div>

          {/* Annotations overlay */}
          <div className="absolute bottom-20 left-8 bg-warning/90 backdrop-blur-sm px-6 py-3 rounded-xl border-2 border-warning shadow-lg animate-pulse">
            <p className="text-white font-bold">← Check this valve</p>
          </div>
        </div>

        {/* Controls bar */}
        <div className="bg-black/90 backdrop-blur-sm p-6 flex items-center justify-center gap-6">
          <button className="w-14 h-14 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80">
            <Video className="w-7 h-7" />
          </button>
          <button className="w-14 h-14 bg-destructive rounded-full flex items-center justify-center hover:bg-destructive/80">
            <span className="text-white text-2xl">✕</span>
          </button>
          <button className="w-14 h-14 bg-muted rounded-full flex items-center justify-center hover:bg-muted/80">
            <Maximize className="w-7 h-7" />
          </button>
        </div>
      </div>

      {/* Benefits */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-4xl animate-fade-in delay-200">
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Save Time</h3>
          <p className="text-muted-foreground">
            Quick assessment before visit
          </p>
        </div>
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Build Trust</h3>
          <p className="text-muted-foreground">
            See who you're working with
          </p>
        </div>
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Get Clarity</h3>
          <p className="text-muted-foreground">
            Accurate quotes upfront
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center animate-fade-in delay-300">
        <p className="text-3xl font-bold text-foreground">
          The future of service marketplace
        </p>
      </div>
    </div>
  );
}
