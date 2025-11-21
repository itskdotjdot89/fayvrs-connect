import { CheckCircle, Star, DollarSign, ThumbsUp } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function SuccessScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-success/5 via-background to-success/10 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Confetti effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
            }}
          >
            <div 
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: ['hsl(var(--success))', 'hsl(var(--warning))', 'hsl(var(--primary))'][i % 3],
                opacity: 0.6,
              }}
            />
          </div>
        ))}
      </div>

      {/* Success checkmark */}
      <div className="mb-8 animate-scale-in">
        <div className="w-40 h-40 rounded-full bg-success/10 flex items-center justify-center border-8 border-success">
          <CheckCircle className="w-24 h-24 text-success" />
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-12 animate-fade-in delay-100">
        <h2 className="text-6xl font-bold text-foreground mb-4">
          Job Completed!
        </h2>
        <p className="text-3xl text-muted-foreground">
          Problem solved ✨
        </p>
      </div>

      {/* Before/After comparison */}
      <div className="w-full max-w-4xl grid grid-cols-2 gap-8 mb-12">
        {/* Before */}
        <Card className="overflow-hidden animate-scale-in delay-200 border-2">
          <div className="bg-destructive/10 p-4 border-b-2 border-destructive/20">
            <h3 className="text-2xl font-bold text-center">Before</h3>
          </div>
          <div className="aspect-square bg-muted relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">😰</div>
                <p className="text-xl font-semibold text-destructive">Leaking sink</p>
                <p className="text-lg text-muted-foreground">Water everywhere!</p>
              </div>
            </div>
          </div>
        </Card>

        {/* After */}
        <Card className="overflow-hidden animate-scale-in delay-300 border-2 border-success">
          <div className="bg-success/10 p-4 border-b-2 border-success/20">
            <h3 className="text-2xl font-bold text-center text-success">After</h3>
          </div>
          <div className="aspect-square bg-muted relative">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center p-8">
                <div className="text-6xl mb-4">✨</div>
                <p className="text-xl font-semibold text-success">Fixed perfectly!</p>
                <p className="text-lg text-muted-foreground">Looks brand new</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Rating & Payment */}
      <div className="w-full max-w-4xl grid grid-cols-2 gap-6 mb-12">
        {/* Rating card */}
        <Card className="p-8 text-center animate-scale-in delay-400 border-2">
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-3">Rate Your Experience</h3>
            <div className="flex items-center justify-center gap-2 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className="w-12 h-12 text-warning fill-warning"
                />
              ))}
            </div>
            <p className="text-xl font-semibold text-warning">5 Stars - Excellent!</p>
          </div>
          <div className="bg-muted rounded-xl p-4">
            <p className="text-base italic">
              "Fast, professional, and fixed it perfectly. Highly recommend!"
            </p>
          </div>
        </Card>

        {/* Payment card */}
        <Card className="p-8 text-center animate-scale-in delay-500 border-2 border-success">
          <div className="mb-4">
            <h3 className="text-2xl font-bold mb-4">Payment</h3>
            <div className="flex items-center justify-center gap-3 mb-3">
              <DollarSign className="w-10 h-10 text-success" />
              <div className="text-6xl font-bold text-success">175</div>
            </div>
            <p className="text-lg text-muted-foreground mb-4">Fixed price - No surprises</p>
          </div>
          <div className="bg-success text-white rounded-xl p-4 font-bold text-xl">
            Payment Processed ✓
          </div>
        </Card>
      </div>

      {/* Benefits summary */}
      <div className="grid grid-cols-3 gap-6 w-full max-w-4xl animate-fade-in delay-600">
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <ThumbsUp className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Found in 10 min</h3>
          <p className="text-muted-foreground">
            From post to provider
          </p>
        </div>
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">Done same day</h3>
          <p className="text-muted-foreground">
            No waiting weeks
          </p>
        </div>
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <Star className="w-12 h-12 text-success mx-auto mb-3" />
          <h3 className="text-xl font-bold mb-2">5-star service</h3>
          <p className="text-muted-foreground">
            Verified professional
          </p>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-12 text-center animate-fade-in delay-700">
        <p className="text-4xl font-bold text-success mb-2">
          That's How Fayvrs Works
        </p>
        <p className="text-2xl text-muted-foreground">
          Simple. Fast. Reliable.
        </p>
      </div>
    </div>
  );
}
