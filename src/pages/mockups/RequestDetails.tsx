import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MapPin, Clock, DollarSign, ArrowLeft, MessageCircle } from "lucide-react";

const replies = [
  { id: 1, name: "Sarah Johnson", avatar: "", initial: "SJ", price: "$450", message: "I specialize in modern logo design with 5+ years experience. Would love to help!", verified: true },
  { id: 2, name: "Mike Chen", avatar: "", initial: "MC", price: "$380", message: "Check out my portfolio! Fast turnaround and unlimited revisions.", verified: true },
  { id: 3, name: "Emma Davis", avatar: "", initial: "ED", price: "$520", message: "Award-winning designer. Let's create something amazing together.", verified: false },
];

export default function RequestDetails() {
  return (
    <div className="min-h-screen bg-surface pb-6">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Request Details</h1>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Request Info Card */}
        <div className="bg-white rounded-card p-5 shadow-soft space-y-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-xl font-bold text-foreground leading-snug flex-1">
              Logo Design for Tech Startup
            </h2>
            <Badge variant="outline" className="rounded-full flex-shrink-0">Service</Badge>
          </div>

          <p className="text-muted-foreground text-sm leading-relaxed">
            Looking for a creative designer to create a modern, minimalist logo for our AI startup. Need vector files and brand guidelines. Timeline is flexible but prefer completion within 2 weeks.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="font-medium text-foreground">2.3 mi</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <Clock className="w-4 h-4 text-primary" />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Time Left</p>
                <p className="font-medium text-foreground">48 hours</p>
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-primary">$300-500</span>
          </div>
        </div>

        {/* Replies Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-semibold text-foreground">Replies ({replies.length})</h3>
            <span className="text-sm text-muted-foreground">Sorted by price</span>
          </div>

          {replies.map((reply) => (
            <div key={reply.id} className="bg-white rounded-card p-4 shadow-soft space-y-3">
              <div className="flex items-start gap-3">
                <Avatar className="w-12 h-12 border-2 border-accent">
                  <AvatarImage src={reply.avatar} />
                  <AvatarFallback className="bg-primary text-white font-semibold">
                    {reply.initial}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold text-foreground text-sm">{reply.name}</h4>
                    {reply.verified && (
                      <Badge variant="verified" className="text-xs px-2 py-0 rounded-full">
                        ✓ Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {reply.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-lg font-bold text-primary">{reply.price}</span>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="rounded-xl">
                    <MessageCircle className="w-4 h-4 mr-1" />
                    Chat
                  </Button>
                  <Button size="sm" className="rounded-xl">
                    Select
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}