import { Star, CheckCircle, Shield, Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function ProposalsComparison() {
  const proposals = [
    {
      name: "Mike Johnson",
      avatar: "/placeholder.svg",
      price: 150,
      rating: 4.9,
      reviews: 127,
      verified: true,
      badge: "Top Rated",
      response: "I can come today at 2pm. Have all tools ready.",
      specialty: "Plumbing Expert",
    },
    {
      name: "Sarah Chen",
      avatar: "/placeholder.svg",
      price: 175,
      rating: 5.0,
      reviews: 203,
      verified: true,
      badge: "Elite Pro",
      response: "Available within 1 hour. 10 years experience.",
      specialty: "Master Plumber",
    },
    {
      name: "David Martinez",
      avatar: "/placeholder.svg",
      price: 200,
      rating: 4.8,
      reviews: 89,
      verified: true,
      badge: "Certified",
      response: "Same day service. Licensed and insured.",
      specialty: "Licensed Plumber",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <h2 className="text-5xl font-bold text-foreground mb-4">
          Compare Verified Professionals
        </h2>
        <p className="text-2xl text-muted-foreground">
          Choose the perfect match for your needs
        </p>
      </div>

      {/* Proposals stack */}
      <div className="w-full max-w-2xl space-y-6 mb-8">
        {proposals.map((proposal, index) => (
          <Card
            key={index}
            className={`p-8 animate-scale-in border-2 ${
              index === 1 ? 'border-primary shadow-2xl scale-105' : ''
            }`}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Badge */}
            {index === 1 && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-6 py-2 rounded-full font-bold shadow-lg flex items-center gap-2 animate-pulse">
                <Award className="w-5 h-5" />
                RECOMMENDED
              </div>
            )}

            <div className="flex items-start gap-6">
              {/* Avatar */}
              <Avatar className="w-24 h-24 border-4 border-primary">
                <AvatarImage src={proposal.avatar} />
                <AvatarFallback className="text-2xl font-bold bg-primary text-white">
                  {proposal.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              {/* Info */}
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-2xl font-bold">{proposal.name}</h3>
                      {proposal.verified && (
                        <CheckCircle className="w-6 h-6 text-success" />
                      )}
                    </div>
                    <p className="text-base text-muted-foreground mb-2">{proposal.specialty}</p>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < Math.floor(proposal.rating)
                              ? 'text-warning fill-warning'
                              : 'text-muted'
                          }`}
                        />
                      ))}
                      <span className="text-lg font-semibold ml-2">{proposal.rating}</span>
                      <span className="text-base text-muted-foreground">({proposal.reviews} reviews)</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="text-right">
                    <div className="text-4xl font-bold text-success">${proposal.price}</div>
                    <div className="text-sm text-muted-foreground">Fixed price</div>
                  </div>
                </div>

                {/* Badge */}
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-primary" />
                  <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-semibold">
                    {proposal.badge}
                  </span>
                </div>

                {/* Response */}
                <div className="bg-muted rounded-xl p-4 mb-4">
                  <p className="text-base italic">"{proposal.response}"</p>
                </div>

                {/* Action buttons */}
                <div className="flex gap-3">
                  <button className="flex-1 bg-primary text-white rounded-xl py-3 font-bold text-lg hover:opacity-90 transition-opacity">
                    Select Provider
                  </button>
                  <button className="px-6 bg-muted text-foreground rounded-xl py-3 font-bold text-lg hover:bg-muted/80 transition-colors">
                    Chat
                  </button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Swipe indicator */}
      <div className="flex items-center gap-3 text-muted-foreground animate-fade-in delay-300">
        <div className="text-3xl">👆</div>
        <p className="text-xl">Swipe to compare all proposals</p>
      </div>
    </div>
  );
}
