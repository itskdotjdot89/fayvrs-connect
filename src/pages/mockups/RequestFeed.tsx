import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Filter, MapPin, Clock, Plus } from "lucide-react";

const requests = [
  { id: 1, title: "Logo Design for Tech Startup", category: "Service", distance: "2.3 mi", timeLeft: "48h", budget: "$300-500", replies: 8 },
  { id: 2, title: "Home Cleaning Service", category: "Service", distance: "1.2 mi", timeLeft: "24h", budget: "$100-150", replies: 5 },
  { id: 3, title: "Custom Website Development", category: "Service", distance: "5.7 mi", timeLeft: "60h", budget: "$2000-3000", replies: 12 },
  { id: 4, title: "Professional Photography Session", category: "Service", distance: "3.4 mi", timeLeft: "36h", budget: "$200-400", replies: 7 },
  { id: 5, title: "Handmade Furniture Piece", category: "Product", distance: "8.1 mi", timeLeft: "12h", budget: "$800-1200", replies: 3 },
];

export default function RequestFeed() {
  return (
    <div className="min-h-screen bg-surface pb-24">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold font-poppins text-foreground">Active Requests</h1>
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
        {requests.map((req) => (
          <div key={req.id} className="bg-white rounded-card p-5 shadow-soft hover:shadow-md transition-shadow cursor-pointer">
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-foreground text-base leading-snug flex-1">
                  {req.title}
                </h3>
                <Badge variant="outline" className="rounded-full text-xs flex-shrink-0">
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
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-primary">{req.budget}</span>
                  <span className="text-xs text-muted-foreground">{req.replies} replies</span>
                </div>
                <Button size="sm" className="rounded-xl">
                  View Details
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="lg" 
          className="w-14 h-14 rounded-full shadow-xl hover:shadow-2xl transition-shadow"
        >
          <Plus className="w-6 h-6" />
        </Button>
      </div>
    </div>
  );
}