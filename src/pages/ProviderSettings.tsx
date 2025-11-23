import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Loader2, Wrench } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ServiceSelector } from "@/components/ServiceSelector";

export default function ProviderSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [location, setLocation] = useState("");
  const [serviceRadius, setServiceRadius] = useState(25);
  const [isGeocoding, setIsGeocoding] = useState(false);

  // Fetch profile
  const { data: profile } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Fetch specialties
  const { data: specialties } = useQuery({
    queryKey: ['specialties', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('provider_specialties')
        .select('*')
        .eq('provider_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  // Initialize form values
  useEffect(() => {
    if (profile) {
      setLocation(profile.location || "");
      setServiceRadius(profile.service_radius || 25);
    }
  }, [profile]);

  // Update location mutation
  const updateLocationMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id || !location.trim()) throw new Error('Location is required');
      
      setIsGeocoding(true);
      
      // Geocode the location
      const { data: geocodeData, error: geocodeError } = await supabase.functions.invoke('geocode-location', {
        body: { location: location.trim() }
      });

      if (geocodeError) throw geocodeError;
      if (!geocodeData) throw new Error('Failed to geocode location');

      // Update profile with location and coordinates
      const { error } = await supabase
        .from('profiles')
        .update({
          location: location.trim(),
          latitude: geocodeData.latitude,
          longitude: geocodeData.longitude,
          service_radius: serviceRadius,
        })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: "Location updated",
        description: "Your service area has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update location",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGeocoding(false);
    },
  });

  // Update service radius mutation
  const updateRadiusMutation = useMutation({
    mutationFn: async (radius: number) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      const { error } = await supabase
        .from('profiles')
        .update({ service_radius: radius })
        .eq('id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: "Service radius updated",
        description: `Your service radius is now ${serviceRadius} miles.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update service radius",
        variant: "destructive",
      });
    },
  });

  // Update specialties mutation
  const updateSpecialtiesMutation = useMutation({
    mutationFn: async (services: string[]) => {
      if (!user?.id) throw new Error('Not authenticated');
      
      // Delete all existing specialties
      const { error: deleteError } = await supabase
        .from('provider_specialties')
        .delete()
        .eq('provider_id', user.id);
      
      if (deleteError) throw deleteError;

      // Insert new specialties
      if (services.length > 0) {
        const { error: insertError } = await supabase
          .from('provider_specialties')
          .insert(
            services.map((service) => ({
              provider_id: user.id,
              category: service,
            }))
          );
        
        if (insertError) throw insertError;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['specialties', user?.id] });
      toast({
        title: "Specialties updated",
        description: "Your service specialties have been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update specialties",
        variant: "destructive",
      });
    },
  });

  const selectedServices = specialties?.map((s) => s.category) || [];

  const handleServicesChange = (services: string[]) => {
    if (services.length > 6) {
      toast({
        title: "Maximum reached",
        description: "You can select up to 6 services",
        variant: "destructive",
      });
      return;
    }
    updateSpecialtiesMutation.mutate(services);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Provider Settings</h1>

      <div className="space-y-6">
        {/* Service Area */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5" />
              Service Area
            </CardTitle>
            <CardDescription>
              Set your location and service radius to receive relevant requests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                placeholder="e.g., Brooklyn, NY"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Enter your city and state
              </p>
            </div>

            <div className="space-y-3">
              <Label>Service Radius: {serviceRadius} miles</Label>
              <Slider
                value={[serviceRadius]}
                onValueChange={(value) => setServiceRadius(value[0])}
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
              <p className="text-xs text-muted-foreground">
                How far are you willing to travel for jobs?
              </p>
            </div>

            <Button 
              onClick={() => {
                updateLocationMutation.mutate();
                updateRadiusMutation.mutate(serviceRadius);
              }}
              disabled={isGeocoding || !location.trim()}
              className="w-full"
            >
              {isGeocoding ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Save Service Area'
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Specialties */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wrench className="w-5 h-5" />
              Service Specialties
            </CardTitle>
            <CardDescription>
              Select up to 6 service categories to match with relevant requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ServiceSelector
              selectedServices={selectedServices}
              onServicesChange={handleServicesChange}
              maxServices={6}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
