import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, CheckCircle, Calendar, TrendingUp, ArrowUpRight } from "lucide-react";

export default function ProviderDashboard() {
  const stats = [
    { label: "Leads", value: "142", icon: Eye, color: "text-blue-500" },
    { label: "Replies", value: "38", icon: MessageCircle, color: "text-purple-500" },
    { label: "Selections", value: "12", icon: CheckCircle, color: "text-verified" },
    { label: "Renewal", value: "Dec 31", icon: Calendar, color: "text-orange-500" },
  ];

  return (
    <div className="min-h-screen bg-surface">
      {/* Header */}
      <div className="bg-white border-b border-border">
        <div className="max-w-md mx-auto px-4 py-4">
          <h1 className="text-xl font-bold font-poppins text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground">Your performance overview</p>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Subscription Status */}
        <div className="bg-gradient-to-br from-primary to-primary-hover rounded-card p-6 shadow-soft text-white space-y-3">
          <div className="flex items-center justify-between">
            <Badge className="bg-white/20 text-white border-white/30">Active</Badge>
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm opacity-90">Current Plan</p>
            <h2 className="text-2xl font-bold">Monthly Subscription</h2>
          </div>
          <div className="flex items-center justify-between pt-2">
            <span className="text-sm">$30/month</span>
            <Button size="sm" variant="secondary" className="rounded-xl">
              Upgrade
            </Button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-card p-5 shadow-soft space-y-3">
              <div className={`w-10 h-10 rounded-xl bg-accent flex items-center justify-center ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="space-y-3">
          <h3 className="font-semibold text-foreground px-1">Recent Activity</h3>
          
          <div className="bg-white rounded-card p-4 shadow-soft space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-verified/10 flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-verified" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">You were selected!</p>
                <p className="text-xs text-muted-foreground">Logo Design for Tech Startup</p>
                <p className="text-xs text-muted-foreground mt-1">2 hours ago</p>
              </div>
              <Button size="sm" variant="ghost" className="rounded-xl flex-shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-white rounded-card p-4 shadow-soft space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                <MessageCircle className="w-4 h-4 text-purple-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">New message</p>
                <p className="text-xs text-muted-foreground">From John about Website Development</p>
                <p className="text-xs text-muted-foreground mt-1">5 hours ago</p>
              </div>
              <Button size="sm" variant="ghost" className="rounded-xl flex-shrink-0">
                <ArrowUpRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Upgrade CTA */}
        <div className="bg-white rounded-card p-6 shadow-soft space-y-3 border-2 border-primary/20">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary-hover flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Save 33% with Annual</h3>
              <p className="text-sm text-muted-foreground">
                Upgrade to yearly and save $120 per year
              </p>
            </div>
          </div>
          <Button className="w-full rounded-xl">
            Upgrade to Annual - $240/year
          </Button>
        </div>
      </div>
    </div>
  );
}