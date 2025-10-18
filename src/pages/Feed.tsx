import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, MapPin, MessageSquare, Search, List, Map } from "lucide-react";
import { Link } from "react-router-dom";
import { RequestsMapView } from "@/components/RequestsMapView";

interface Request {
  id: string;
  title: string;
  description: string;
  request_type: string;
  category: string | null;
  location: string | null;
  latitude: number | null;
  longitude: number | null;
  budget_min: number | null;
  budget_max: number | null;
  status: string;
  created_at: string;
  profiles: {
    full_name: string | null;
  };
}

export default function Feed() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState("all");
  const [requests, setRequests] = useState<Request[]>([]);
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number; serviceRadius: number } | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchRequests();
    fetchUserLocation();

    // Set up realtime subscription
    const channel = supabase
      .channel('requests-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests'
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchUserLocation = async () => {
    if (!user) return;
    
    const { data } = await supabase
      .from('profiles')
      .select('latitude, longitude, service_radius')
      .eq('id', user.id)
      .single();
    
    if (data?.latitude && data?.longitude) {
      setUserLocation({
        latitude: Number(data.latitude),
        longitude: Number(data.longitude),
        serviceRadius: data.service_radius || 25
      });
    }
  };

  const fetchRequests = async () => {
    const { data, error } = await supabase
      .from('requests')
      .select(`
        id,
        title,
        description,
        request_type,
        category,
        location,
        latitude,
        longitude,
        budget_min,
        budget_max,
        status,
        created_at,
        profiles:user_id (
          full_name
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching requests:', error);
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === "all" || request.category?.toLowerCase() === categoryFilter;
    const matchesType = serviceTypeFilter === "all" || request.request_type === serviceTypeFilter;
    
    return matchesSearch && matchesCategory && matchesType;
  });

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return `${Math.floor(diffInHours / 24)}d ago`;
  };

  const categories = [
    "All Categories",
    "Personal Care",
    "Design",
    "Home Services",
    "Education",
    "Tech Support",
    "Writing",
  ];


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

      {/* Requests List and Map */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-muted-foreground">
              Showing {filteredRequests.length} active requests
            </p>
          </div>

          <Tabs defaultValue="list" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="space-y-4">
              {loading ? (
                <div className="text-center py-8">Loading requests...</div>
              ) : filteredRequests.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No requests found. Be the first to post one!</p>
                </Card>
              ) : (
                filteredRequests.map((request) => (
                  <Link key={request.id} to={`/request/${request.id}`}>
                    <Card className="hover:shadow-lg transition-all border-2 hover:border-primary/50 cursor-pointer">
                      <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <CardTitle className="mb-2 hover:text-primary transition-colors">
                              {request.title}
                            </CardTitle>
                          <CardDescription className="line-clamp-2">
                            {request.description}
                          </CardDescription>
                          <div className="flex flex-wrap gap-2 mt-3">
                            {request.category && (
                              <Badge variant="outline">{request.category}</Badge>
                            )}
                            {request.location ? (
                              <Badge variant="outline">
                                <MapPin className="h-3 w-3 mr-1" />
                                {request.location}
                              </Badge>
                            ) : (
                              <Badge variant="outline">Remote</Badge>
                            )}
                            <Badge variant={request.status === "open" ? "default" : "outline"}>
                              {request.status}
                            </Badge>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="h-4 w-4" />
                            <p className="text-sm font-medium">
                              {getTimeAgo(request.created_at)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-4 w-4" />
                            <span>Posted by {request.profiles?.full_name || "User"}</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
                ))
              )}

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
            </TabsContent>

            <TabsContent value="map">
              {loading ? (
                <div className="text-center py-8">Loading map...</div>
              ) : filteredRequests.filter(r => r.latitude && r.longitude).length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-muted-foreground">No requests with location data available for map view.</p>
                </Card>
              ) : (
                <RequestsMapView
                  requests={filteredRequests
                    .filter(r => r.latitude && r.longitude)
                    .map(r => ({
                      request_id: r.id,
                      title: r.title,
                      description: r.description,
                      category: r.category || 'Other',
                      distance_miles: 0, // Not calculated for general feed
                      budget_min: r.budget_min,
                      budget_max: r.budget_max,
                      latitude: r.latitude!,
                      longitude: r.longitude!,
                    }))}
                  providerLatitude={userLocation?.latitude || filteredRequests.find(r => r.latitude)?.latitude || 40.7128}
                  providerLongitude={userLocation?.longitude || filteredRequests.find(r => r.longitude)?.longitude || -74.0060}
                  serviceRadius={userLocation?.serviceRadius || 25}
                />
              )}
            </TabsContent>
          </Tabs>
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
