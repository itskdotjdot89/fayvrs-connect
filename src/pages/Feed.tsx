import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Clock, MapPin, MessageSquare, Search, Filter } from "lucide-react";
import { Link } from "react-router-dom";

export default function Feed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");

  // Mock data for requests
  const requests = [
    {
      id: 1,
      title: "Barber needed tonight in Orlando",
      description: "Looking for a skilled barber who can do a fade haircut. Available after 6 PM tonight.",
      category: "Personal Care",
      localized: true,
      location: "Orlando, FL",
      radius: "10 miles",
      timeLeft: "48h",
      expiresAt: "2025-01-15T18:00:00",
      replies: 5,
      status: "open",
    },
    {
      id: 2,
      title: "Logo design for new tech startup",
      description: "Need a modern, minimalist logo for a SaaS company. Looking for someone with experience in tech branding.",
      category: "Design",
      localized: false,
      timeLeft: "65h",
      expiresAt: "2025-01-16T11:00:00",
      replies: 12,
      status: "open",
    },
    {
      id: 3,
      title: "Plumbing repair needed ASAP",
      description: "Kitchen sink has a major leak. Need someone who can come today if possible.",
      category: "Home Services",
      localized: true,
      location: "Miami, FL",
      radius: "15 miles",
      timeLeft: "24h",
      expiresAt: "2025-01-14T15:00:00",
      replies: 3,
      status: "open",
    },
    {
      id: 4,
      title: "Spanish tutor for conversational practice",
      description: "Looking for a native Spanish speaker to help with conversational practice. 2-3 sessions per week via video call.",
      category: "Education",
      localized: false,
      timeLeft: "55h",
      expiresAt: "2025-01-16T01:00:00",
      replies: 8,
      status: "open",
    },
    {
      id: 5,
      title: "House cleaning service this weekend",
      description: "Need a thorough deep clean of 3-bedroom house. Saturday or Sunday preferred.",
      category: "Home Services",
      localized: true,
      location: "Tampa, FL",
      radius: "20 miles",
      timeLeft: "71h",
      expiresAt: "2025-01-17T08:00:00",
      replies: 6,
      status: "open",
    },
  ];

  const categories = [
    "All Categories",
    "Personal Care",
    "Design",
    "Home Services",
    "Education",
    "Tech Support",
    "Writing",
  ];

  const getTimeLeftColor = (timeLeft: string) => {
    const hours = parseInt(timeLeft);
    if (hours < 24) return "text-destructive";
    if (hours < 48) return "text-pending";
    return "text-primary";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-background">
      <div className="bg-gradient-to-b from-accent/30 to-background py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center mb-8">
            <h1 className="text-4xl font-bold mb-4 text-secondary">
              Browse Active Requests
            </h1>
            <p className="text-lg text-muted-foreground">
              Find requests that match your skills. All shown requests are from verified users.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="max-w-4xl mx-auto">
            <Card className="border-2">
              <CardContent className="pt-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search requests..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.slice(1).map((cat) => (
                        <SelectItem key={cat} value={cat.toLowerCase()}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={serviceTypeFilter} onValueChange={setServiceTypeFilter}>
                    <SelectTrigger className="w-full md:w-48">
                      <SelectValue placeholder="Service Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="localized">In-Person</SelectItem>
                      <SelectItem value="remote">Remote</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {requests.length} active requests
            </p>
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              More Filters
            </Button>
          </div>

          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-lg transition-all border-2 hover:border-primary/50">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="mb-2 hover:text-primary transition-colors">
                        <Link to={`/request/${request.id}`}>
                          {request.title}
                        </Link>
                      </CardTitle>
                      <CardDescription className="line-clamp-2">
                        {request.description}
                      </CardDescription>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge variant="outline">{request.category}</Badge>
                        {request.localized ? (
                          <Badge variant="outline">
                            <MapPin className="h-3 w-3 mr-1" />
                            {request.location} • {request.radius}
                          </Badge>
                        ) : (
                          <Badge variant="outline">Remote</Badge>
                        )}
                        <Badge variant={request.status === "open" ? "default" : "outline"}>
                          {request.status === "open" ? "Open" : "Closed"}
                        </Badge>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-1 mb-1">
                        <Clock className={`h-4 w-4 ${getTimeLeftColor(request.timeLeft)}`} />
                        <p className={`text-sm font-medium ${getTimeLeftColor(request.timeLeft)}`}>
                          {request.timeLeft}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground">remaining</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MessageSquare className="h-4 w-4" />
                        <span>{request.replies} providers replied</span>
                      </div>
                    </div>
                    <Link to={`/request/${request.id}`}>
                      <Button size="sm">View Details</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="mt-8 flex justify-center">
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="default" size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <Button variant="outline" size="sm">Next</Button>
            </div>
          </div>
        </div>
      </div>

      {/* CTA for posting */}
      <div className="container mx-auto px-4 pb-12">
        <Card className="max-w-4xl mx-auto bg-gradient-to-r from-primary/10 to-primary/5 border-2 border-primary/20">
          <CardContent className="py-8 text-center">
            <h3 className="text-2xl font-bold mb-2">Have a request of your own?</h3>
            <p className="text-muted-foreground mb-4">Post it now and get responses from verified providers</p>
            <Link to="/post-request">
              <Button size="lg">Post a Request</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
