import { Camera, Sparkles, CheckCircle, Zap } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function RequestCreationShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Zap className="w-8 h-8 text-primary" />
          <h2 className="text-5xl font-bold text-foreground">
            Post in Seconds
          </h2>
          <Zap className="w-8 h-8 text-primary" />
        </div>
        <p className="text-2xl text-muted-foreground">
          AI does the heavy lifting for you
        </p>
      </div>

      {/* Steps */}
      <div className="w-full max-w-2xl space-y-6">
        {/* Step 1 */}
        <Card className="p-8 bg-card animate-scale-in border-2">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="text-4xl font-bold text-primary">1</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Camera className="w-8 h-8 text-primary" />
                <h3 className="text-3xl font-bold">Snap a photo</h3>
              </div>
              <p className="text-xl text-muted-foreground">
                Take a quick picture of what you need
              </p>
            </div>
            <div className="flex-shrink-0 w-24 h-24 bg-muted rounded-lg flex items-center justify-center">
              <Camera className="w-12 h-12 text-muted-foreground/50" />
            </div>
          </div>
        </Card>

        {/* Step 2 */}
        <Card className="p-8 bg-card animate-scale-in delay-100 border-2">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                <div className="text-4xl font-bold text-primary">2</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <Sparkles className="w-8 h-8 text-primary animate-pulse" />
                <h3 className="text-3xl font-bold">AI writes it for you</h3>
              </div>
              <p className="text-xl text-muted-foreground">
                Smart suggestions based on your image
              </p>
            </div>
            <div className="flex-shrink-0 text-right">
              <div className="text-sm text-muted-foreground mb-1">AI Generated</div>
              <div className="bg-primary/5 px-4 py-2 rounded-lg border border-primary/20">
                <p className="text-sm font-medium">
                  "Fix leaking kitchen faucet..."
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Step 3 */}
        <Card className="p-8 bg-card animate-scale-in delay-200 border-2 border-success">
          <div className="flex items-center gap-6">
            <div className="flex-shrink-0">
              <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
                <div className="text-4xl font-bold text-success">3</div>
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="w-8 h-8 text-success" />
                <h3 className="text-3xl font-bold">Tap "Post"</h3>
              </div>
              <p className="text-xl text-muted-foreground">
                Your request goes live instantly
              </p>
            </div>
            <div className="flex-shrink-0">
              <div className="bg-success text-white px-8 py-4 rounded-xl font-bold text-xl shadow-lg">
                Post Request
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Success checkmark */}
      <div className="mt-12 animate-scale-in delay-300">
        <div className="w-32 h-32 rounded-full bg-success/10 flex items-center justify-center border-4 border-success">
          <CheckCircle className="w-20 h-20 text-success" />
        </div>
      </div>

      <p className="text-3xl font-bold text-success mt-6 animate-fade-in delay-300">
        Done in under 30 seconds!
      </p>
    </div>
  );
}
