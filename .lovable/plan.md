

## Plan: Server-Side Deferred Deep Linking for Referral Attribution

### Problem
When a user without the app clicks a referral link, the code is stored in the browser's `localStorage`. After downloading and opening the native app, that `localStorage` is inaccessible — the referral attribution is lost.

### Solution
Use the existing `referral_link_clicks` table (which already stores `ip_address` and `user_agent`) to match new signups to prior referral clicks server-side — a fingerprint-based deferred deep link.

### Changes

#### 1. New Edge Function: `match-deferred-referral`
- Called after signup when no referral code was explicitly provided
- Accepts the user's IP and user agent
- Queries `referral_link_clicks` for unconverted clicks matching that fingerprint within the last 7 days
- If a match is found, automatically creates the `referral_relationship` (same logic as `apply-referral-code`)
- Marks the click as converted

#### 2. Update `AuthContext.tsx` — Post-Signup Hook
- After a successful signup **without** a referral code (no `localStorage` code), call `match-deferred-referral`
- Pass no sensitive data from client — the edge function reads IP/user-agent from request headers

#### 3. Update `apply-referral-code` Edge Function
- Add a fallback: if no explicit `referral_code` is provided in the body, attempt the fingerprint match
- This keeps the logic centralized rather than adding a separate function

### Revised Approach (Simpler)
Instead of a new edge function, extend `apply-referral-code` to accept an optional `attempt_deferred_match: true` flag. When set (and no `referral_code` provided), it performs the IP/user-agent fingerprint lookup.

### Implementation Details

**In `apply-referral-code/index.ts`:**
- Add a new code path: if `referral_code` is missing but `attempt_deferred_match` is true
- Read IP from `x-forwarded-for` header, user agent from `user-agent` header
- Query `referral_link_clicks` where `converted_to_signup = false`, matching IP + user agent, within last 7 days, ordered by most recent
- If found, resolve the `referral_code_id` → get the referral code → proceed with existing relationship creation logic
- If no match, return `{ success: false, message: "No matching referral found" }` (non-error)

**In `AuthContext.tsx` (`signUp` function):**
- After signup succeeds, if no `referralCode` was provided via `localStorage`:
  ```typescript
  await supabase.functions.invoke('apply-referral-code', {
    body: { attempt_deferred_match: true }
  });
  ```
- This runs silently — no user-facing error if it fails

**In `ReferralLanding.tsx`:**
- No changes needed — it already records clicks with IP/user-agent via `validate-referral-code`

### Security Considerations
- Fingerprint matching uses IP + user agent + 7-day window to minimize false positives
- Only matches unconverted clicks (prevents double attribution)
- Self-referral check remains in place
- The match is best-effort; false positives are low-risk (free trial credit)

