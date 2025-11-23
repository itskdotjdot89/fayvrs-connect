import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Sparkles, MapPin, DollarSign, Wrench, Loader2, Tag, Image as ImageIcon, X, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { validateImageFile, formatFileSize } from "@/utils/fileValidation";
type RequestData = {
  title: string;
  description: string;
  request_type: "service" | "product" | "other";
  category: string;
  location: string;
  budget_min: number | null;
  budget_max: number | null;
  tags: string[];
  confidence?: number;
  suggested_budget_min?: number;
  suggested_budget_max?: number;
  budget_reasoning?: string;
  budget_confidence?: 'low' | 'medium' | 'high';
  moderation_flags?: {
    is_safe: boolean;
    flagged_categories: string[];
    risk_level: 'none' | 'low' | 'medium' | 'high';
    reason: string;
  };
};
export default function PostRequest() {
  const navigate = useNavigate();
  const {
    user,
    loading
  } = useAuth();
  const {
    toast
  } = useToast();

  // Check verification status
  const [isVerified, setIsVerified] = useState<boolean | null>(null);
  const [checkingVerification, setCheckingVerification] = useState(true);

  // Step 1: Natural language input
  const [step, setStep] = useState<1 | 2>(1);
  const [naturalInput, setNaturalInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  // Step 2: Parsed data (editable)
  const [parsedData, setParsedData] = useState<RequestData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedImageUrls, setUploadedImageUrls] = useState<string[]>([]);
  
  // Geolocation state
  const [userCoords, setUserCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  useEffect(() => {
    const checkVerification = async () => {
      if (!user) {
        setCheckingVerification(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('profiles')
        .select('is_verified')
        .eq('id', user.id)
        .single();
      
      if (error) {
        console.error('Error checking verification:', error);
        setIsVerified(false);
      } else {
        setIsVerified(data?.is_verified || false);
      }
      setCheckingVerification(false);
    };
    
    checkVerification();
  }, [user]);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    } else if (!checkingVerification && user && isVerified === false) {
      toast({
        title: "Verification Required",
        description: "Please complete identity verification to post requests",
        variant: "destructive"
      });
      navigate("/identity-verification");
    }
  }, [user, loading, isVerified, checkingVerification, navigate, toast]);

  // Get user's geolocation on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserCoords({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
          console.log('User location obtained:', position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.log('Geolocation permission denied or unavailable:', error);
          // Don't show error toast - just silently fail
        }
      );
    }
  }, []);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    // Check total count
    if (files.length + uploadedImages.length > 5) {
      toast({
        title: "Too many images",
        description: "You can upload up to 5 images",
        variant: "destructive"
      });
      return;
    }

    // Validate each file
    const validFiles: File[] = [];
    for (const file of files) {
      const validation = validateImageFile(file);
      if (!validation.isValid) {
        toast({
          title: "Invalid file",
          description: validation.error,
          variant: "destructive"
        });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setUploadedImages(prev => [...prev, ...validFiles]);
    
    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };
  const handleAnalyze = async () => {
    if (!naturalInput.trim()) {
      toast({
        title: "Input Required",
        description: "Please describe what you need",
        variant: "destructive"
      });
      return;
    }
    setIsAnalyzing(true);
    try {
      // Convert images to base64 for sending to edge function
      const imageBase64Array: string[] = [];
      for (const file of uploadedImages) {
        const reader = new FileReader();
        const base64 = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });
        imageBase64Array.push(base64);
      }

      const {
        data,
        error
      } = await supabase.functions.invoke('analyze-request-openai', {
        body: {
          prompt: naturalInput,
          images: imageBase64Array
        }
      });
      if (error) throw error;
      if (data.error) {
        throw new Error(data.details || data.error);
      }
      
      // If no location detected and we have user coords, reverse geocode
      let finalLocation = data.location || "";
      if (!finalLocation && userCoords) {
        console.log('No location in request, using geolocation...');
        try {
          const { data: reverseData, error: reverseError } = await supabase.functions.invoke('reverse-geocode', {
            body: {
              latitude: userCoords.latitude,
              longitude: userCoords.longitude
            }
          });
          
          if (!reverseError && reverseData?.formatted) {
            finalLocation = reverseData.formatted;
            console.log('Auto-detected location:', finalLocation);
          }
        } catch (error) {
          console.error('Reverse geocode failed:', error);
          // Continue without location
        }
      }
      
      // Check moderation flags
      const moderationFlags = data.moderation_flags;
      console.log('Moderation flags:', moderationFlags);
      
      // Handle high-risk content - auto-reject
      if (moderationFlags?.risk_level === 'high') {
        toast({
          title: "Content Policy Violation",
          description: moderationFlags.reason || "This request violates our content policies and cannot be posted.",
          variant: "destructive"
        });
        setIsAnalyzing(false);
        return;
      }

      // Show info for medium-risk content
      if (moderationFlags?.risk_level === 'medium') {
        toast({
          title: "Under Review",
          description: "Your request will be reviewed by our team within 24 hours before appearing in the feed.",
        });
      }
      
      setParsedData({
        title: data.title,
        description: data.description,
        request_type: data.request_type,
        category: data.category || "",
        location: finalLocation,
        budget_min: data.budget_min || null,
        budget_max: data.budget_max || null,
        tags: data.tags || [],
        confidence: data.confidence,
        suggested_budget_min: data.suggested_budget_min,
        suggested_budget_max: data.suggested_budget_max,
        budget_reasoning: data.budget_reasoning,
        budget_confidence: data.budget_confidence,
        moderation_flags: data.moderation_flags
      });
      setStep(2);
    } catch (error) {
      console.error('Analysis error:', error);
      toast({
        title: "Analysis Failed",
        description: error instanceof Error ? error.message : "Could not analyze request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsAnalyzing(false);
    }
  };
  const handleSubmit = async () => {
    if (!user || !parsedData) return;
    setIsSubmitting(true);
    try {
      // Step 1: Upload images to storage
      const imageUrls: string[] = [];
      for (const file of uploadedImages) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError, data: uploadData } = await supabase.storage
          .from('request-images')
          .upload(fileName, file);

        if (uploadError) {
          console.error('Image upload error:', uploadError);
          throw uploadError;
        }

        const { data: { publicUrl } } = supabase.storage
          .from('request-images')
          .getPublicUrl(fileName);
        
        imageUrls.push(publicUrl);
      }

      // Step 2: Geocode the location
      let latitude: number | null = null;
      let longitude: number | null = null;
      if (parsedData.location) {
        toast({
          title: "Processing...",
          description: "Finding providers in your area"
        });
        const {
          data: geocodeData,
          error: geocodeError
        } = await supabase.functions.invoke('geocode-location', {
          body: {
            location: parsedData.location
          }
        });
        if (!geocodeError && geocodeData) {
          latitude = geocodeData.latitude;
          longitude = geocodeData.longitude;

          // Update user profile with coordinates if not already set
          const {
            data: profile
          } = await supabase.from('profiles').select('latitude, longitude').eq('id', user.id).single();
          if (profile && !profile.latitude && !profile.longitude) {
            await supabase.from('profiles').update({
              latitude: latitude,
              longitude: longitude
            }).eq('id', user.id);
          }
        }
      }

      // Step 3: Determine moderation status based on risk level
      let moderationStatus = 'approved';
      let flaggedReason = null;
      
      if (parsedData.moderation_flags) {
        const { risk_level, reason } = parsedData.moderation_flags;
        
        if (risk_level === 'high') {
          // This shouldn't happen as we block at analysis stage, but just in case
          toast({
            title: "Content Policy Violation",
            description: reason || "This request cannot be posted.",
            variant: "destructive"
          });
          setIsSubmitting(false);
          return;
        } else if (risk_level === 'medium') {
          moderationStatus = 'pending';
          flaggedReason = reason;
        } else if (risk_level === 'low') {
          moderationStatus = 'flagged';
          flaggedReason = reason;
        }
        // 'none' = 'approved' (default)
      }

      // Step 4: Insert the request with moderation status
      const {
        data: newRequest,
        error: insertError
      } = await supabase.from('requests').insert({
        user_id: user.id,
        title: parsedData.title,
        description: parsedData.description,
        request_type: parsedData.request_type,
        category: parsedData.category || null,
        location: parsedData.location || null,
        latitude: latitude,
        longitude: longitude,
        budget_min: parsedData.budget_min,
        budget_max: parsedData.budget_max,
        tags: parsedData.tags,
        status: 'open',
        images: imageUrls,
        moderation_status: moderationStatus,
        flagged_reason: flaggedReason
      }).select().single();
      if (insertError) throw insertError;

      // Step 5: Handle post-submission based on moderation status
      if (moderationStatus === 'pending') {
        toast({
          title: "Request Submitted for Review",
          description: "Your request is being reviewed by our team. You'll be notified within 24 hours."
        });
        navigate("/requester-dashboard");
        return;
      }

      // Step 6: Match providers if we have coordinates and request is approved/flagged
      if (latitude && longitude && newRequest) {
        const {
          data: matchData
        } = await supabase.functions.invoke('match-providers', {
          body: {
            request_id: newRequest.id,
            latitude: latitude,
            longitude: longitude,
            category: parsedData.category,
            radius_miles: 25
          }
        });
        const providerCount = matchData?.matched_count || 0;
        toast({
          title: "Request Posted!",
          description: providerCount > 0 ? `${providerCount} provider${providerCount > 1 ? 's' : ''} have been notified in your area` : "Your request has been posted to the marketplace"
        });
      } else {
        toast({
          title: "Success!",
          description: "Your request has been posted"
        });
      }
      navigate("/feed");
    } catch (error) {
      console.error('Submit error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to post request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleGoBack = () => {
    setStep(1);
    setParsedData(null);
    setUploadedImageUrls([]);
  };
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }
  return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {step === 1 ?
      // Step 1: Natural Language Input
      <>
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Sparkles className="w-6 h-6 text-primary" />
                <h1 className="text-2xl font-semibold">What do you need?</h1>
              </div>
              <p className="text-muted-foreground">
                Describe what you're looking for naturally. Our AI will organize it for you.
              </p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="space-y-2">
                  <Textarea placeholder="Example: I need a plumber to fix my leaky bathroom sink in Brooklyn. Budget around $200-300" value={naturalInput} onChange={e => setNaturalInput(e.target.value)} className="min-h-[150px] text-base resize-none" disabled={isAnalyzing} />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">💡 Tip: Include details like time, location, budget, and any specific requirements</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-upload" className="flex items-center gap-2 cursor-pointer">
                    <ImageIcon className="w-4 h-4" />
                    Add Images (Optional)
                  </Label>
                  <Input
                    id="image-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleImageSelect}
                    disabled={isAnalyzing || uploadedImages.length >= 5}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload up to 5 images (100MB each) to help providers visualize your request
                  </p>
                  
                  {imagePreviews.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-20 h-20 object-cover rounded-lg"
                          />
                          <button
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
                            disabled={isAnalyzing}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button onClick={handleAnalyze} size="lg" className="w-full" disabled={isAnalyzing || !naturalInput.trim()}>
                  {isAnalyzing ? <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </> : <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Request
                    </>}
                </Button>
              </CardContent>
            </Card>
          </> :
      // Step 2: Preview & Edit
      <>
            <div className="text-center mb-6">
              <h1 className="text-2xl font-semibold mb-2">Review Your Request</h1>
              <p className="text-muted-foreground">
                Check the details and make any adjustments before posting
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  AI-Generated Request
                  {parsedData?.confidence && <span className="text-sm font-normal text-muted-foreground ml-auto">
                      {Math.round(parsedData.confidence * 100)}% confidence
                    </span>}
                </CardTitle>
                <CardDescription>
                  Based on: "{naturalInput.substring(0, 60)}..."
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input id="edit-title" value={parsedData?.title || ""} onChange={e => setParsedData(prev => prev ? {
                ...prev,
                title: e.target.value
              } : null)} />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea id="edit-description" value={parsedData?.description || ""} onChange={e => setParsedData(prev => prev ? {
                ...prev,
                description: e.target.value
              } : null)} className="min-h-[120px] text-base resize-none" />
                </div>

                <div className="space-y-2">
                  <Label>Request Type</Label>
                  <ToggleGroup type="single" value={parsedData?.request_type} onValueChange={value => value && setParsedData(prev => prev ? {
                ...prev,
                request_type: value as "service" | "product" | "other"
              } : null)} className="justify-start">
                    <ToggleGroupItem value="service" aria-label="Service">
                      <Wrench className="w-4 h-4 mr-2" />
                      Service
                    </ToggleGroupItem>
                    <ToggleGroupItem value="product" aria-label="Product">
                      Product
                    </ToggleGroupItem>
                    <ToggleGroupItem value="other" aria-label="Other">
                      Other
                    </ToggleGroupItem>
                  </ToggleGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-category">Category</Label>
                    <div className="relative">
                      <Input id="edit-category" placeholder="e.g., Home Services" value={parsedData?.category || ""} onChange={e => setParsedData(prev => prev ? {
                    ...prev,
                    category: e.target.value
                  } : null)} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-location" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Location
                    </Label>
                    <Input id="edit-location" placeholder="e.g., Brooklyn, NY" value={parsedData?.location || ""} onChange={e => setParsedData(prev => prev ? {
                  ...prev,
                  location: e.target.value
                } : null)} />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-budget-min" className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Min Budget
                    </Label>
                    <Input id="edit-budget-min" type="number" placeholder="Min" value={parsedData?.budget_min || ""} onChange={e => setParsedData(prev => prev ? {
                  ...prev,
                  budget_min: e.target.value ? Number(e.target.value) : null
                } : null)} />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-budget-max" className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Max Budget
                    </Label>
                    <Input id="edit-budget-max" type="number" placeholder="Max" value={parsedData?.budget_max || ""} onChange={e => setParsedData(prev => prev ? {
                  ...prev,
                  budget_max: e.target.value ? Number(e.target.value) : null
                } : null)} />
                  </div>
                </div>

                {/* AI Budget Suggestion */}
                {parsedData?.suggested_budget_min && parsedData?.suggested_budget_max && (
                  <Card className="bg-primary/5 border-primary/20">
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <Label className="text-sm font-semibold">
                              AI Budget Suggestion
                            </Label>
                            <Badge variant={
                              parsedData.budget_confidence === 'high' ? 'default' :
                              parsedData.budget_confidence === 'medium' ? 'secondary' : 
                              'outline'
                            }>
                              {parsedData.budget_confidence} confidence
                            </Badge>
                          </div>
                          
                          <div className="flex items-center gap-2 text-lg font-semibold">
                            <DollarSign className="w-5 h-5" />
                            <span>
                              ${parsedData.suggested_budget_min.toLocaleString()} - 
                              ${parsedData.suggested_budget_max.toLocaleString()}
                            </span>
                          </div>
                          
                          {parsedData.budget_reasoning && (
                            <p className="text-sm text-muted-foreground">
                              {parsedData.budget_reasoning}
                            </p>
                          )}
                          
                          {/* Warning if user entered lowball budget */}
                          {parsedData.budget_max && 
                           parsedData.budget_max < parsedData.suggested_budget_min * 0.7 && (
                            <Alert variant="destructive" className="mt-2">
                              <AlertCircle className="w-4 h-4" />
                              <AlertDescription>
                                Your budget may be too low for this type of work. 
                                Providers typically charge ${parsedData.suggested_budget_min.toLocaleString()}+ 
                                for similar requests.
                              </AlertDescription>
                            </Alert>
                          )}
                          
                          {/* Quick action button to use suggested budget */}
                          {(!parsedData.budget_min || !parsedData.budget_max) && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setParsedData(prev => prev ? {
                                ...prev,
                                budget_min: prev.suggested_budget_min || null,
                                budget_max: prev.suggested_budget_max || null
                              } : null)}
                              className="mt-2"
                            >
                              Use This Budget
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {parsedData?.tags && parsedData.tags.length > 0 && <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Keywords
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.tags.map((tag, idx) => <span key={idx} className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm">
                          {tag}
                        </span>)}
                    </div>
                  </div>}

                {imagePreviews.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <ImageIcon className="w-3 h-3" />
                      Attached Images
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {imagePreviews.map((preview, index) => (
                        <img
                          key={index}
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={handleGoBack} className="flex-1" disabled={isSubmitting}>
                    Go Back
                  </Button>
                  <Button onClick={handleSubmit} size="lg" className="flex-1" disabled={isSubmitting}>
                    {isSubmitting ? "Posting..." : "Post Request"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>}
      </div>
    </div>;
}