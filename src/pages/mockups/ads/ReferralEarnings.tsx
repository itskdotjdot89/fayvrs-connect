import { DollarSign, Users, Gift, TrendingUp, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function ReferralEarnings() {
  const referrals = [
    { name: "Sarah", earnings: 85, active: true },
    { name: "Mike", earnings: 120, active: true },
    { name: "Jessica", earnings: 65, active: true },
    { name: "David", earnings: 70, active: false },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Gift className="w-10 h-10 text-primary" />
          <h2 className="text-5xl font-bold text-foreground">
            Earn Passive Income
          </h2>
        </div>
        <p className="text-2xl text-muted-foreground">
          Get 10% of your friends' earnings—forever
        </p>
      </div>

      {/* Main earnings card */}
      <Card className="w-full max-w-3xl p-10 mb-8 animate-scale-in border-2 border-primary">
        {/* Total earnings */}
        <div className="text-center mb-8">
          <div className="text-lg text-muted-foreground mb-2">Your Referral Earnings</div>
          <div className="flex items-center justify-center gap-4 mb-4">
            <DollarSign className="w-16 h-16 text-primary" />
            <div className="text-8xl font-bold text-primary">340</div>
          </div>
          <div className="flex items-center justify-center gap-2 text-primary">
            <TrendingUp className="w-6 h-6" />
            <span className="text-xl font-semibold">This month alone!</span>
          </div>
        </div>

        {/* Referrals grid */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          {referrals.map((referral, i) => (
            <div
              key={i}
              className="bg-muted rounded-2xl p-6 text-center animate-scale-in"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <Avatar className="w-16 h-16 mx-auto mb-3 border-2 border-primary">
                <AvatarFallback className="bg-primary text-white text-xl font-bold">
                  {referral.name[0]}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-lg font-bold mb-2">{referral.name}</h3>
              {referral.active && (
                <div className="flex items-center justify-center gap-1 text-success text-sm mb-2">
                  <div className="w-2 h-2 bg-success rounded-full animate-pulse" />
                  <span>Active</span>
                </div>
              )}
              <div className="text-2xl font-bold text-primary">${referral.earnings}</div>
              <div className="text-xs text-muted-foreground">earned</div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-card rounded-xl p-4 text-center border-2">
            <Users className="w-8 h-8 text-primary mx-auto mb-2" />
            <div className="text-3xl font-bold text-primary mb-1">4</div>
            <div className="text-sm text-muted-foreground">Active Referrals</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border-2">
            <DollarSign className="w-8 h-8 text-success mx-auto mb-2" />
            <div className="text-3xl font-bold text-success mb-1">10%</div>
            <div className="text-sm text-muted-foreground">Commission Rate</div>
          </div>
          <div className="bg-card rounded-xl p-4 text-center border-2">
            <TrendingUp className="w-8 h-8 text-warning mx-auto mb-2" />
            <div className="text-3xl font-bold text-warning mb-1">∞</div>
            <div className="text-sm text-muted-foreground">Lifetime Earnings</div>
          </div>
        </div>
      </Card>

      {/* Referral code card */}
      <Card className="w-full max-w-3xl p-8 mb-8 animate-scale-in delay-200 border-2 border-success">
        <div className="text-center">
          <h3 className="text-3xl font-bold mb-4">Your Referral Code</h3>
          <div className="bg-muted rounded-2xl p-6 mb-6 border-4 border-success/20">
            <div className="text-6xl font-bold text-success mb-2 tracking-wider">
              ALEX2024
            </div>
            <p className="text-lg text-muted-foreground">
              Share this code with friends
            </p>
          </div>
          <button className="w-full bg-success text-white rounded-2xl p-6 font-bold text-2xl shadow-lg hover:opacity-90 transition-opacity flex items-center justify-center gap-3">
            <Share2 className="w-8 h-8" />
            Share Referral Link
          </button>
        </div>
      </Card>

      {/* How it works */}
      <div className="w-full max-w-4xl grid grid-cols-3 gap-6 mb-8 animate-fade-in delay-300">
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4 border-4 border-primary">
            <div className="text-3xl font-bold text-primary">1</div>
          </div>
          <h3 className="text-xl font-bold mb-2">Share Your Code</h3>
          <p className="text-muted-foreground">
            Invite friends to join Fayvrs
          </p>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4 border-4 border-success">
            <div className="text-3xl font-bold text-success">2</div>
          </div>
          <h3 className="text-xl font-bold mb-2">They Sign Up</h3>
          <p className="text-muted-foreground">
            Friends join as providers
          </p>
        </div>
        <div className="text-center">
          <div className="w-20 h-20 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4 border-4 border-warning">
            <div className="text-3xl font-bold text-warning">3</div>
          </div>
          <h3 className="text-xl font-bold mb-2">You Earn 10%</h3>
          <p className="text-muted-foreground">
            Of their earnings, forever
          </p>
        </div>
      </div>

      {/* Example calculation */}
      <Card className="w-full max-w-3xl p-8 bg-primary/5 border-2 border-primary animate-fade-in delay-400">
        <h3 className="text-2xl font-bold text-center mb-6">💰 Example Earnings</h3>
        <div className="space-y-4 text-lg">
          <div className="flex justify-between items-center">
            <span>Your friend earns <strong>$1,000/week</strong></span>
            <span className="font-bold text-primary">→ You earn $100/week</span>
          </div>
          <div className="flex justify-between items-center">
            <span>5 friends earning <strong>$1,000/week</strong> each</span>
            <span className="font-bold text-primary">→ You earn $500/week</span>
          </div>
          <div className="border-t-2 border-border pt-4 mt-4">
            <div className="flex justify-between items-center text-2xl">
              <span className="font-bold">Per year:</span>
              <span className="font-bold text-success">$26,000+</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Bottom CTA */}
      <div className="mt-12 text-center animate-fade-in delay-500">
        <p className="text-4xl font-bold text-foreground mb-2">
          Build Your Referral Network
        </p>
        <p className="text-xl text-muted-foreground">
          The more you share, the more you earn
        </p>
      </div>
    </div>
  );
}
