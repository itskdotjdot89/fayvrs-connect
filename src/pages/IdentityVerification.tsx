import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Upload, Camera, FileCheck, BadgeCheck, DollarSign, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { WelcomeModal } from "@/components/WelcomeModal";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * Identity Verification Page
 * 
 * APPLE APP STORE COMPLIANCE (Guideline 5.1.1):
 * - Verification is OPTIONAL and users can skip it
 * - Clearly explains WHY verification is beneficial (not required)
 * - Only required for specific high-trust actions (payouts, high-value jobs, verified badge)
 */

export default function IdentityVerification() {
  const [uploading, setUploading] = useState(false);
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [idPreview, setIdPreview] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isSkipped, setIsSkipped] = useState(false);
  const { user, activeRole } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch user role
  const { data: userRole } = useQuery({
    queryKey: ['user-role', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .limit(1)
        .single();
      return data?.role as 'requester' | 'provider' || 'requester';
    },
    enabled: !!user?.id,
  });

  const validateFile = (file: File, type: 'id' | 'selfie'): boolean => {
    // Max 100MB
    if (file.size > 100 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "File must be less than 100MB",
        variant: "destructive"
      });
      return false;
    }
    
    // Only images
    const allowedTypes = ['image/jpeg', 'image/png', 'image/heic', 'image/jpg'];
    if (!allowedTypes.includes(file.type.toLowerCase())) {
      toast({
        title: "Invalid file type",
        description: "Only JPEG, PNG, and HEIC images are allowed",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'id' | 'selfie') => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file before setting
      if (!validateFile(file, type)) {
        // Clear the input
        e.target.value = '';
        return;
      }
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'id') {
          setIdPreview(reader.result as string);
          setIdDocumentFile(file);
        } else {
          setSelfiePreview(reader.result as string);
          setSelfieFile(file);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to verify your identity",
        variant: "destructive"
      });
      return;
    }
    if (!idDocumentFile || !selfieFile) {
      toast({
        title: "Missing files",
        description: "Please upload both ID document and selfie",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    let idPath = '';
    let selfiePath = '';

    try {
      // Upload ID document
      const idExt = idDocumentFile.name.split('.').pop();
      idPath = `${user.id}/id-document-${Date.now()}.${idExt}`;
      const { error: idError } = await supabase.storage
        .from('verification-documents')
        .upload(idPath, idDocumentFile, { upsert: true });

      if (idError) throw idError;

      // Upload selfie
      const selfieExt = selfieFile.name.split('.').pop();
      selfiePath = `${user.id}/selfie-${Date.now()}.${selfieExt}`;
      const { error: selfieError } = await supabase.storage
        .from('verification-documents')
        .upload(selfiePath, selfieFile, { upsert: true });

      if (selfieError) {
        // Cleanup: Delete the ID that was already uploaded
        await supabase.storage.from('verification-documents').remove([idPath]);
        throw selfieError;
      }

      // Create verification record - store paths instead of public URLs
      const { error: dbError } = await supabase
        .from('identity_verifications')
        .upsert({
          user_id: user.id,
          status: 'pending',
          id_document_url: idPath,
          selfie_url: selfiePath,
          submitted_at: new Date().toISOString()
        });

      if (dbError) {
        // Cleanup: Delete both uploaded files
        await supabase.storage.from('verification-documents').remove([idPath, selfiePath]);
        throw dbError;
      }

      toast({
        title: "Success!",
        description: "Your verification has been submitted. We'll review it within 24 hours."
      });

      setIsSkipped(false);
      setShowWelcomeModal(true);
    } catch (error: any) {
      console.error('Verification error:', error);
      toast({
        title: "Upload failed",
        description: error.message || "Failed to submit verification. Please try again.",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const handleSkip = async () => {
    setIsSkipped(true);
    setShowWelcomeModal(true);
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-verified to-primary flex items-center justify-center shadow-soft">
            <Shield className="w-10 h-10 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title & Description - Updated messaging */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold font-poppins text-foreground">
            Identity Verification (Optional)
          </h1>
          <p className="text-muted-foreground">
            Verify your ID to unlock additional features and build trust in the community.
          </p>
        </div>

        {/* Benefits Card - Explain why verification is valuable */}
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary" />
              Why Verify?
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-start gap-3 text-sm">
              <BadgeCheck className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Get a "Verified Provider" badge on your profile</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <DollarSign className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Required to receive payouts for completed jobs</span>
            </div>
            <div className="flex items-start gap-3 text-sm">
              <Shield className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
              <span className="text-muted-foreground">Accept higher-value jobs ($200+)</span>
            </div>
          </CardContent>
        </Card>

        {/* Upload Steps */}
        <div className="bg-white rounded-card p-6 shadow-soft space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-foreground mb-1">Upload ID</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Photo of government-issued ID (Max 100MB)
              </p>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/jpg,image/heic" 
                onChange={e => handleFileChange(e, 'id')} 
                className="text-sm mb-2" 
              />
              {idPreview && (
                <div className="mt-2">
                  <img 
                    src={idPreview} 
                    alt="ID preview" 
                    className="w-full h-32 object-cover rounded-lg border border-border" 
                  />
                </div>
              )}
              {idDocumentFile && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {idDocumentFile.name}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-foreground mb-1">Take Selfie</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Quick photo to verify it's you (Max 100MB)
              </p>
              <input 
                type="file" 
                accept="image/jpeg,image/png,image/jpg,image/heic" 
                capture="user" 
                onChange={e => handleFileChange(e, 'selfie')} 
                className="text-sm mb-2" 
              />
              {selfiePreview && (
                <div className="mt-2">
                  <img 
                    src={selfiePreview} 
                    alt="Selfie preview" 
                    className="w-full h-32 object-cover rounded-lg border border-border" 
                  />
                </div>
              )}
              {selfieFile && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {selfieFile.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* CTA */}
        <Button 
          size="lg" 
          className="w-full h-14 rounded-2xl shadow-soft text-base font-semibold" 
          onClick={handleSubmit} 
          disabled={uploading || !idDocumentFile || !selfieFile}
        >
          {uploading ? "Uploading..." : "Submit Verification"}
        </Button>

        {/* Skip Link - More prominent */}
        <div className="text-center space-y-2">
          <Button 
            variant="ghost" 
            onClick={handleSkip}
            className="text-muted-foreground hover:text-primary"
          >
            Skip for now
          </Button>
          <p className="text-xs text-muted-foreground">
            You can verify later from your Settings when needed
          </p>
        </div>
      </div>

      <WelcomeModal
        open={showWelcomeModal}
        onOpenChange={setShowWelcomeModal}
        role={userRole || 'requester'}
        isSkipped={isSkipped}
      />
    </div>
  );
}
