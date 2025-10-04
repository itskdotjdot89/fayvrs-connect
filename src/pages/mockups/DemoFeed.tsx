import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, MapPin, Clock } from "lucide-react";

const demoRequests = [
  { id: 1, title: "Web Design for Small Business", category: "Service", distance: "2.3 mi", timeLeft: "48h", budget: "$500-800" },
  { id: 2, title: "Logo & Brand Identity", category: "Service", distance: "5.1 mi", timeLeft: "24h", budget: "$300-500" },
  { id: 3, title: "Photo Editing for Event", category: "Service", distance: "1.8 mi", timeLeft: "12h", budget: "$150-250" },
  { id: 4, title: "Custom Furniture Build", category: "Product", distance: "8.2 mi", timeLeft: "60h", budget: "$1200-1500" },
];

export default function DemoFeed() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold font-poppins text-foreground">Browse Requests</h1>
            <Button variant="ghost" size="icon" className="rounded-xl">
              <Filter className="w-5 h-5" />
            </Button>
          </div>
          
          {/* Filter Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Badge variant="default" className="rounded-full px-4 py-1.5 whitespace-nowrap">All</Badge>
            <Badge variant="outline" className="rounded-full px-4 py-1.5 whitespace-nowrap">Service</Badge>
            <Badge variant="outline" className="rounded-full px-4 py-1.5 whitespace-nowrap">Product</Badge>
            <Badge variant="outline" className="rounded-full px-4 py-1.5 whitespace-nowrap">Near Me</Badge>
          </div>
        </div>
      </div>

      {/* Request Cards */}
      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {demoRequests.map((req) => (
          <div key={req.id} className="bg-white rounded-card p-5 shadow-soft backdrop-blur-glass relative overflow-hidden">
            {/* Blur overlay for demo */}
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm z-10 pointer-events-none" />
            
            <div className="space-y-3 relative">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground text-base leading-snug flex-1">
                  {req.title}
                </h3>
                <Badge variant="outline" className="rounded-full text-xs">
                  {req.category}
                </Badge>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <MapPin className="w-4 h-4" />
                  <span>{req.distance}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  <span>{req.timeLeft}</span>
                </div>
              </div>
              
              <div className="pt-2 flex items-center justify-between">
                <span className="text-lg font-bold text-primary">{req.budget}</span>
                <Button size="sm" variant="outline" className="rounded-xl">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-glass border-t border-border p-4">
        <div className="max-w-md mx-auto">
          <Button size="lg" className="w-full h-14 rounded-2xl shadow-soft">
            Sign up to post or reply
          </Button>
        </div>
      </div>
    </div>
  );
}