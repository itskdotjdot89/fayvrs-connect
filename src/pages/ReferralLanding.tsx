import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Gift } from 'lucide-react';

export default function ReferralLanding() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [referrerInfo, setReferrerInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const validateCode = async () => {
      if (!code) {
        setError('No referral code provided');
        setLoading(false);
        return;
      }

      try {
        const { data, error: invokeError } = await supabase.functions.invoke('validate-referral-code', {
          body: { code },
        });

        if (invokeError) {
          console.error('Referral validation error:', invokeError);
          setError('Unable to validate referral code');
          setLoading(false);
          return;
        }

        if (data?.valid) {
          setReferrerInfo(data);
          localStorage.setItem('referral_code', code);
          localStorage.setItem('referral_expires', String(Date.now() + 7 * 24 * 60 * 60 * 1000));
        } else {
          setError(data?.message || 'Invalid referral code');
        }
      } catch (err) {
        console.error('Network error validating referral:', err);
        setError('Connection error. Please try again.');
      }
      
      setLoading(false);
    };

    validateCode();
  }, [code]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Validating referral code...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/10 to-background">
      <Card className="max-w-md w-full p-8 text-center space-y-6">
        <Gift className="w-16 h-16 mx-auto text-primary" />
        <h1 className="text-3xl font-bold">Welcome to Fayvrs!</h1>
        
        {referrerInfo && (
          <div className="space-y-4">
            <div className="flex items-center justify-center gap-3">
              <Avatar>
                <AvatarImage src={referrerInfo.referrer_avatar} />
                <AvatarFallback>{referrerInfo.referrer_name[0]}</AvatarFallback>
              </Avatar>
              <p className="text-muted-foreground">
                You've been invited by <strong>{referrerInfo.referrer_name}</strong>
              </p>
            </div>
            
            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-xl font-semibold text-primary">🎉 Special Offer!</p>
              <p className="text-sm mt-2">{referrerInfo.discount_offer}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="space-y-4">
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm text-muted-foreground">
              You can still sign up and join Fayvrs!
            </p>
          </div>
        )}

        <Button onClick={() => navigate('/auth')} size="lg" className="w-full">
          {referrerInfo ? 'Sign Up Now' : 'Continue to Sign Up'}
        </Button>
      </Card>
    </div>
  );
}
