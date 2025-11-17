import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, MessageCircle, Flag } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ReportDialog } from "@/components/ReportDialog";
import { useAuth } from "@/contexts/AuthContext";

interface PortfolioItem {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

interface UserProfile {
  id: string;
  username: string | null;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  is_verified: boolean | null;
  created_at: string;
}

export default function PublicProfile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Fetch user profile by username
  const { data: profile, isLoading } = useQuery<UserProfile | null>({
    queryKey: ['public-profile', username],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url, bio, location, is_verified, created_at')
        .ilike('username', username || '')
        .maybeSingle();
      
      if (error) throw error;
      return data as UserProfile | null;
    },
    enabled: !!username,
  });

  // Fetch user's public portfolio items
  const portfolioQuery = useQuery({
    queryKey: ['user-portfolio', profile?.id],
    queryFn: async () => {
      if (!profile?.id) return [];
      
      // @ts-ignore - TypeScript inference issue with Supabase query builder
      const { data, error } = await supabase
        .from('portfolio_items')
        .select('id, title, description, image_url, created_at')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as PortfolioItem[];
    },
    enabled: !!profile?.id,
  });
  
  const portfolioItems = portfolioQuery.data || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">User not found</h2>
          <p className="text-muted-foreground mb-4">@{username} doesn't exist</p>
          <Button onClick={() => navigate('/feed')}>Back to Feed</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface pb-6">
      {/* Header */}
      <div className="bg-white border-b border-border sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-xl"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-lg font-semibold text-foreground">Profile</h1>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Card */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center space-y-4">
              <Avatar className="w-24 h-24 border-4 border-accent">
                <AvatarImage src={profile.avatar_url || undefined} />
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {profile.full_name?.[0]?.toUpperCase() || profile.username?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>

              <div>
                <div className="flex items-center gap-2 justify-center mb-1">
                  <h2 className="text-2xl font-bold text-foreground">
                    {profile.full_name || `@${profile.username}`}
                  </h2>
                  {profile.is_verified && (
                    <Badge variant="default" className="bg-verified">
                      ✓ Verified
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              {profile.bio && (
                <p className="text-sm text-muted-foreground max-w-md">
                  {profile.bio}
                </p>
              )}

              {profile.location && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{profile.location}</span>
                </div>
              )}

              <div className="flex gap-2 w-full">
                <Button 
                  className="flex-1"
                  onClick={() => navigate(`/messages/${profile.id}`)}
                >
                  <MessageCircle className="w-4 h-4 mr-2" />
                  Send Message
                </Button>
                {user?.id && user.id !== profile.id && (
                  <ReportDialog 
                    reportedUserId={profile.id}
                    triggerButton={
                      <Button variant="outline" size="icon">
                        <Flag className="w-4 h-4" />
                      </Button>
                    }
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Portfolio Section */}
        {portfolioItems && portfolioItems.length > 0 && (
          <div>
            <h3 className="text-xl font-semibold mb-4 px-1">Portfolio</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {portfolioItems.map((item) => (
                <Card key={item.id} className="overflow-hidden">
                  {item.image_url && (
                    <img 
                      src={item.image_url} 
                      alt={item.title}
                      className="w-full h-48 object-cover"
                    />
                  )}
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-foreground mb-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {(!portfolioItems || portfolioItems.length === 0) && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground">No portfolio items yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
