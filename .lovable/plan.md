
# App Store Rejection Resolution Plan

## Summary of Issues

Apple's review team identified two problems with the Fayvrs app submission:

1. **Bug: "Request not found" error** - After signing in as a provider, the app displays a "request not found" error, and tapping "Get Started" redirects to signup
2. **In-App Purchases not locatable** - Reviewers couldn't find the subscription options (Fayvrs Monthly, Fayvrs Yearly) within the app

---

## Issue 1: "Request Not Found" and Navigation Bug

### Root Cause Analysis

After examining the code, I've identified several potential causes:

1. **iPad-specific layout issue**: The app uses different layouts based on screen width (768px breakpoint). iPads typically exceed this, using the desktop `Layout.tsx` instead of `MobileLayout.tsx`. This could cause different navigation behavior.

2. **Stale route navigation**: When a provider signs in and their `activeRole` isn't properly set, they may be directed to a request details page (`/request/:id`) with an invalid ID from cache or a previous session.

3. **"Get Started" button behavior**: In the desktop layout (`Layout.tsx`), the "Get Started" button is only shown for non-authenticated users and links to `/auth`. If the reviewer sees this after signing in, it suggests the authentication state isn't being properly recognized on iPad.

4. **Demo data staleness**: The demo requests in the database are from December 2025. If the reviewer is viewing a request that was deleted or expired, they'd see "Request not found."

### Fixes Required

**Fix 1.1: Ensure demo provider has active subscription**
- Re-enable the demo provider's subscription in `provider_subscriptions` table
- This ensures the demo account works correctly for testing

**Fix 1.2: Improve "Request not found" error handling**
- Update `RequestDetails.tsx` to provide a better error experience
- Add a "Browse All Requests" button instead of relying on "Get Started"
- Show helpful context about why the request might be unavailable

**Fix 1.3: Ensure layout consistency on iPad**
- Review the mobile breakpoint logic to ensure iPad gets appropriate treatment
- Consider treating iPad as mobile for navigation purposes since it's a native app

**Fix 1.4: Add fresh demo requests**
- Create new demo requests with current dates
- Ensure there are always valid requests for reviewers to view

---

## Issue 2: In-App Purchases Not Locatable

### Root Cause Analysis

The reviewer couldn't find the IAPs because:

1. **No clear path to subscription screen**: The app shows subscription options on `/provider-paywall`, but reviewers need explicit steps to get there
2. **Native paywall presentation**: On iOS, the app uses `RevenueCatUI.presentPaywall()` which requires tapping a specific button
3. **Demo account subscription status**: If the demo provider already has an active subscription, they won't see the purchase options (the page redirects to `/feed`)

### Fixes Required

**Fix 2.1: Make IAP access more discoverable**
- Add a prominent "Subscribe" or "Upgrade to Pro" button on the Provider Dashboard for non-subscribers
- Ensure the paywall is accessible from Settings page

**Fix 2.2: Provide clear review instructions**
In the App Store Connect Review Notes, provide explicit steps:

```text
To test In-App Purchases:

1. Sign in with demo account: demo-requester@fayvrs.com / DemoPass123!
   (Note: demo-provider@fayvrs.com may have an active subscription from testing)

2. Navigate to subscription options via ONE of these paths:
   - Home screen → Tap "I want to earn money" → "Subscribe Now"
   - OR: Settings → tap your profile → "Become a Provider"
   - OR: Direct URL: /provider-paywall

3. On the Provider Paywall screen, tap "View Subscription Options"

4. This will present the native StoreKit purchase sheet with:
   - Fayvrs Monthly ($29.99/month)
   - Fayvrs Yearly ($239.99/year)

Both products include a 7-day free trial.

Alternative test: Create a new account and select "I want to earn money" during onboarding to immediately see subscription options.
```

**Fix 2.3: Ensure demo account doesn't have active subscription**
- Clear any existing subscription for demo accounts before submission
- Or use a fresh demo account that hasn't subscribed

---

## Technical Implementation Details

### File Changes Required

1. **`src/pages/RequestDetails.tsx`** (lines 119-141)
   - Improve error state UI with clearer navigation options
   - Replace generic "Get Started" text with "Browse Requests"

2. **`src/pages/ProviderDashboard.tsx`** (lines 237-252)
   - Make the "Subscribe Now" button more prominent
   - Add clear visual hierarchy for non-subscribers

3. **`src/pages/Settings.tsx`**
   - Add a visible link to subscription management/paywall for providers

4. **Database changes**
   - Re-create demo provider subscription with active status
   - Add fresh sample requests with current timestamps

5. **App Store Connect Review Notes**
   - Update with explicit step-by-step instructions for IAP testing
   - Provide alternative paths to find subscription options

---

## Pre-Submission Checklist

Before resubmitting, verify:

- [ ] Demo provider account (demo-provider@fayvrs.com) has NO active subscription (to show purchase flow)
- [ ] Demo requester account (demo-requester@fayvrs.com) works for browsing requests
- [ ] At least 5 sample requests exist with recent dates
- [ ] IAP products (Monthly & Yearly) are "Ready to Submit" in App Store Connect
- [ ] Paid Apps Agreement is accepted in App Store Connect Business section
- [ ] Test on iPad Air 11-inch simulator to verify layout works correctly
- [ ] RevenueCat sandbox testing works with a Sandbox Tester account
- [ ] Build number is incremented (use build 13 for version 1.0.3)

---

## Response to Apple

After implementing fixes, reply to Apple with:

1. Acknowledgment of the bug fix for "request not found" error
2. Clear step-by-step instructions to locate IAPs
3. Demo account credentials that will show the subscription flow
4. Confirmation that Paid Apps Agreement is accepted and IAPs are configured in sandbox
