import { DollarSign, TrendingUp, Calendar, Briefcase } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function EarningsShowcase() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-success/5 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-5xl font-bold text-foreground mb-4">
          Turn Your Skills Into Income
        </h2>
        <p className="text-2xl text-muted-foreground">
          Earn on your own schedule
        </p>
      </div>

      {/* Main earnings card */}
      <Card className="w-full max-w-3xl p-10 mb-8 animate-scale-in border-2 border-success">
        {/* Weekly earnings highlight */}
        <div className="text-center mb-8">
          <div className="text-lg text-muted-foreground mb-2">This Week's Earnings</div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <DollarSign className="w-16 h-16 text-success" />
            <div className="text-8xl font-bold text-success">2,450</div>
          </div>
          <div className="flex items-center justify-center gap-2 text-success">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xl font-semibold">+32% from last week</span>
          </div>
        </div>

        {/* Graph visualization */}
        <div className="bg-muted rounded-2xl p-6 mb-8">
          <div className="flex items-end justify-between gap-4 h-48">
            {[
              { day: 'Mon', amount: 320, height: '40%' },
              { day: 'Tue', amount: 450, height: '60%' },
              { day: 'Wed', amount: 280, height: '35%' },
              { day: 'Thu', amount: 520, height: '70%' },
              { day: 'Fri', amount: 380, height: '50%' },
              { day: 'Sat', amount: 680, height: '95%' },
              { day: 'Sun', amount: 420, height: '55%' },
            ].map((bar, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 animate-scale-in" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="text-lg font-bold text-success">${bar.amount}</div>
                <div 
                  className="w-full bg-gradient-to-t from-success to-success/50 rounded-t-xl transition-all duration-500"
                  style={{ height: bar.height }}
                />
                <div className="text-sm text-muted-foreground font-semibold">{bar.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 text-center border-2">
            <div className="text-4xl font-bold text-primary mb-2">12</div>
            <div className="text-sm text-muted-foreground">Jobs Completed</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border-2">
            <div className="text-4xl font-bold text-warning mb-2">4.9</div>
            <div className="text-sm text-muted-foreground">Average Rating</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border-2">
            <div className="text-4xl font-bold text-success mb-2">98%</div>
            <div className="text-sm text-muted-foreground">Response Rate</div>
          </div>
        </div>
      </Card>

      {/* Payout info */}
      <Card className="w-full max-w-3xl p-8 mb-8 animate-scale-in delay-200 border-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <Calendar className="w-10 h-10 text-success" />
            </div>
            <div>
              <h3 className="text-3xl font-bold mb-2">Next Payout</h3>
              <p className="text-xl text-muted-foreground">Friday, March 15</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-5xl font-bold text-success">$2,450</div>
            <div className="text-base text-muted-foreground mt-1">Direct deposit</div>
          </div>
        </div>
      </Card>

      {/* Benefits */}
      <div className="grid grid-cols-4 gap-6 w-full max-w-4xl animate-fade-in delay-300">
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <Briefcase className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">Your Schedule</h3>
          <p className="text-sm text-muted-foreground">
            Work when you want
          </p>
        </div>
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <DollarSign className="w-10 h-10 text-success mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">Set Your Rates</h3>
          <p className="text-sm text-muted-foreground">
            You control pricing
          </p>
        </div>
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <TrendingUp className="w-10 h-10 text-warning mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">Grow Income</h3>
          <p className="text-sm text-muted-foreground">
            More jobs, more $$$
          </p>
        </div>
        <div className="bg-card rounded-2xl p-6 text-center border-2">
          <Calendar className="w-10 h-10 text-primary mx-auto mb-3" />
          <h3 className="text-lg font-bold mb-2">Weekly Pay</h3>
          <p className="text-sm text-muted-foreground">
            Fast payouts
          </p>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="mt-12 text-center animate-fade-in delay-400">
        <p className="text-4xl font-bold text-foreground mb-2">
          Start Earning Today
        </p>
        <p className="text-xl text-muted-foreground">
          Thousands of providers are already making money
        </p>
      </div>
    </div>
  );
}
