import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { MapPin, Globe, Bell, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function PostRequest() {
  const navigate = useNavigate();
  const [localized, setLocalized] = useState(true);
  const [smsAddon, setSmsAddon] = useState(false);
  const [promptText, setPromptText] = useState("");

  const exampleChips = [
    "I need a barber who can cut my hair tonight in Orlando",
    "Looking for a logo designer for my startup",
    "Need a plumber to fix a leaky faucet ASAP",
    "Seeking a tutor for calculus online",
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Will integrate with backend later
    console.log({ promptText, localized, smsAddon });
    navigate("/feed");
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-to-b from-accent/30 to-background py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <div className="text-center mb-8">
          <Badge className="mb-4">
            <Sparkles className="h-3 w-3 mr-1" />
            Free to Post
          </Badge>
          <h1 className="text-4xl font-bold mb-4 text-secondary">
            What do you need done today?
          </h1>
          <p className="text-lg text-muted-foreground">
            Describe your request in your own words. We'll match you with verified providers.
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Post Your Request</CardTitle>
            <CardDescription>
              Your request will be live for 72 hours. Verified providers will reply with pricing and availability.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Main Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Describe what you need</Label>
                <Textarea
                  id="prompt"
                  placeholder="e.g., I need a barber who can cut my hair tonight in Orlando..."
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  className="min-h-32 text-base"
                />
                <p className="text-xs text-muted-foreground">
                  Be specific about timing, location (if relevant), and what you're looking for
                </p>
              </div>

              {/* Example Chips */}
              <div className="space-y-2">
                <Label className="text-sm">Need inspiration? Try these:</Label>
                <div className="flex flex-wrap gap-2">
                  {exampleChips.map((example, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setPromptText(example)}
                      className="text-xs px-3 py-1 bg-accent hover:bg-accent/80 rounded-full transition-colors"
                    >
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Service Type Toggle */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {localized ? (
                      <MapPin className="h-5 w-5 text-primary" />
                    ) : (
                      <Globe className="h-5 w-5 text-primary" />
                    )}
                    <div>
                      <Label htmlFor="localized" className="font-semibold">
                        {localized ? "In-Person Service" : "Remote Service"}
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        {localized 
                          ? "For services that require physical presence" 
                          : "For digital, design, coaching, or remote work"}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="localized"
                    checked={localized}
                    onCheckedChange={setLocalized}
                  />
                </div>

                {localized && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="location">Location</Label>
                    <div className="flex gap-2">
                      <Input 
                        id="location" 
                        placeholder="Enter city, ZIP, or address"
                        className="flex-1"
                      />
                      <Button type="button" variant="outline" size="icon">
                        <MapPin className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* SMS Add-On */}
              <div className="space-y-4 p-4 bg-muted/50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bell className="h-5 w-5 text-primary" />
                    <div>
                      <Label htmlFor="sms" className="font-semibold">
                        SMS Notifications
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Get text alerts when providers reply (+$2)
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="sms"
                    checked={smsAddon}
                    onCheckedChange={setSmsAddon}
                  />
                </div>

                {smsAddon && (
                  <div className="space-y-2 pt-2 border-t">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input 
                      id="phone" 
                      type="tel"
                      placeholder="+1 (555) 123-4567"
                    />
                    <p className="text-xs text-muted-foreground">
                      You'll receive: first reply alert, batched updates, and 12-hour reminder
                    </p>
                  </div>
                )}
              </div>

              {/* Preview Summary */}
              <div className="p-4 bg-accent rounded-lg">
                <h3 className="font-semibold mb-2">Request Summary</h3>
                <ul className="space-y-1 text-sm">
                  <li>✓ Active for 72 hours</li>
                  <li>✓ Visible to verified providers only</li>
                  <li>✓ In-app messaging included</li>
                  <li>✓ No fees to post or receive responses</li>
                  {smsAddon && <li>✓ SMS notifications: $2.00</li>}
                </ul>
                <div className="mt-3 pt-3 border-t border-primary/20">
                  <p className="font-semibold">
                    Total Cost: {smsAddon ? "$2.00" : "FREE"}
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button type="submit" size="lg" className="w-full">
                Post Request
              </Button>

              <p className="text-xs text-center text-muted-foreground">
                By posting, you agree to our Terms of Service and Privacy Policy.
                You must be verified to post requests.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
