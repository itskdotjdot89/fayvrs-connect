import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MapPin, List, Map, CheckCircle2, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ProvidersMapView } from "./ProvidersMapView";

export const NearbyProvidersWidget = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<'list' | 'map'>('list');
  const [searchRadius, setSearchRadius] = useState(25);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("latitude, longitude, current_latitude, current_longitude")
        .eq("id", user.id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const { data: nearbyProviders, isLoading } = useQuery({
    queryKey: ["nearby-providers", profile?.latitude, profile?.longitude, searchRadius],
    queryFn: async () => {
      if (!profile?.latitude || !profile?.longitude) return [];

      const { data, error } = await supabase.rpc("find_nearby_providers", {
        req_latitude: profile.latitude,
        req_longitude: profile.longitude,
        radius_miles: searchRadius,
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
          <CardTitle>Nearby Providers</CardTitle>
          <CardDescription>
            Set your location in settings to discover providers in your area
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate("/settings")}>
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
          <CardTitle>Nearby Providers</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Loading nearby providers...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nearby Providers</CardTitle>
        <CardDescription>
          {nearbyProviders?.length || 0} provider(s) within {searchRadius} miles
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!nearbyProviders || nearbyProviders.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
            <p className="text-muted-foreground mb-2">No providers found in your area.</p>
            <p className="text-sm text-muted-foreground">Try expanding your search radius or post a request to notify providers.</p>
            <Button 
              className="mt-4" 
              onClick={() => navigate("/post-request")}
            >
              Post a Request
            </Button>
          </div>
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
                {nearbyProviders.map((provider: any) => (
                  <div
                    key={provider.provider_id}
                    className="border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                    onClick={() => navigate(`/portfolio/${provider.provider_id}`)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-semibold">{provider.provider_name}</h4>
                          {provider.is_verified && (
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                          )}
                        </div>
                        {provider.specialties?.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {provider.specialties.slice(0, 3).map((specialty: string, idx: number) => (
                              <Badge key={idx} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>{provider.distance_miles?.toFixed(1)} mi</span>
                      </div>
                    </div>

                    {provider.provider_bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {provider.provider_bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      {provider.provider_location && (
                        <span>{provider.provider_location}</span>
                      )}
                      <span>Service radius: {provider.service_radius} miles</span>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="map" className="mt-0">
              <ProvidersMapView
                providers={nearbyProviders}
                requesterLatitude={profile.latitude}
                requesterLongitude={profile.longitude}
                currentLatitude={profile.current_latitude}
                currentLongitude={profile.current_longitude}
                searchRadius={searchRadius}
              />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};
