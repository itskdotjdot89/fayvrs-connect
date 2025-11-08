import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, DollarSign, Users, TrendingUp } from 'lucide-react';

export default function ReferralDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [referralCode, setReferralCode] = useState('');
  const [earnings, setEarnings] = useState<any>(null);
  const [payoutMethod, setPayoutMethod] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadReferralData();
  }, [user]);

  const loadReferralData = async () => {
    if (!user) return;

    const { data: codeData, error: codeError } = await supabase
      .from('referral_codes')
      .select('code, referral_link')
      .eq('user_id', user.id)
      .maybeSingle();

    const { data: earningsData, error: earningsError } = await supabase
      .from('referrer_earnings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (codeError) {
      console.error('Error loading referral code:', codeError);
      toast({ title: 'Error', description: 'Failed to load referral code', variant: 'destructive' });
    }

    if (earningsError) {
      console.error('Error loading earnings:', earningsError);
    }

    if (codeData) {
      // Ensure referral_link has leading slash
      const path = codeData.referral_link?.startsWith('/') 
        ? codeData.referral_link 
        : `/${codeData.referral_link}`;
      
      // Construct full URL with proper domain
      const fullUrl = `${window.location.origin}${path}`;
      setReferralCode(fullUrl);
    }
    if (earningsData) {
      setEarnings(earningsData);
      setPayoutMethod(earningsData.preferred_payout_method || '');
    }
  };

  const copyReferralLink = () => {
    navigator.clipboard.writeText(referralCode);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
  };

  const requestWithdrawal = async () => {
    if (!earnings || earnings.available_balance < 100) {
      toast({ title: 'Error', description: 'Minimum withdrawal is $100', variant: 'destructive' });
      return;
    }

    setLoading(true);
    const { error } = await supabase.functions.invoke('request-withdrawal', {
      body: { amount: earnings.available_balance, payout_method: payoutMethod },
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Withdrawal request submitted!' });
      loadReferralData();
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-6 space-y-6">
        <h1 className="text-3xl font-bold">Referral Dashboard</h1>

        <div className="grid md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Pending Balance</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earnings?.pending_balance || 0}</div>
              <p className="text-xs text-muted-foreground">Available in 30 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Available Balance</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earnings?.available_balance || 0}</div>
              <p className="text-xs text-muted-foreground">Ready to withdraw</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Active Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{earnings?.active_referrals_count || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Lifetime Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${earnings?.lifetime_earnings || 0}</div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Your Referral Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input value={referralCode} readOnly />
              <Button onClick={copyReferralLink}><Copy className="h-4 w-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Withdraw Earnings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Payout Method</Label>
              <Select value={payoutMethod} onValueChange={setPayoutMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Select method" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="stripe_connect">Bank Transfer (Stripe)</SelectItem>
                  <SelectItem value="paypal">PayPal</SelectItem>
                  <SelectItem value="subscription_credit">Apply to Subscription</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              onClick={requestWithdrawal} 
              disabled={!payoutMethod || loading || (earnings?.available_balance || 0) < 100}
              className="w-full"
            >
              Request Withdrawal (Minimum $100)
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
