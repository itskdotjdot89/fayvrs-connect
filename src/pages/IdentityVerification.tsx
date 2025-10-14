import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, Upload, Camera, FileCheck } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
export default function IdentityVerification() {
  const [uploading, setUploading] = useState(false);
  const [idDocumentFile, setIdDocumentFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const {
    user
  } = useAuth();
  const navigate = useNavigate();
  const {
    toast
  } = useToast();
const validateFile = (file: File, type: 'id' | 'selfie'): boolean => {
  // Max 5MB
  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "File too large",
      description: "File must be less than 5MB",
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
    
    if (type === 'id') {
      setIdDocumentFile(file);
    } else {
      setSelfieFile(file);
    }
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
          id_document_url: idPath,    // Store path, not URL
          selfie_url: selfiePath,      // Store path, not URL
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

      // Check user role and redirect accordingly
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (profile?.role === 'provider') {
        navigate('/provider-checkout');
      } else {
        navigate('/feed');
      }
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
    if (!user) return;

    // Check user role and redirect accordingly
    const {
      data: profile
    } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'provider') {
      navigate('/provider-checkout');
    } else {
      navigate('/feed');
    }
  };
  return <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-verified to-primary flex items-center justify-center shadow-soft">
            <Shield className="w-12 h-12 text-white" strokeWidth={2} />
          </div>
        </div>

        {/* Title & Description */}
        <div className="text-center space-y-3">
          <h1 className="text-2xl font-bold font-poppins text-foreground">
            Identity Verification Required
          </h1>
          <p className="text-muted-foreground">
            Verify your ID to access full features and build trust in the community.
          </p>
        </div>

        {/* Steps */}
        <div className="bg-white rounded-card p-6 shadow-soft space-y-4">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Upload className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-foreground mb-1">Upload ID</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Photo of government-issued ID
              </p>
              <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'id')} className="text-sm" />
              {idDocumentFile && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {idDocumentFile.name}
                </p>}
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center flex-shrink-0">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div className="flex-1 pt-1">
              <h3 className="font-semibold text-foreground mb-1">Take Selfie</h3>
              <p className="text-sm text-muted-foreground mb-2">
                Quick photo to verify it's you
              </p>
              <input type="file" accept="image/*" capture="user" onChange={e => handleFileChange(e, 'selfie')} className="text-sm" />
              {selfieFile && <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <CheckCircle className="w-3 h-3" /> {selfieFile.name}
                </p>}
            </div>
          </div>

          
        </div>

        {/* CTA */}
        <Button size="lg" className="w-full h-14 rounded-2xl shadow-soft text-base font-semibold" onClick={handleSubmit} disabled={uploading || !idDocumentFile || !selfieFile}>
          {uploading ? "Uploading..." : "Submit Verification"}
        </Button>

        {/* Skip Link */}
        <p className="text-center text-sm text-muted-foreground">
          <button onClick={handleSkip} className="hover:text-primary transition-colors">
            I'll do this later
          </button>
        </p>
      </div>
    </div>;
}