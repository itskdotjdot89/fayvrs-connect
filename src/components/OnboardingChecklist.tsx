import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Progress } from "@/components/ui/progress";
import { Link } from "react-router-dom";

export function OnboardingChecklist() {
  const { user, activeRole } = useAuth();
  const [isOpen, setIsOpen] = useState(true);

  const { data: checklistData } = useQuery({
    queryKey: ['onboarding-checklist', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      // Fetch profile data
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, bio, avatar_url, location')
        .eq('id', user.id)
        .single();

      // Fetch verification status
      const { data: verification } = await supabase
        .from('identity_verifications')
        .select('status')
        .eq('user_id', user.id)
        .maybeSingle();

      // Check for first request (for requesters)
      const { data: requests } = await supabase
        .from('requests')
        .select('id')
        .eq('user_id', user.id)
        .limit(1);

      // Check for first proposal (for providers)
      const { data: proposals } = await supabase
        .from('proposals')
        .select('id')
        .eq('provider_id', user.id)
        .limit(1);

      return {
        hasUsername: !!profile?.username,
        hasBio: !!profile?.bio,
        hasAvatar: !!profile?.avatar_url,
        hasLocation: !!profile?.location,
        isVerified: verification?.status === 'approved',
        hasPostedRequest: (requests?.length || 0) > 0,
        hasSubmittedProposal: (proposals?.length || 0) > 0,
      };
    },
    enabled: !!user?.id,
  });

  if (!checklistData) return null;

  const steps = [
    { id: 'account', label: 'Account created', completed: true, link: null },
    { id: 'username', label: 'Username set', completed: checklistData.hasUsername, link: '/settings' },
    { id: 'avatar', label: 'Profile picture uploaded', completed: checklistData.hasAvatar, link: '/settings' },
    ...(activeRole === 'provider' 
      ? [
          { id: 'verification', label: 'Identity verified', completed: checklistData.isVerified, link: '/identity-verification' },
          { id: 'firstProposal', label: 'First proposal sent', completed: checklistData.hasSubmittedProposal, link: '/feed' },
        ]
      : [
          { id: 'firstRequest', label: 'First request posted', completed: checklistData.hasPostedRequest, link: '/post-request' },
        ]
    ),
  ];

  const completedSteps = steps.filter(s => s.completed).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  // Auto-hide when 100% complete
  if (progress === 100) return null;

  return (
    <Card className="mb-6">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <CardTitle className="text-lg">Getting Started</CardTitle>
              <CardDescription>
                {completedSteps} of {totalSteps} steps completed
              </CardDescription>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            </CollapsibleTrigger>
          </div>
          <Progress value={progress} className="mt-2" />
        </CardHeader>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-3">
              {steps.map((step) => (
                <div key={step.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {step.completed ? (
                      <CheckCircle2 className="h-5 w-5 text-primary" />
                    ) : (
                      <Circle className="h-5 w-5 text-muted-foreground" />
                    )}
                    <span className={step.completed ? "text-muted-foreground" : "font-medium"}>
                      {step.label}
                    </span>
                  </div>
                  {!step.completed && step.link && (
                    <Link to={step.link}>
                      <Button size="sm" variant="outline">
                        Complete
                      </Button>
                    </Link>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}
