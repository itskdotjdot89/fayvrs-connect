import { Bell, MapPin, DollarSign, Clock, CheckCircle } from "lucide-react";

export default function ProviderNotification() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background flex flex-col items-center justify-center p-6">
      {/* Phone mockup */}
      <div className="w-full max-w-md">
        {/* Lock screen header */}
        <div className="text-center mb-4 animate-fade-in">
          <p className="text-xl text-muted-foreground">10:34 AM</p>
          <p className="text-lg text-muted-foreground">Tuesday, March 12</p>
        </div>

        {/* Notification card */}
        <div className="bg-card rounded-3xl shadow-2xl p-6 mb-6 animate-scale-in border-2 border-primary">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center flex-shrink-0">
              <Bell className="w-8 h-8 text-white animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-2xl font-bold">Fayvrs</h3>
                <span className="text-sm text-muted-foreground">now</span>
              </div>
              <p className="text-xl font-semibold text-foreground mb-2">
                New Request Nearby! 🎯
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="bg-primary/5 rounded-xl p-4 border border-primary/20">
              <p className="text-lg font-bold mb-2">Plumbing Emergency</p>
              <div className="space-y-2 text-base">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-success" />
                  <span className="font-semibold text-success">$150-200 Budget</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  <span>0.8 miles away</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-warning" />
                  <span>Urgent - Needed today</span>
                </div>
              </div>
            </div>

            <div className="bg-muted rounded-xl p-3">
              <p className="text-sm text-muted-foreground italic">
                "Kitchen sink is leaking badly, water everywhere. Need someone ASAP!"
              </p>
            </div>
          </div>

          {/* Swipe indicator */}
          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
            <div className="text-lg">👆</div>
            <p className="text-base">Swipe to view details</p>
          </div>
        </div>

        {/* Provider action preview */}
        <div className="bg-card rounded-3xl shadow-xl p-6 animate-scale-in delay-200 border-2">
          <h4 className="text-2xl font-bold mb-4 text-center">You're Perfect For This!</h4>
          
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3 text-lg">
              <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
              <span>Matches your specialty</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
              <span>Within your service area</span>
            </div>
            <div className="flex items-center gap-3 text-lg">
              <CheckCircle className="w-6 h-6 text-success flex-shrink-0" />
              <span>Available in your schedule</span>
            </div>
          </div>

          <div className="bg-primary text-white rounded-2xl p-5 text-center font-bold text-2xl shadow-lg">
            Send Proposal →
          </div>
        </div>
      </div>

      {/* Bottom text */}
      <div className="mt-8 text-center animate-fade-in delay-300">
        <p className="text-3xl font-bold text-foreground mb-2">
          Get Instant Alerts
        </p>
        <p className="text-xl text-muted-foreground">
          Never miss an opportunity
        </p>
      </div>
    </div>
  );
}
