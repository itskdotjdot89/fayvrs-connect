import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, DollarSign, Clock, List, Map } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { RequestsMapView } from "./RequestsMapView";

export const NearbyRequestsWidget = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'map'>('list');

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("latitude, longitude, current_latitude, current_longitude, service_radius")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: nearbyRequests, isLoading } = useQuery({
    queryKey: ["nearby-requests", profile?.latitude, profile?.longitude, profile?.service_radius],
    queryFn: async () => {
      if (!profile?.latitude || !profile?.longitude) return [];

      const { data, error } = await supabase.rpc("find_nearby_requests", {
        provider_latitude: profile.latitude,
        provider_longitude: profile.longitude,
        radius_miles: profile.service_radius || 25,
      });

      if (error) throw error;
      return data;
    },
    enabled: !!profile?.latitude && !!profile?.longitude,
  });

  if (!profile?.latitude || !profile?.longitude) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nearby Requests</CardTitle>
          <CardDescription>
            Set your location in settings to see requests in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/provider-settings")}>
            Configure Location
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nearby Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading nearby requests...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nearby Requests</CardTitle>
        <CardDescription>
          {nearbyRequests?.length || 0} open request(s) within {profile.service_radius} miles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!nearbyRequests || nearbyRequests.length === 0 ? (
          <p className="text-muted-foreground">No nearby requests at the moment.</p>
        ) : (
          <Tabs value={view} onValueChange={(v) => setView(v as 'list' | 'map')} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                List View
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Map View
              </TabsTrigger>
            </TabsList>

            <TabsContent value="list" className="mt-0">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {nearbyRequests.map((request: any) => (
                  <div
                    key={request.request_id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-semibold">{request.title}</h4>
                        <Badge variant="secondary" className="mt-1">
                          {request.category}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{request.distance_miles?.toFixed(1)} mi</span>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                      {request.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        {request.budget_min && request.budget_max && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>
                              ${request.budget_min}-${request.budget_max}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}</span>
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => navigate(`/request/${request.request_id}`)}
                      >
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <RequestsMapView
                requests={nearbyRequests}
                providerLatitude={profile.latitude}
                providerLongitude={profile.longitude}
                currentLatitude={profile.current_latitude}
                currentLongitude={profile.current_longitude}
                serviceRadius={profile.service_radius}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
