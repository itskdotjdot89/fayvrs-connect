import { Button } from "@/components/ui/button";
import { Plus, Star, Image as ImageIcon, ArrowLeft } from "lucide-react";

export default function Portfolio() {
  // Mock portfolio items
  const portfolioItems = [
    { id: 1, featured: true },
    { id: 2, featured: false },
    { id: 3, featured: false },
    { id: 4, featured: true },
    { id: 5, featured: false },
    { id: 6, featured: false },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-md mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-xl">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-foreground">My Portfolio</h1>
              <p className="text-xs text-muted-foreground">Showcase your best work</p>
            </div>
            <Button size="sm" variant="outline" className="rounded-xl">
              Edit
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Portfolio Grid */}
        <div className="grid grid-cols-3 gap-3">
          {portfolioItems.map((item) => (
            <div
              key={item.id}
              className="aspect-square rounded-2xl bg-white shadow-soft overflow-hidden relative group cursor-pointer hover:shadow-md transition-shadow"
            >
              {/* Placeholder Image */}
              <div className="w-full h-full bg-gradient-to-br from-primary/10 to-accent flex items-center justify-center">
                <ImageIcon className="w-8 h-8 text-primary/40" />
              </div>

              {/* Featured Star */}
              {item.featured && (
                <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                  <Star className="w-3.5 h-3.5 text-white fill-white" />
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/10 transition-colors" />
            </div>
          ))}

          {/* Add New Item */}
          <button className="aspect-square rounded-2xl border-2 border-dashed border-border bg-white hover:border-primary hover:bg-accent/50 transition-colors flex flex-col items-center justify-center gap-2 cursor-pointer">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Plus className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-muted-foreground">Add Item</span>
          </button>
        </div>

        {/* Info Card */}
        <div className="bg-white rounded-card p-5 shadow-soft space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Star className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-1">Featured Items</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Mark your best work as featured to highlight it at the top of your profile.
              </p>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-br from-primary/5 to-accent rounded-card p-5 space-y-2">
          <h3 className="font-semibold text-foreground text-sm">Portfolio Tips</h3>
          <ul className="space-y-1.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Add high-quality images or videos</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Show diverse examples of your work</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary mt-0.5">•</span>
              <span>Keep it updated with recent projects</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}