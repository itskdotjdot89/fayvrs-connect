import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ReferralEarnings {
  pending_balance: number;
  available_balance: number;
  active_referrals_count: number;
  lifetime_earnings: number;
}

export const useReferralEarnings = (userId: string | undefined) => {
  return useQuery<ReferralEarnings>({
    queryKey: ["referral-earnings", userId],
    queryFn: async () => {
      if (!userId) throw new Error("User ID is required");
      
      // @ts-ignore - Supabase type complexity issue
      const { data, error } = await supabase
        .from("referrer_earnings")
        .select("pending_balance, available_balance, active_referrals_count, lifetime_earnings")
        .eq("referrer_id", userId)
        .single();

      if (error) throw error;
      return data as ReferralEarnings;
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });
};
