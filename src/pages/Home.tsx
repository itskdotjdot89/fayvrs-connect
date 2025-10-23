import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Shield, Clock, MessageSquare, MapPin, Sparkles } from "lucide-react";
import heroImage from "@/assets/hero-marketplace.jpg";

export default function Home() {
  // Demo feed data (obfuscated for guests)
  const demoRequests = [
    {
      id: 1,
      title: "Barber needed tonight in Orlando",
      category: "Personal Care",
      localized: true,
      location: "Orlando, FL",
      timeLeft: "48h",
      replies: 5,
      blurred: true,
    },
    {
      id: 2,
      title: "Logo design for new startup",
      category: "Design",
      localized: false,
      timeLeft: "65h",
      replies: 12,
      blurred: true,
    },
    {
      id: 3,
      title: "Plumbing repair needed ASAP",
      category: "Home Services",
      localized: true,
      location: "Miami, FL",
      timeLeft: "24h",
      replies: 3,
      blurred: true,
    },
  ];

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-accent/30 to-background overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={heroImage} 
            alt="Diverse professionals collaborating" 
            className="w-full h-full object-cover opacity-10"
          />
        </div>
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <div className="max-w-3xl mx-auto text-center">
            <Badge className="mb-4">
              <Sparkles className="h-3 w-3 mr-1" />
              No Customer Fees
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-secondary">
              Direct Connections for Freelance & Local Services
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Post your request and connect directly with verified providers. 
              No middleman, no customer fees, just straightforward connections.
            </p>
            <div className="flex justify-center">
              <Link to="/auth">
                <Button size="lg" className="w-full sm:w-auto">
                  Sign In / Sign Up
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader>
                <CheckCircle2 className="h-10 w-10 text-primary mb-2" />
                <CardTitle>Verified Providers Only</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  All service providers pass identity verification before they can respond to requests or receive contact details.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader>
                <Clock className="h-10 w-10 text-primary mb-2" />
                <CardTitle>72-Hour Active Requests</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Requests stay live for 72 hours, giving you time to review responses and select the best provider for your needs.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-all">
              <CardHeader>
                <MessageSquare className="h-10 w-10 text-primary mb-2" />
                <CardTitle>In-App Messaging</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Chat securely with providers before making your choice. Contact info is revealed only when you select a provider.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Feed Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">
                See What People Are Requesting
              </h2>
              <p className="text-muted-foreground">
                Browse a sample of active requests. Sign up to view full details and connect with providers.
              </p>
            </div>

            <div className="space-y-4">
              {demoRequests.map((request) => (
                <Card key={request.id} className="relative overflow-hidden">
                  {/* Blur overlay for demo */}
                  <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/80 to-background/60 backdrop-blur-sm z-10 flex items-center justify-center">
                    <div className="text-center">
                      <Shield className="h-12 w-12 text-primary mx-auto mb-2" />
                      <p className="font-semibold mb-2">Demo Mode</p>
                      <p className="text-sm text-muted-foreground mb-4">Sign up to view full details</p>
                      <Link to="/auth">
                        <Button size="sm">Create Account</Button>
                      </Link>
                    </div>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <CardTitle className="mb-2">{request.title}</CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <Badge variant="outline">{request.category}</Badge>
                          {request.localized && (
                            <Badge variant="outline">
                              <MapPin className="h-3 w-3 mr-1" />
                              {request.location}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Expires in</p>
                        <p className="text-lg font-semibold text-primary">{request.timeLeft}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{request.replies} providers replied</span>
                      <span>•</span>
                      <span>{request.localized ? 'In-person service' : 'Remote service'}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-8">
              <Link to="/feed">
                <Button variant="outline" size="lg">
                  View All Requests
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center text-secondary">
              How It Works
            </h2>
            <div className="grid md:grid-cols-2 gap-12">
              {/* For Customers */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">For Customers</h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">1</span>
                    <div>
                      <p className="font-medium">Post Your Request</p>
                      <p className="text-sm text-muted-foreground">Describe what you need in your own words</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">2</span>
                    <div>
                      <p className="font-medium">Review Responses</p>
                      <p className="text-sm text-muted-foreground">Verified providers reply with pricing and availability</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold">3</span>
                    <div>
                      <p className="font-medium">Select & Connect</p>
                      <p className="text-sm text-muted-foreground">Choose your provider and get their contact details</p>
                    </div>
                  </li>
                </ol>
              </div>

              {/* For Providers */}
              <div>
                <h3 className="text-xl font-semibold mb-4 text-primary">For Providers</h3>
                <ol className="space-y-4">
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-semibold">1</span>
                    <div>
                      <p className="font-medium">Subscribe & Verify</p>
                      <p className="text-sm text-muted-foreground">$30/month or $240/year, pass identity check</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-semibold">2</span>
                    <div>
                      <p className="font-medium">Receive Matching Leads</p>
                      <p className="text-sm text-muted-foreground">Get notified of relevant requests in your area</p>
                    </div>
                  </li>
                  <li className="flex gap-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-secondary text-secondary-foreground rounded-full flex items-center justify-center font-semibold">3</span>
                    <div>
                      <p className="font-medium">Win Work Directly</p>
                      <p className="text-sm text-muted-foreground">Reply with your offer, chat, and connect</p>
                    </div>
                  </li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-secondary">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join Fayvrs today and experience direct connections without the fees.
          </p>
          <div className="flex justify-center">
            <Link to="/auth">
              <Button size="lg" className="w-full sm:w-auto">
                Sign In / Sign Up
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
