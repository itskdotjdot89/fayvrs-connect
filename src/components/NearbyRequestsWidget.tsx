import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapPin, DollarSign, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";

export const NearbyRequestsWidget = () => {
  const navigate = useNavigate();

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("profiles")
        .select("latitude, longitude, service_radius")
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
        )}
      </CardContent>
    </Card>
  );
};
