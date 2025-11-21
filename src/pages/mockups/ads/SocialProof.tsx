import { Star, Users, Briefcase, TrendingUp, Quote } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SocialProof() {
  const testimonials = [
    {
      name: "Emily Rodriguez",
      role: "Requester",
      avatar: "/placeholder.svg",
      quote: "Found a plumber in 10 minutes! Way better than calling around for hours.",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Provider",
      avatar: "/placeholder.svg",
      quote: "Made $300 this week just from Fayvrs. Game changer for my business!",
      rating: 5,
    },
    {
      name: "Sarah Chen",
      role: "Requester",
      avatar: "/placeholder.svg",
      quote: "So much easier than other apps. Love the video call feature!",
      rating: 5,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 flex flex-col items-center justify-center p-6">
      {/* Header */}
      <div className="text-center mb-12 animate-fade-in">
        <h2 className="text-5xl font-bold text-foreground mb-4">
          Join Thousands of Happy Users
        </h2>
        <p className="text-2xl text-muted-foreground">
          Real people, real results
        </p>
      </div>

      {/* Platform stats */}
      <div className="grid grid-cols-4 gap-8 w-full max-w-5xl mb-16">
        <Card className="p-8 text-center animate-scale-in border-2 border-primary">
          <Users className="w-12 h-12 text-primary mx-auto mb-4" />
          <div className="text-6xl font-bold text-primary mb-2">10K+</div>
          <div className="text-lg text-muted-foreground">Active Users</div>
        </Card>
        <Card className="p-8 text-center animate-scale-in delay-100 border-2 border-success">
          <Briefcase className="w-12 h-12 text-success mx-auto mb-4" />
          <div className="text-6xl font-bold text-success mb-2">50K+</div>
          <div className="text-lg text-muted-foreground">Jobs Completed</div>
        </Card>
        <Card className="p-8 text-center animate-scale-in delay-200 border-2 border-warning">
          <Star className="w-12 h-12 text-warning mx-auto mb-4" />
          <div className="text-6xl font-bold text-warning mb-2">4.9</div>
          <div className="text-lg text-muted-foreground">Average Rating</div>
        </Card>
        <Card className="p-8 text-center animate-scale-in delay-300 border-2 border-primary">
          <TrendingUp className="w-12 h-12 text-primary mx-auto mb-4" />
          <div className="text-6xl font-bold text-primary mb-2">95%</div>
          <div className="text-lg text-muted-foreground">Success Rate</div>
        </Card>
      </div>

      {/* Testimonials carousel */}
      <div className="w-full max-w-5xl space-y-6 mb-16">
        {testimonials.map((testimonial, index) => (
          <Card
            key={index}
            className="p-8 animate-scale-in border-2"
            style={{ animationDelay: `${(index + 4) * 100}ms` }}
          >
            <div className="flex items-start gap-6">
              {/* Quote icon */}
              <div className="flex-shrink-0">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Quote className="w-8 h-8 text-primary" />
                </div>
              </div>

              {/* Content */}
              <div className="flex-1">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-6 h-6 text-warning fill-warning"
                    />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-2xl font-medium mb-6 italic">
                  "{testimonial.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14 border-2 border-primary">
                    <AvatarImage src={testimonial.avatar} />
                    <AvatarFallback className="bg-primary text-white text-lg font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h4 className="text-xl font-bold">{testimonial.name}</h4>
                    <p className="text-base text-muted-foreground">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* More stats grid */}
      <div className="w-full max-w-5xl grid grid-cols-3 gap-8 mb-12 animate-fade-in delay-700">
        <div className="text-center">
          <div className="text-7xl mb-4">🚀</div>
          <div className="text-4xl font-bold text-primary mb-2">2x</div>
          <p className="text-lg text-muted-foreground">
            Faster than competitors
          </p>
        </div>
        <div className="text-center">
          <div className="text-7xl mb-4">💰</div>
          <div className="text-4xl font-bold text-success mb-2">$2M+</div>
          <p className="text-lg text-muted-foreground">
            Paid to providers
          </p>
        </div>
        <div className="text-center">
          <div className="text-7xl mb-4">⭐</div>
          <div className="text-4xl font-bold text-warning mb-2">98%</div>
          <p className="text-lg text-muted-foreground">
            Would recommend
          </p>
        </div>
      </div>

      {/* Featured in */}
      <Card className="w-full max-w-4xl p-8 bg-muted animate-fade-in delay-800">
        <h3 className="text-2xl font-bold text-center mb-6">
          Featured In
        </h3>
        <div className="grid grid-cols-4 gap-8 items-center">
          <div className="text-center text-3xl font-bold text-muted-foreground">
            TechCrunch
          </div>
          <div className="text-center text-3xl font-bold text-muted-foreground">
            Forbes
          </div>
          <div className="text-center text-3xl font-bold text-muted-foreground">
            Wired
          </div>
          <div className="text-center text-3xl font-bold text-muted-foreground">
            Fast Company
          </div>
        </div>
      </Card>

      {/* Bottom CTA */}
      <div className="mt-12 text-center animate-fade-in delay-900">
        <p className="text-4xl font-bold text-foreground mb-2">
          Be Part of the Community
        </p>
        <p className="text-xl text-muted-foreground">
          10,000+ users can't be wrong
        </p>
      </div>
    </div>
  );
}
