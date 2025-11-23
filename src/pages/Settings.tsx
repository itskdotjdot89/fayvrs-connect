import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Upload, Loader2, User, Bell, Mail, MessageSquare, AtSign, CheckCircle2 } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import VerificationStatus from "@/components/VerificationStatus";
import { Link } from "react-router-dom";

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [username, setUsername] = useState("");
  const [usernameError, setUsernameError] = useState("");

  // Fetch notification preferences
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    enabled: !!user?.id,
  });

  // Create default preferences if none exist
  useEffect(() => {
    const createDefaultPreferences = async () => {
      if (user?.id && preferences === null) {
        const { error } = await supabase
          .from('notification_preferences')
          .insert({
            user_id: user.id,
            push_enabled: true,
            email_enabled: true,
            sms_enabled: false,
            in_app_enabled: true,
          });
        
        if (!error) {
          queryClient.invalidateQueries({ queryKey: ['notification-preferences', user.id] });
        }
      }
    };
    
    createDefaultPreferences();
  }, [user?.id, preferences, queryClient]);

  // Fetch user profile
  // Update notification preferences mutation
  const updatePreferencesMutation = useMutation({
    mutationFn: async (updates: Partial<{ push_enabled: boolean; email_enabled: boolean; sms_enabled: boolean; in_app_enabled: boolean }>) => {
      if (!user?.id) throw new Error('No user found');
      
      const { error } = await supabase
        .from('notification_preferences')
        .update(updates)
        .eq('user_id', user.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences', user?.id] });
      toast({
        title: "Preferences updated",
        description: "Your notification preferences have been saved.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update preferences. Please try again.",
        variant: "destructive",
      });
      console.error('Error updating preferences:', error);
    },
  });

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

  // Update local username when profile loads
  useEffect(() => {
    if (profile?.username) {
      setUsername(profile.username);
    }
  }, [profile?.username]);

  // Update username mutation
  const updateUsernameMutation = useMutation({
    mutationFn: async (newUsername: string) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
      if (!usernameRegex.test(newUsername)) {
        throw new Error('Username must be 3-20 characters and contain only letters, numbers, and underscores');
      }

      // Check if username is available (case-insensitive)
      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .ilike('username', newUsername)
        .neq('id', user.id)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Username is already taken');
      }

      // Update username
      const { error } = await supabase
        .from('profiles')
        .update({ username: newUsername })
        .eq('id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      setUsernameError("");
      toast({
        title: "Success",
        description: "Username updated successfully",
      });
    },
    onError: (error: Error) => {
      setUsernameError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUsernameSubmit = () => {
    if (!username.trim()) {
      setUsernameError("Username cannot be empty");
      return;
    }
    updateUsernameMutation.mutate(username.trim());
  };

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!user?.id) throw new Error('Not authenticated');

      // Delete old avatar if exists
      if (profile?.avatar_url) {
        const oldPath = profile.avatar_url.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from('avatars')
            .remove([`${user.id}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      return publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (100MB)
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 100MB",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);
    try {
      await uploadAvatarMutation.mutateAsync(file);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-foreground mb-8">Settings</h1>

      <div className="space-y-6">
        {/* Verification Status Card */}
        <VerificationStatus />

        {/* Profile Completion Card */}
        {profile && (
          <Card>
            <CardHeader>
              <CardTitle>Profile Completion</CardTitle>
              <CardDescription>
                Complete your profile to make the most of Fayvrs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {(() => {
                const completionItems = [
                  { label: 'Username set', completed: !!profile.username },
                  { label: 'Profile picture uploaded', completed: !!profile.avatar_url },
                  { label: 'Bio added', completed: !!profile.bio },
                  { label: 'Location set', completed: !!profile.location },
                ];
                
                const completedCount = completionItems.filter(item => item.completed).length;
                const percentage = Math.round((completedCount / completionItems.length) * 100);
                
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{percentage}% Complete</span>
                      <span className="text-xs text-muted-foreground">
                        {completedCount} of {completionItems.length} items
                      </span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      {completionItems.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          {item.completed ? (
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border-2 border-muted-foreground" />
                          )}
                          <span className={`text-sm ${item.completed ? 'text-muted-foreground' : 'font-medium'}`}>
                            {item.label}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })()}
            </CardContent>
          </Card>
        )}

        {/* Username Card */}
        <Card>
          <CardHeader>
            <CardTitle>Username</CardTitle>
            <CardDescription>
              Choose a unique username for your profile
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                <AtSign className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="username">Username</Label>
                <div className="flex gap-2">
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setUsernameError("");
                    }}
                    placeholder="Enter username"
                    className={usernameError ? "border-destructive" : ""}
                  />
                  <Button 
                    onClick={handleUsernameSubmit}
                    disabled={updateUsernameMutation.isPending || !username.trim() || username === profile?.username}
                  >
                    {updateUsernameMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save"
                    )}
                  </Button>
                </div>
                {usernameError && (
                  <p className="text-sm text-destructive">{usernameError}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  3-20 characters. Letters, numbers, and underscores only.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Picture</CardTitle>
            <CardDescription>
              Upload a profile picture to help others recognize you
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24">
                <AvatarImage src={profile?.avatar_url} />
                <AvatarFallback className="bg-primary text-white text-2xl">
                  {profile?.full_name?.[0] || <User className="w-12 h-12" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <Label htmlFor="avatar-upload" className="cursor-pointer">
                  <div className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors w-fit">
                    {uploading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Uploading...</span>
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4" />
                        <span>Upload Photo</span>
                      </>
                    )}
                  </div>
                </Label>
                <Input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={uploading}
                  className="hidden"
                />
                <p className="text-sm text-muted-foreground mt-2">
                  JPG, PNG or GIF. Max size 100MB.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle>Notification Preferences</CardTitle>
            <CardDescription>
              Manage how you receive notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="push" className="text-sm font-medium cursor-pointer">
                    Push Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Get notified about new requests and proposals</p>
                </div>
              </div>
              <Switch
                id="push"
                checked={preferences?.push_enabled ?? true}
                onCheckedChange={(checked) => updatePreferencesMutation.mutate({ push_enabled: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="sms" className="text-sm font-medium cursor-pointer">
                    SMS Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Receive text messages for important updates</p>
                </div>
              </div>
              <Switch
                id="sms"
                checked={preferences?.sms_enabled ?? false}
                onCheckedChange={(checked) => updatePreferencesMutation.mutate({ sms_enabled: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Mail className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="email" className="text-sm font-medium cursor-pointer">
                    Email Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">Get updates via email</p>
                </div>
              </div>
              <Switch
                id="email"
                checked={preferences?.email_enabled ?? true}
                onCheckedChange={(checked) => updatePreferencesMutation.mutate({ email_enabled: checked })}
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
                  <Bell className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <Label htmlFor="in-app" className="text-sm font-medium cursor-pointer">
                    In-App Notifications
                  </Label>
                  <p className="text-xs text-muted-foreground">See notifications within the app</p>
                </div>
              </div>
              <Switch
                id="in-app"
                checked={preferences?.in_app_enabled ?? true}
                onCheckedChange={(checked) => updatePreferencesMutation.mutate({ in_app_enabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        {/* App & Legal Links */}
        <Card>
          <CardHeader>
            <CardTitle>App & Legal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link to="/safety-center">
              <Button variant="ghost" className="w-full justify-start">
                Safety Center
              </Button>
            </Link>
            <Link to="/subscription-details">
              <Button variant="ghost" className="w-full justify-start">
                Subscription Details
              </Button>
            </Link>
            <Link to="/data-deletion">
              <Button variant="ghost" className="w-full justify-start">
                Data Deletion Information
              </Button>
            </Link>
            <Link to="/privacy-policy">
              <Button variant="ghost" className="w-full justify-start">
                Privacy Policy
              </Button>
            </Link>
            <Link to="/terms-of-service">
              <Button variant="ghost" className="w-full justify-start">
                Terms of Service
              </Button>
            </Link>
            <Link to="/community-guidelines">
              <Button variant="ghost" className="w-full justify-start">
                Community Guidelines
              </Button>
            </Link>
            <Link to="/refund-policy">
              <Button variant="ghost" className="w-full justify-start">
                Refund Policy
              </Button>
            </Link>
            <Link to="/app-store-readiness">
              <Button variant="ghost" className="w-full justify-start">
                App Store Readiness
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Account Deletion */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Delete Account</CardTitle>
            <CardDescription>
              Permanently delete your account and all associated data. This action cannot be undone.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="w-full"
              onClick={async () => {
                if (confirm("Are you sure you want to delete your account? This action cannot be undone and will remove:\n\n• Your profile and personal information\n• All your messages\n• All your requests and proposals\n• Your subscription status\n• All other associated data\n\nType 'DELETE' in the next prompt to confirm.")) {
                  const confirmation = prompt("Type 'DELETE' to confirm account deletion:");
                  if (confirmation === 'DELETE') {
                    try {
                      // Call edge function to delete all user data
                      const { error: deleteError } = await supabase.functions.invoke('delete-user-account', {
                        body: { userId: user?.id }
                      });

                      if (deleteError) throw deleteError;

                      // Sign out the user
                      await supabase.auth.signOut();
                      
                      toast({ title: "Account deleted", description: "Your account has been successfully deleted" });
                      window.location.href = '/';
                    } catch (error) {
                      console.error('Error deleting account:', error);
                      toast({ title: "Error", description: "Failed to delete account. Please contact support.", variant: "destructive" });
                    }
                  }
                }
              }}
            >
              Delete My Account
            </Button>
          </CardContent>
        </Card>
      </div>

      <Toaster />
    </div>
  );
}
