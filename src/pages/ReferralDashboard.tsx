import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Copy, DollarSign, Users, TrendingUp, Info, Clock, Gift, HelpCircle } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

    // Fetch both queries in parallel for better performance
    const [codeResult, earningsResult] = await Promise.all([
      supabase
        .from('referral_codes')
        .select('code, referral_link')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase
        .from('referrer_earnings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle()
    ]);

    const { data: codeData, error: codeError } = codeResult;
    const { data: earningsData, error: earningsError } = earningsResult;

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

        {/* Quick Summary */}
        <Alert className="bg-primary/5 border-primary/20">
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="font-semibold">Earn 20% commission for 12 months</span>
              <span>•</span>
              <span>Up to $72 per referral</span>
              <span>•</span>
              <span>$100 minimum withdrawal</span>
            </div>
          </AlertDescription>
        </Alert>

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

        {/* How It Works Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              How the Referral Program Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="how-it-works">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>How It Works</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Share your unique referral link with service providers</li>
                    <li>They sign up and subscribe to a plan (receive 30-day free trial)</li>
                    <li>You earn 20% commission on their subscription for 12 months</li>
                    <li>Commissions become available after 30-day holding period</li>
                    <li>Withdraw earnings once you reach $100 minimum balance</li>
                  </ol>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="commission">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    <span>Commission Structure</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p className="font-semibold text-foreground">Earn 20% commission for 12 months on each referral</p>
                  <div className="space-y-2">
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-foreground">Monthly Plan ($29.99/month)</p>
                      <p>$6 per month × 12 months = <span className="font-bold text-foreground">$72 total</span></p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium text-foreground">Annual Plan ($239.99/year)</p>
                      <p>$48 for the year = <span className="font-bold text-foreground">$48 total</span></p>
                    </div>
                  </div>
                  <p className="pt-2">
                    <span className="font-semibold text-foreground">Example:</span> 5 active monthly referrals = $360 per year potential earnings
                  </p>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="timeline">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    <span>Payment Timeline</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <div className="space-y-3">
                    <div>
                      <p className="font-medium text-foreground">When Commissions Are Earned:</p>
                      <p>On each subscription payment from your referred provider</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">30-Day Holding Period:</p>
                      <p>Commissions are held for 30 days to protect against refunds and chargebacks</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Available Balance:</p>
                      <p>After the holding period, earnings move to your available balance for withdrawal</p>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">Withdrawal:</p>
                      <p>Request anytime once you have $100 or more in available balance</p>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="withdrawal">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    <span>Withdrawal Options</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p className="font-semibold text-foreground">Minimum: $100</p>
                  <div className="space-y-2">
                    <p><span className="font-medium text-foreground">Bank Transfer:</span> Direct deposit to your bank account</p>
                    <p><span className="font-medium text-foreground">PayPal:</span> Transfer to your PayPal account</p>
                    <p><span className="font-medium text-foreground">Subscription Credit:</span> Apply earnings toward your own subscription</p>
                  </div>
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="benefits">
                <AccordionTrigger>
                  <div className="flex items-center gap-2">
                    <Gift className="h-4 w-4" />
                    <span>Referral Benefits</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="space-y-3 text-muted-foreground">
                  <p className="font-semibold text-foreground">What Your Referrals Get:</p>
                  <div className="space-y-2">
                    <p>✓ <span className="font-medium text-foreground">30-Day Free Trial</span> - Full access to try the platform risk-free</p>
                    <p>✓ <span className="font-medium text-foreground">No Credit Card Required</span> - Easy signup process</p>
                    <p>✓ <span className="font-medium text-foreground">Full Platform Access</span> - All features available during trial</p>
                  </div>
                  <p className="pt-2 text-sm">
                    Share this benefit when inviting providers to increase sign-up rates!
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>

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
                  <SelectItem value="stripe_connect">Bank Transfer</SelectItem>
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
