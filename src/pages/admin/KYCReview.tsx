import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { getSignedVerificationUrl } from '@/utils/storageHelper';
import { CheckCircle, XCircle, Clock, Search, Users, FileCheck, Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface Verification {
  id: string;
  user_id: string;
  status: string;
  id_document_url: string;
  selfie_url: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewer_notes: string | null;
  profiles: {
    full_name: string;
    email: string;
    avatar_url: string;
  };
}

export default function KYCReview() {
  const [activeTab, setActiveTab] = useState('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVerification, setSelectedVerification] = useState<Verification | null>(null);
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [idDocumentUrl, setIdDocumentUrl] = useState<string | null>(null);
  const [selfieUrl, setSelfieUrl] = useState<string | null>(null);
  const [loadingImages, setLoadingImages] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all verifications
  const { data: verifications, isLoading } = useQuery({
    queryKey: ['admin-verifications'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('identity_verifications')
        .select(`
          id,
          user_id,
          status,
          id_document_url,
          selfie_url,
          submitted_at,
          reviewed_at,
          reviewer_notes,
          profiles!identity_verifications_user_id_fkey(full_name, email, avatar_url)
        `)
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      
      // Transform the data to match our interface
      return data?.map(v => ({
        ...v,
        profiles: Array.isArray(v.profiles) ? v.profiles[0] : v.profiles
      })) as Verification[];
    },
  });

  // Calculate statistics
  const stats = {
    total: verifications?.length || 0,
    pending: verifications?.filter(v => v.status === 'pending').length || 0,
    approved: verifications?.filter(v => v.status === 'approved').length || 0,
    rejected: verifications?.filter(v => v.status === 'rejected').length || 0,
    approvalRate: verifications?.length 
      ? Math.round((verifications.filter(v => v.status === 'approved').length / verifications.length) * 100)
      : 0,
  };

  // Filter verifications based on tab and search
  const filteredVerifications = verifications?.filter(v => {
    const matchesTab = activeTab === 'all' || v.status === activeTab;
    const matchesSearch = 
      v.profiles.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.profiles.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  // Update verification status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ verificationId, status, notes }: { verificationId: string; status: 'approved' | 'rejected'; notes: string }) => {
      const { data, error } = await supabase.functions.invoke('update-verification-status', {
        body: {
          verification_id: verificationId,
          status,
          reviewer_notes: notes,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      toast({
        title: variables.status === 'approved' ? 'Verification Approved' : 'Verification Rejected',
        description: `The verification has been ${variables.status}.`,
      });
      queryClient.invalidateQueries({ queryKey: ['admin-verifications'] });
      setSelectedVerification(null);
      setReviewerNotes('');
    },
    onError: (error: Error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update verification status.',
        variant: 'destructive',
      });
    },
  });

  // Open detail dialog and load signed URLs
  const handleViewDetails = async (verification: Verification) => {
    setSelectedVerification(verification);
    setReviewerNotes(verification.reviewer_notes || '');
    setLoadingImages(true);
    
    try {
      const [idUrl, selfUrl] = await Promise.all([
        getSignedVerificationUrl(verification.id_document_url),
        getSignedVerificationUrl(verification.selfie_url),
      ]);
      setIdDocumentUrl(idUrl);
      setSelfieUrl(selfUrl);
    } catch (error) {
      console.error('Error loading images:', error);
      toast({
        title: 'Error',
        description: 'Failed to load verification images.',
        variant: 'destructive',
      });
    } finally {
      setLoadingImages(false);
    }
  };

  const handleApprove = () => {
    if (!selectedVerification) return;
    updateStatusMutation.mutate({
      verificationId: selectedVerification.id,
      status: 'approved',
      notes: reviewerNotes,
    });
  };

  const handleReject = () => {
    if (!selectedVerification) return;
    if (!reviewerNotes.trim()) {
      toast({
        title: 'Error',
        description: 'Reviewer notes are required for rejection.',
        variant: 'destructive',
      });
      return;
    }
    updateStatusMutation.mutate({
      verificationId: selectedVerification.id,
      status: 'rejected',
      notes: reviewerNotes,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge variant="verified"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge variant="unverified"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'pending':
        return <Badge variant="pending"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">KYC Review Dashboard</h1>
        <p className="text-muted-foreground">Review and manage identity verifications</p>
      </div>

      {/* Statistics Dashboard */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Verifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">{stats.total}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-5 w-5 text-yellow-500 mr-2" />
              <span className="text-2xl font-bold">{stats.pending}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
              <span className="text-2xl font-bold">{stats.approved}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <XCircle className="h-5 w-5 text-red-500 mr-2" />
              <span className="text-2xl font-bold">{stats.rejected}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">Approval Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <FileCheck className="h-5 w-5 text-primary mr-2" />
              <span className="text-2xl font-bold">{stats.approvalRate}%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full md:w-auto">
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
                <TabsTrigger value="approved">Approved</TabsTrigger>
                <TabsTrigger value="rejected">Rejected</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Verifications List */}
      <Card>
        <CardHeader>
          <CardTitle>Verifications</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredVerifications?.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No verifications found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredVerifications?.map((verification) => (
                <div key={verification.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={verification.profiles.avatar_url} />
                      <AvatarFallback>{verification.profiles.full_name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-semibold">{verification.profiles.full_name}</p>
                      <p className="text-sm text-muted-foreground">{verification.profiles.email}</p>
                    </div>
                    <div className="text-sm text-muted-foreground hidden md:block">
                      Submitted {format(new Date(verification.submitted_at), 'MMM dd, yyyy')}
                    </div>
                    {getStatusBadge(verification.status)}
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewDetails(verification)}
                    className="ml-4"
                  >
                    {verification.status === 'pending' ? 'Review' : 'View'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={!!selectedVerification} onOpenChange={() => setSelectedVerification(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Identity Verification Review</DialogTitle>
          </DialogHeader>

          {selectedVerification && (
            <div className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-accent/50 rounded-lg">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedVerification.profiles.avatar_url} />
                  <AvatarFallback>{selectedVerification.profiles.full_name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{selectedVerification.profiles.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedVerification.profiles.email}</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Submitted on {format(new Date(selectedVerification.submitted_at), 'MMMM dd, yyyy')}
                  </p>
                </div>
                {getStatusBadge(selectedVerification.status)}
              </div>

              {/* Documents */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2">ID Document</h4>
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    {loadingImages ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : idDocumentUrl ? (
                      <img src={idDocumentUrl} alt="ID Document" className="w-full h-auto" />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-muted-foreground">
                        Failed to load image
                      </div>
                    )}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Selfie</h4>
                  <div className="border rounded-lg overflow-hidden bg-muted">
                    {loadingImages ? (
                      <div className="flex items-center justify-center h-64">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                      </div>
                    ) : selfieUrl ? (
                      <img src={selfieUrl} alt="Selfie" className="w-full h-auto" />
                    ) : (
                      <div className="flex items-center justify-center h-64 text-muted-foreground">
                        Failed to load image
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Review Section */}
              {selectedVerification.status === 'pending' ? (
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Reviewer Notes</label>
                    <Textarea
                      placeholder="Add notes about this verification (required for rejection)..."
                      value={reviewerNotes}
                      onChange={(e) => setReviewerNotes(e.target.value)}
                      rows={4}
                    />
                  </div>
                  <div className="flex gap-4">
                    <Button
                      onClick={handleApprove}
                      disabled={updateStatusMutation.isPending}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                    >
                      {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle className="h-4 w-4 mr-2" />}
                      Approve
                    </Button>
                    <Button
                      onClick={handleReject}
                      disabled={updateStatusMutation.isPending}
                      variant="destructive"
                      className="flex-1"
                    >
                      {updateStatusMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <XCircle className="h-4 w-4 mr-2" />}
                      Reject
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-accent/50 rounded-lg">
                  <h4 className="font-semibold mb-2">Review Details</h4>
                  <p className="text-sm text-muted-foreground mb-2">
                    Reviewed on {selectedVerification.reviewed_at ? format(new Date(selectedVerification.reviewed_at), 'MMMM dd, yyyy') : 'N/A'}
                  </p>
                  {selectedVerification.reviewer_notes && (
                    <div>
                      <p className="text-sm font-medium mb-1">Notes:</p>
                      <p className="text-sm">{selectedVerification.reviewer_notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
