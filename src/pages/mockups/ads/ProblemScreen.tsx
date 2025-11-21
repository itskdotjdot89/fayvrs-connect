import { Frown, Clock, PhoneOff } from "lucide-react";

export default function ProblemScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-muted to-background flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-5xl font-bold text-foreground mb-4">
          Sound Familiar?
        </h2>
        <p className="text-2xl text-muted-foreground">
          Finding local help shouldn't be this hard...
        </p>
      </div>

      {/* Split problem scenarios */}
      <div className="w-full max-w-4xl grid grid-cols-2 gap-6 mb-12">
        {/* Left: Frustrated requester */}
        <div className="bg-card border-2 border-destructive rounded-3xl p-8 shadow-xl animate-scale-in">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full bg-destructive/10 flex items-center justify-center">
              <Frown className="w-16 h-16 text-destructive" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-center mb-4">Need Help?</h3>
          <ul className="space-y-3 text-lg text-muted-foreground">
            <li className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
              <span>Endless searching online</span>
            </li>
            <li className="flex items-start gap-2">
              <PhoneOff className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
              <span>Nobody picks up the phone</span>
            </li>
            <li className="flex items-start gap-2">
              <Frown className="w-5 h-5 text-destructive mt-1 flex-shrink-0" />
              <span>Don't know who to trust</span>
            </li>
          </ul>
        </div>

        {/* Right: Idle provider */}
        <div className="bg-card border-2 border-warning rounded-3xl p-8 shadow-xl animate-scale-in delay-100">
          <div className="flex justify-center mb-6">
            <div className="w-32 h-32 rounded-full bg-warning/10 flex items-center justify-center">
              <Clock className="w-16 h-16 text-warning" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-center mb-4">Offering Services?</h3>
          <ul className="space-y-3 text-lg text-muted-foreground">
            <li className="flex items-start gap-2">
              <Clock className="w-5 h-5 text-warning mt-1 flex-shrink-0" />
              <span>Waiting for work</span>
            </li>
            <li className="flex items-start gap-2">
              <PhoneOff className="w-5 h-5 text-warning mt-1 flex-shrink-0" />
              <span>Missing opportunities</span>
            </li>
            <li className="flex items-start gap-2">
              <Frown className="w-5 h-5 text-warning mt-1 flex-shrink-0" />
              <span>Can't find new clients</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Problem statement */}
      <div className="bg-destructive/10 border-2 border-destructive rounded-2xl p-8 max-w-2xl animate-fade-in delay-200">
        <p className="text-3xl font-bold text-center text-destructive">
          There has to be a better way...
        </p>
      </div>
    </div>
  );
}
