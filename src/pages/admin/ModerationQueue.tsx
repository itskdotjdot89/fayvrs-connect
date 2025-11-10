import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, CheckCircle, XCircle, Loader2, Eye, MapPin } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

type ModerationRequest = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  budget_min: number | null;
  budget_max: number | null;
  tags: string[];
  images: string[];
  created_at: string;
  moderation_status: string;
  flagged_reason: string | null;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string | null;
  };
};

export default function ModerationQueue() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [pendingRequests, setPendingRequests] = useState<ModerationRequest[]>([]);
  const [flaggedRequests, setFlaggedRequests] = useState<ModerationRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ModerationRequest | null>(null);
  const [moderationNotes, setModerationNotes] = useState("");
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    checkAdminAccess();
    fetchRequests();
  }, []);

  const checkAdminAccess = async () => {
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive"
      });
      navigate("/");
    }
  };

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const { data: pending, error: pendingError } = await supabase
        .from('requests')
        .select(`
          *,
          profiles!requests_user_id_fkey (full_name, email, avatar_url)
        `)
        .eq('moderation_status', 'pending')
        .order('created_at', { ascending: false });

      const { data: flagged, error: flaggedError } = await supabase
        .from('requests')
        .select(`
          *,
          profiles!requests_user_id_fkey (full_name, email, avatar_url)
        `)
        .eq('moderation_status', 'flagged')
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;
      if (flaggedError) throw flaggedError;

      setPendingRequests((pending || []) as ModerationRequest[]);
      setFlaggedRequests((flagged || []) as ModerationRequest[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
      toast({
        title: "Error",
        description: "Failed to load moderation queue",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request: ModerationRequest) => {
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('requests')
        .update({
          moderation_status: 'approved',
          moderation_notes: moderationNotes || null,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Request Approved",
        description: "The request is now live in the feed"
      });

      fetchRequests();
      setSelectedRequest(null);
      setModerationNotes("");
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: "Error",
        description: "Failed to approve request",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (request: ModerationRequest) => {
    if (!moderationNotes.trim()) {
      toast({
        title: "Notes Required",
        description: "Please provide a reason for rejection",
        variant: "destructive"
      });
      return;
    }

    setProcessing(true);
    try {
      const { error } = await supabase
        .from('requests')
        .update({
          moderation_status: 'rejected',
          moderation_notes: moderationNotes,
          moderated_by: user?.id,
          moderated_at: new Date().toISOString()
        })
        .eq('id', request.id);

      if (error) throw error;

      toast({
        title: "Request Rejected",
        description: "The user will be notified"
      });

      fetchRequests();
      setSelectedRequest(null);
      setModerationNotes("");
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: "Error",
        description: "Failed to reject request",
        variant: "destructive"
      });
    } finally {
      setProcessing(false);
    }
  };

  const RequestCard = ({ request, type }: { request: ModerationRequest; type: 'pending' | 'flagged' }) => (
    <Card key={request.id} className="mb-4">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <CardDescription className="mt-1">
              Posted by {request.profiles.full_name} ({request.profiles.email})
            </CardDescription>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant={type === 'pending' ? 'destructive' : 'secondary'}>
                {type === 'pending' ? 'Needs Review' : 'Flagged'}
              </Badge>
              {request.category && (
                <Badge variant="outline">{request.category}</Badge>
              )}
              {request.location && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {request.location}
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Description:</p>
            <p className="text-sm">{request.description}</p>
          </div>

          {request.flagged_reason && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <strong>Flagged Reason:</strong> {request.flagged_reason}
              </AlertDescription>
            </Alert>
          )}

          {request.budget_min && request.budget_max && (
            <div>
              <p className="text-sm text-muted-foreground">Budget:</p>
              <p className="text-sm font-medium">
                ${request.budget_min} - ${request.budget_max}
              </p>
            </div>
          )}

          {request.tags && request.tags.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Tags:</p>
              <div className="flex flex-wrap gap-1">
                {request.tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {request.images && request.images.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-2">Images:</p>
              <div className="flex gap-2 flex-wrap">
                {request.images.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`Request image ${idx + 1}`}
                    className="w-24 h-24 object-cover rounded border"
                  />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setSelectedRequest(request)}
            >
              <Eye className="h-4 w-4 mr-1" />
              Review
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Content Moderation Queue</h1>
        <p className="text-muted-foreground">
          Review and moderate user-submitted requests
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="pending">
            Pending Review ({pendingRequests.length})
          </TabsTrigger>
          <TabsTrigger value="flagged">
            Flagged ({flaggedRequests.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          {pendingRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No pending requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} type="pending" />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="flagged">
          {flaggedRequests.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No flagged requests</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4">
              {flaggedRequests.map((request) => (
                <RequestCard key={request.id} request={request} type="flagged" />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Review Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Review Request</CardTitle>
              <CardDescription>{selectedRequest.title}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Moderation Notes</Label>
                <Textarea
                  value={moderationNotes}
                  onChange={(e) => setModerationNotes(e.target.value)}
                  placeholder="Add notes about your decision (required for rejection)..."
                  className="mt-2"
                  rows={4}
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSelectedRequest(null);
                    setModerationNotes("");
                  }}
                  disabled={processing}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleReject(selectedRequest)}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <XCircle className="h-4 w-4 mr-2" />
                  )}
                  Reject
                </Button>
                <Button
                  onClick={() => handleApprove(selectedRequest)}
                  disabled={processing}
                >
                  {processing ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Approve
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
