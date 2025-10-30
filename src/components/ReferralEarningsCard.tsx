import { useNavigate } from "react-router-dom";
import { DollarSign, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useReferralEarnings } from "@/hooks/useReferralEarnings";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

interface ReferralEarningsCardProps {
  variant?: "full" | "compact";
  className?: string;
}

export function ReferralEarningsCard({ variant = "full", className }: ReferralEarningsCardProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: earnings, isLoading } = useReferralEarnings(user?.id);

  if (isLoading) {
    return variant === "compact" ? (
      <Skeleton className="h-32" />
    ) : (
      <Skeleton className="h-48" />
    );
  }

  const availableBalance = earnings?.available_balance || 0;
  const pendingBalance = earnings?.pending_balance || 0;
  const activeReferrals = earnings?.active_referrals_count || 0;

  if (variant === "compact") {
    return (
      <Card 
        className={cn("cursor-pointer hover:shadow-md transition-shadow", className)}
        onClick={() => navigate('/referrals')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Referral Earnings</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${availableBalance.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">Available to withdraw</p>
        </CardContent>
      </Card>
    );
  }

  // Full variant
  return (
    <div className={cn("bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-card p-6 shadow-soft text-white space-y-4", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          <h3 className="font-semibold">Referral Earnings</h3>
        </div>
        <TrendingUp className="w-5 h-5" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <p className="text-xs opacity-80">Available</p>
          <p className="text-xl font-bold">${availableBalance.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs opacity-80">Pending</p>
          <p className="text-xl font-bold">${pendingBalance.toFixed(2)}</p>
        </div>
        <div>
          <p className="text-xs opacity-80">Referrals</p>
          <p className="text-xl font-bold flex items-center gap-1">
            <Users className="w-4 h-4" />
            {activeReferrals}
          </p>
        </div>
      </div>

      <Button 
        size="sm" 
        variant="secondary" 
        className="w-full rounded-xl"
        onClick={() => navigate('/referrals')}
      >
        View Full Dashboard
      </Button>
    </div>
  );
}
