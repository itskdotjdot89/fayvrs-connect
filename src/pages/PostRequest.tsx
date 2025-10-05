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
import { Sparkles, MapPin, DollarSign, Wrench, Loader2, Tag } from "lucide-react";

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
};

export default function PostRequest() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  // Step 1: Natural language input
  const [step, setStep] = useState<1 | 2>(1);
  const [naturalInput, setNaturalInput] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Step 2: Parsed data (editable)
  const [parsedData, setParsedData] = useState<RequestData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);
  
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
      const { data, error } = await supabase.functions.invoke('analyze-request-openai', {
        body: { prompt: naturalInput }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.details || data.error);
      }

      setParsedData({
        title: data.title,
        description: data.description,
        request_type: data.request_type,
        category: data.category || "",
        location: data.location || "",
        budget_min: data.budget_min || null,
        budget_max: data.budget_max || null,
        tags: data.tags || [],
        confidence: data.confidence
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

    const { error } = await supabase
      .from('requests')
      .insert({
        user_id: user.id,
        title: parsedData.title,
        description: parsedData.description,
        request_type: parsedData.request_type,
        category: parsedData.category || null,
        location: parsedData.location || null,
        budget_min: parsedData.budget_min,
        budget_max: parsedData.budget_max,
        tags: parsedData.tags,
        status: 'open'
      });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to post request. Please try again.",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success!",
        description: "Your request has been posted"
      });
      navigate("/feed");
    }
  };

  const handleGoBack = () => {
    setStep(1);
    setParsedData(null);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {step === 1 ? (
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
                  <Textarea
                    placeholder="Example: I need a plumber to fix my leaky bathroom sink in Brooklyn. Budget around $200-300"
                    value={naturalInput}
                    onChange={(e) => setNaturalInput(e.target.value)}
                    className="min-h-[150px] text-base resize-none"
                    disabled={isAnalyzing}
                  />
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    💡 Tip: Include details like location, budget, and any specific requirements
                  </p>
                </div>

                <Button 
                  onClick={handleAnalyze} 
                  size="lg" 
                  className="w-full"
                  disabled={isAnalyzing || !naturalInput.trim()}
                >
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Analyze Request
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </>
        ) : (
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
                  {parsedData?.confidence && (
                    <span className="text-sm font-normal text-muted-foreground ml-auto">
                      {Math.round(parsedData.confidence * 100)}% confidence
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Based on: "{naturalInput.substring(0, 60)}..."
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Title</Label>
                  <Input
                    id="edit-title"
                    value={parsedData?.title || ""}
                    onChange={(e) => setParsedData(prev => prev ? {...prev, title: e.target.value} : null)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-description">Description</Label>
                  <Textarea
                    id="edit-description"
                    value={parsedData?.description || ""}
                    onChange={(e) => setParsedData(prev => prev ? {...prev, description: e.target.value} : null)}
                    className="min-h-[120px] text-base resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Request Type</Label>
                  <ToggleGroup 
                    type="single" 
                    value={parsedData?.request_type} 
                    onValueChange={(value) => value && setParsedData(prev => prev ? {...prev, request_type: value as "service" | "product" | "other"} : null)}
                    className="justify-start"
                  >
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
                      <Input
                        id="edit-category"
                        placeholder="e.g., Home Services"
                        value={parsedData?.category || ""}
                        onChange={(e) => setParsedData(prev => prev ? {...prev, category: e.target.value} : null)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-location" className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      Location
                    </Label>
                    <Input
                      id="edit-location"
                      placeholder="e.g., Brooklyn, NY"
                      value={parsedData?.location || ""}
                      onChange={(e) => setParsedData(prev => prev ? {...prev, location: e.target.value} : null)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit-budget-min" className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Min Budget
                    </Label>
                    <Input
                      id="edit-budget-min"
                      type="number"
                      placeholder="Min"
                      value={parsedData?.budget_min || ""}
                      onChange={(e) => setParsedData(prev => prev ? {...prev, budget_min: e.target.value ? Number(e.target.value) : null} : null)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit-budget-max" className="flex items-center gap-1">
                      <DollarSign className="w-3 h-3" />
                      Max Budget
                    </Label>
                    <Input
                      id="edit-budget-max"
                      type="number"
                      placeholder="Max"
                      value={parsedData?.budget_max || ""}
                      onChange={(e) => setParsedData(prev => prev ? {...prev, budget_max: e.target.value ? Number(e.target.value) : null} : null)}
                    />
                  </div>
                </div>

                {parsedData?.tags && parsedData.tags.length > 0 && (
                  <div className="space-y-2">
                    <Label className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      Keywords
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {parsedData.tags.map((tag, idx) => (
                        <span 
                          key={idx}
                          className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleGoBack}
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    Go Back
                  </Button>
                  <Button 
                    onClick={handleSubmit} 
                    size="lg" 
                    className="flex-1"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Posting..." : "Post Request"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}