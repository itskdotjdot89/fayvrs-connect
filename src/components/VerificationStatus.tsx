import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Clock, XCircle, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface VerificationData {
  status: string;
  submitted_at: string | null;
  reviewed_at: string | null;
  reviewer_notes: string | null;
}

export default function VerificationStatus() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchVerification = async () => {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select('status, submitted_at, reviewed_at, reviewer_notes')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setVerification(data);
      }
      setLoading(false);
    };

    fetchVerification();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!verification) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Verification Required
          </CardTitle>
          <CardDescription>
            Verify your identity to access full features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={() => navigate('/identity-verification')} className="w-full">
            Start Verification
          </Button>
        </CardContent>
      </Card>
    );
  }

  const getStatusBadge = () => {
    switch (verification.status) {
      case 'approved':
        return (
          <Badge className="bg-green-500 hover:bg-green-600">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600 text-white">
            <Clock className="h-3 w-3 mr-1" />
            Pending Review
          </Badge>
        );
      case 'rejected':
        return (
          <Badge variant="destructive">
            <XCircle className="h-3 w-3 mr-1" />
            Rejected
          </Badge>
        );
      default:
        return null;
    }
  };

  const getStatusMessage = () => {
    switch (verification.status) {
      case 'approved':
        return "Your identity has been verified successfully.";
      case 'pending':
        return "Your verification is being reviewed. We'll notify you within 24 hours.";
      case 'rejected':
        return "Your verification was not approved. Please review the feedback and resubmit.";
      default:
        return "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Identity Verification</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>{getStatusMessage()}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {verification.submitted_at && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Submitted:</span>{" "}
            {new Date(verification.submitted_at).toLocaleDateString()}
          </div>
        )}
        
        {verification.reviewed_at && (
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Reviewed:</span>{" "}
            {new Date(verification.reviewed_at).toLocaleDateString()}
          </div>
        )}

        {verification.status === 'rejected' && verification.reviewer_notes && (
          <div className="rounded-lg bg-destructive/10 p-4 text-sm">
            <p className="font-medium text-destructive mb-1">Rejection Reason:</p>
            <p className="text-muted-foreground">{verification.reviewer_notes}</p>
          </div>
        )}

        {verification.status === 'rejected' && (
          <Button onClick={() => navigate('/identity-verification')} className="w-full">
            Resubmit Verification
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
