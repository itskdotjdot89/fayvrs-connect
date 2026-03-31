# Fayvrs — Complete User Manual & Guide

> **Fayvrs** is a location-based service marketplace that connects people who need help (Customers) with verified local professionals (Providers) — using GPS-powered matching, real-time messaging, video consultations, and AI-assisted proposals.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [User Roles Explained](#user-roles-explained)
3. [Customer Guide](#customer-guide)
4. [Provider Guide](#provider-guide)
5. [The Request & Proposal Workflow](#the-request--proposal-workflow)
6. [Messaging & Video Calls](#messaging--video-calls)
7. [Maps & Location Features](#maps--location-features)
8. [Referral Program](#referral-program)
9. [Subscriptions & Promo Codes](#subscriptions--promo-codes)
10. [Identity Verification (KYC)](#identity-verification-kyc)
11. [Safety & Reporting](#safety--reporting)
12. [Settings & Profile Management](#settings--profile-management)
13. [Tech Stack & Architecture](#tech-stack--architecture)
14. [FAQ](#faq)

---

## Getting Started

### 1. Sign Up

1. Open the app or visit the website.
2. Tap **Sign Up** and enter your email and a password.
3. Verify your email (check your inbox for a confirmation link).
4. You're in!

### 2. Choose Your Role

After signing up you'll see a **Role Selection** screen:

| Option | Who it's for |
|---|---|
| **I want to hire help** (Customer) | People looking for services — cleaning, repairs, moving, etc. |
| **I want to earn money** (Provider) | Professionals who offer services and want local clients. |

> **You can switch roles anytime.** One account gives you access to both sides of the marketplace.

### 3. Onboarding

A short 4-slide walkthrough introduces the platform. You can:
- Tap **Continue** to go through each slide.
- Tap **Skip** to jump straight in.
- Use keyboard arrow keys on desktop.

---

## User Roles Explained

Fayvrs has **two user roles** and one **admin role**:

### Customer (Requester)
- Post service requests (e.g., "Need a plumber", "Help me move").
- Receive proposals from verified providers.
- Compare proposals side-by-side.
- Message and video-call providers.
- Select the best provider for the job.
- **Free to use** — no subscription required.

### Provider
- Browse nearby service requests on a feed and interactive map.
- Submit proposals with pricing and details.
- Use AI to generate professional proposals in seconds.
- Build a portfolio of past work.
- Get matched with jobs automatically based on location and specialty.
- **Requires a subscription** to submit proposals.

### Admin
- Review identity verification submissions (KYC).
- Moderate flagged content in the moderation queue.
- Access admin dashboards at `/admin/kyc-review` and `/admin/moderation-queue`.

---

## Customer Guide

### How to Post a Request

1. Tap **Post Request** from the home screen or bottom nav.
2. Fill in:
   - **Title** — What do you need? (e.g., "Fix leaky faucet")
   - **Description** — Details about the job.
   - **Category** — Select from categories like Handyman, Cleaning, Moving, etc.
   - **Photos** — Upload images showing the work needed.
   - **Budget Range** — Set a min and max budget.
   - **Location** — Enter your address (auto-geocoded to coordinates).
3. Tap **Submit**.

Your request is now live. The system automatically:
- Finds up to **20 nearby providers** within a 25-mile radius.
- Ranks them by distance + specialty match.
- Sends them notifications (in-app, email, and push).

### Reviewing Proposals

1. Go to **My Requests** on your Requester Dashboard.
2. Tap a request to see all proposals.
3. Each proposal shows:
   - Provider name and verification status ✅
   - Proposed price
   - Message/approach
   - Provider's portfolio link
4. Tap a provider's name to view their **Public Profile** and past work.
5. **Accept** the best proposal — the provider is notified immediately.

### Requester Dashboard

Your dashboard shows:
- **Active Requests** — Currently open requests.
- **Proposals Received** — Count of proposals across all requests.
- **Selected Providers** — Jobs you've awarded.
- Quick access to messages and notifications.

---

## Provider Guide

### Setting Up Your Provider Profile

1. **Complete Identity Verification** — Upload a government ID and selfie (see [KYC section](#identity-verification-kyc)).
2. **Set Your Specialties** — Go to **Provider Settings** and add the service categories you offer (e.g., Plumbing, Electrical, Carpentry).
3. **Set Your Service Area** — Enter your location and set your service radius (default: 25 miles).
4. **Build Your Portfolio** — Upload photos of past work with titles and descriptions. Mark your best work as "Featured."
5. **Subscribe** — A Pro subscription is required to submit proposals (see [Subscriptions](#subscriptions--promo-codes)).

### Finding & Responding to Requests

1. Go to the **Feed** to browse all open requests.
   - Use **List View** to scroll through requests.
   - Use **Map View** to see requests plotted on an interactive map.
   - Filter by **category** to find your specialty.
2. Tap a request to see full details, photos, budget, and location.
3. Tap **Submit Proposal**:
   - Write your proposal message (or tap **Generate with AI** to auto-write one).
   - Set your price.
   - Submit.

### Nearby Requests Widget

Your Provider Dashboard includes a **Nearby Requests** widget that shows:
- Requests within your service radius.
- Distance from your current location.
- Budget range and category.
- One-tap access to view details and submit proposals.

### Provider Dashboard

Your dashboard shows:
- **Subscription Status** — Current plan and expiration.
- **Proposals Sent** — Total proposals submitted.
- **Proposals Accepted** — How many you've won.
- **Nearby Requests** — Live feed of local opportunities.
- **Referral Earnings** — If you've referred other providers.

---

## The Request & Proposal Workflow

Here's the full lifecycle of a job on Fayvrs:

```
Customer posts request
        ↓
System matches nearby providers (GPS + specialty scoring)
        ↓
Providers receive notifications (in-app, email, push)
        ↓
Providers view request details and submit proposals
        ↓
Customer reviews and compares proposals
        ↓
Customer accepts a proposal → Provider is notified
        ↓
Both parties communicate via messaging or video call
        ↓
Job is completed
```

### AI-Powered Proposals

Providers can use AI to generate proposals:
- The AI reads the request details and the provider's profile.
- It writes a professional, personalized proposal.
- Suggests competitive pricing based on market data.
- Providers can edit before submitting.
- Saves 10–15 minutes per proposal.

---

## Messaging & Video Calls

### Direct Messaging

- Tap **Message** on any provider profile or request.
- Messages are delivered **instantly** via real-time WebSocket connections.
- Read receipts show when your message has been seen.
- All messages are stored securely and accessible from the **Conversations** page.

### Video Consultations (WebRTC)

Fayvrs includes **built-in video calling** — no Zoom or Google Meet needed.

1. Open a conversation with a provider or customer.
2. Tap the **Video Call** button.
3. The other person receives an **Incoming Call** notification with Accept/Decline options.
4. During the call:
   - Mute/unmute your microphone.
   - Turn camera on/off.
   - End call anytime.

**Use cases:**
- Virtual site visits before a provider drives out.
- Show exactly what needs fixing via your phone camera.
- Face-to-face trust-building before hiring.

---

## Maps & Location Features

### GPS Radius Matching

Fayvrs uses your **real-time GPS location** to:
- Match you with requests/providers within your service radius.
- Calculate accurate distances between you and opportunities.
- Show your position on the interactive map.

**How it works:**
- Your location updates automatically every **30 seconds**.
- Updates only send when you've moved more than **10 meters** (saves battery).
- Your "current location" (live GPS) is separate from your "service area" (the address on your profile).

### Interactive Map Views

The **Feed** page has two tabs:
- **List View** — Traditional scrollable list of requests.
- **Map View** — Interactive Mapbox map showing:
  - 📍 Request locations as markers.
  - 🟢 Provider locations with pulsing dots (online providers).
  - Color-coded markers by category.
  - Tap a marker to see details.
  - Service radius circles showing coverage area.

### Online/Offline Presence

- A **green pulsing dot** shows when a user is online.
- Activity timestamps show: "Active now", "Active 5m ago", "Active 2h ago", etc.
- Helps you know who can respond right now.

---

## Referral Program

### How It Works

1. **Get your referral link** — Go to **Referral Dashboard** (`/referrals`).
2. **Share your link** — Send it to other service providers.
3. **They sign up & subscribe** — When your referral subscribes to a Pro plan, you earn a commission.
4. **Get paid** — Commissions appear in your earnings dashboard.

### Commission Details

| Detail | Value |
|---|---|
| Commission Rate | **20%** of each subscription payment |
| Duration | First **12 months** of the referred user's subscription |
| Pending Period | **30 days** (fraud protection) |
| Minimum Withdrawal | **$100** |
| Payout Methods | PayPal, Venmo, ACH Bank Transfer |

### Referral Link Attribution

Your referral link works in **two ways**:

1. **Direct (Web):** If someone clicks your link and signs up in the same browser, the referral code is stored locally and applied at signup.

2. **Deferred Deep Link (Native App):** If someone clicks your link on the web but later downloads and opens the native app to sign up, Fayvrs uses **server-side fingerprint matching** (IP address + browser info) to automatically credit you — even though the original browser data is inaccessible to the app.

**Attribution window:** 7 days from click to signup.

### Referral Dashboard

Your dashboard shows:
- **Available Balance** — Ready to withdraw.
- **Pending Balance** — Within the 30-day holding period.
- **Active Referrals** — Number of referred users with active subscriptions.
- **Lifetime Earnings** — Total earned all-time.
- **Withdrawal History** — Past payouts and status.

---

## Subscriptions & Promo Codes

### Provider Subscription Plans

Providers need an active subscription to submit proposals.

| Plan | Price |
|---|---|
| Monthly | **$29.99/month** |
| Annual | **$239.99/year** (save ~33%) |

Subscriptions are managed through:
- **iOS** — Apple In-App Purchase
- **Android** — Google Play Billing
- **Web** — RevenueCat Web Billing

### Promo Codes

During the launch campaign, providers can redeem a promo code for a **free 1-year Pro subscription**:

1. Go to the **Provider Paywall** page.
2. Expand the **"Have a promo code?"** section.
3. Enter the code and tap **Redeem**.
4. If valid, your Pro subscription activates immediately for 365 days.

> The current active promo code is **FAYVRS5000** (limited to 5,000 redemptions).

### Managing Your Subscription

- View your plan details at **Settings → Subscription Details**.
- Subscription auto-renews unless cancelled through your app store.
- See billing history and next renewal date.

---

## Identity Verification (KYC)

### Why Verify?

Verification builds trust. Verified providers get a ✅ badge on their profile, which significantly increases their chances of being selected.

### How to Verify

1. Go to **Identity Verification** (prompted during onboarding for providers, or accessible from Settings).
2. **Upload a Government-Issued ID** — Driver's license, passport, or state ID.
3. **Take a Selfie** — A live photo to match your ID.
4. **Submit for Review** — An admin reviews your submission within 24–48 hours.
5. **Get Verified** — Once approved, your ✅ badge appears across the platform.

### Verification Statuses

| Status | Meaning |
|---|---|
| **Not Submitted** | You haven't started verification. |
| **Pending** | Submitted and awaiting admin review. |
| **Approved** ✅ | You're verified! Badge visible on your profile. |
| **Rejected** | Submission didn't pass review. You can resubmit. |

---

## Safety & Reporting

### Safety Center

Accessible from **Settings → Safety Center**, it covers:
- Tips for meeting service providers safely.
- Payment fraud prevention.
- Emergency contact information.
- In-app messaging safety guidelines.

### Reporting Users, Requests, or Messages

1. Tap the **Report** button (⚠️) on any profile, request, or message.
2. Select a reason from the dropdown.
3. Add optional details.
4. Submit — the report goes to the admin moderation queue.

### Content Moderation

All posted requests go through **AI-powered moderation**:
- Automatically checks for prohibited content (illegal services, adult content, weapons, etc.).
- High-risk content is auto-rejected.
- Medium/low-risk content is flagged for admin review.
- Clean content publishes immediately.

### Account Deletion

You can delete your account at any time:
1. Go to **Settings**.
2. Tap **Delete Account**.
3. Confirm the action.
4. All your data is permanently removed (profile, requests, proposals, messages, subscriptions).

---

## Settings & Profile Management

### Profile Settings

- **Avatar** — Upload a profile photo.
- **Full Name** — Your display name.
- **Username** — Unique handle (e.g., @yourname).
- **Bio** — Short description about you.
- **Phone** — Contact number (optional).
- **Location** — Your primary address.
- **Email** — Your login email (view only).

### Notification Preferences

Toggle independently:
- **Email notifications** — New proposals, messages, etc.
- **Push notifications** — Real-time alerts on your device.
- **In-app notifications** — Bell icon alerts within the app.
- **SMS notifications** — Text message alerts (when enabled).

### Role Switching

If you have both roles:
1. Tap the **role switcher** in the top bar (shows "Customer" or "Provider").
2. Select the other role.
3. Confirm the switch.
4. You're redirected to the appropriate dashboard.

---

## Tech Stack & Architecture

### Frontend
| Technology | Purpose |
|---|---|
| **React 18** | Component-based UI framework |
| **TypeScript** | Type-safe JavaScript |
| **Vite** | Fast build tool and dev server |
| **Tailwind CSS** | Utility-first styling with design tokens |
| **shadcn/ui** | Accessible, customizable component library |
| **React Router** | Client-side page routing |
| **React Query** | Server state management and caching |
| **Mapbox GL** | Interactive maps and geospatial visualization |
| **Embla Carousel** | Touch-friendly onboarding carousel |

### Backend (Lovable Cloud / Supabase)
| Technology | Purpose |
|---|---|
| **PostgreSQL** | Relational database with PostGIS for geo queries |
| **Row-Level Security (RLS)** | Database-level access control on every table |
| **Edge Functions** | 18+ serverless TypeScript functions |
| **Realtime** | WebSocket channels for live updates |
| **Storage** | Secure cloud file storage with CDN |
| **Auth** | Email/password authentication with JWT |

### Integrations
| Service | Purpose |
|---|---|
| **RevenueCat** | Cross-platform subscription management (iOS, Android, Web) |
| **Mapbox** | Geocoding, reverse geocoding, interactive maps |
| **OpenAI** | AI proposal generation, request analysis, content moderation |
| **WebRTC** | Peer-to-peer video/audio calls with STUN servers |
| **Capacitor 7** | Native mobile app wrapper (iOS & Android) |

### Database Tables (18 Core Tables)

| Table | Purpose |
|---|---|
| `profiles` | User profiles with location, bio, avatar |
| `user_roles` | Role assignments (requester, provider, admin) |
| `requests` | Service requests with details, location, moderation status |
| `proposals` | Provider proposals linked to requests |
| `messages` | Direct messages between users |
| `notifications` | In-app notification records |
| `notification_preferences` | Per-user notification channel settings |
| `identity_verifications` | KYC submissions (ID doc, selfie, status) |
| `provider_specialties` | Provider service categories |
| `provider_subscriptions` | Active subscription records |
| `portfolio_items` | Provider portfolio photos and descriptions |
| `call_sessions` | Video call session records |
| `call_signals` | WebRTC signaling data |
| `referral_codes` | Unique referral codes per user |
| `referral_relationships` | Referrer → referred user connections |
| `referral_commissions` | Commission records per payment |
| `referrer_earnings` | Aggregated earnings balances |
| `referral_withdrawals` | Payout requests and status |
| `referral_link_clicks` | Click tracking for deferred deep linking |
| `promo_codes` | Promotional codes for free subscriptions |
| `promo_redemptions` | Records of redeemed promo codes |
| `user_reports` | User-submitted reports (flagged content) |
| `rate_limits` | API rate limiting records |

### Edge Functions (18 Serverless Functions)

| Function | Purpose |
|---|---|
| `analyze-request-openai` | AI content analysis and moderation |
| `apply-referral-code` | Apply referral code + deferred deep link matching |
| `delete-user-account` | Complete account and data deletion |
| `generate-proposal` | AI-powered proposal generation |
| `geocode-location` | Address → coordinates conversion |
| `get-market-pricing` | Market rate suggestions for proposals |
| `match-providers` | Find and rank nearby providers for a request |
| `notify-provider` | Send email notification to a single provider |
| `notify-providers` | Batch notify matched providers |
| `process-pending-commissions` | Move commissions from pending → available |
| `redeem-promo-code` | Validate and activate promo codes |
| `request-password-reset` | Password reset email flow |
| `request-withdrawal` | Process referral earnings withdrawal |
| `revenuecat-webhook` | Handle subscription events from RevenueCat |
| `reverse-geocode` | Coordinates → address conversion |
| `send-email-notification` | Generic transactional email sender |
| `send-founder-notification` | Alert founders of important platform events |
| `setup-demo-accounts` | Create demo accounts for app store review |
| `update-verification-status` | Admin action to approve/reject KYC |
| `validate-referral-code` | Check referral code validity and track clicks |
| `get-revenuecat-native-key` | Securely provide RevenueCat SDK keys |
| `get-revenuecat-web-key` | Securely provide RevenueCat web billing key |

### Real-Time Channels

The following data streams update in real-time (no page refresh needed):
- **Messages** — Instant message delivery.
- **Notifications** — New proposal alerts, request matches.
- **Location** — Provider position updates on maps.
- **Presence** — Online/offline status changes.
- **Call Signaling** — WebRTC call setup and teardown.

### Security Architecture

- **Row-Level Security (RLS)** on every database table.
- **JWT authentication** for all API requests.
- **Service role keys** restricted to backend Edge Functions only.
- **File isolation** — Users can only access their own uploads.
- **P2P video encryption** via WebRTC (no server recording).
- **AI content moderation** blocks prohibited content before publication.
- **Rate limiting** prevents API abuse.

---

## FAQ

### General

**Q: Is Fayvrs free?**
A: For customers (requesters), yes — posting requests and hiring providers is completely free. Providers need a subscription ($29.99/mo or $239.99/yr) to submit proposals.

**Q: Can I be both a customer and a provider?**
A: Yes! One account supports both roles. Switch between them anytime using the role switcher.

**Q: What areas does Fayvrs cover?**
A: Fayvrs works anywhere. Provider matching uses GPS coordinates, so it works in any city or region where providers have signed up.

### For Customers

**Q: How many proposals will I get?**
A: The system notifies up to 20 matched providers per request. The number of proposals depends on provider availability in your area.

**Q: How do I know a provider is trustworthy?**
A: Look for the ✅ verified badge. Verified providers have completed identity verification (government ID + selfie review).

**Q: Can I message a provider before accepting their proposal?**
A: Yes! Use the in-app messaging or video call features to discuss details before making a decision.

### For Providers

**Q: How do I get more job matches?**
A: Make sure your specialties, location, and service radius are set accurately. Complete your portfolio and identity verification for the ✅ badge.

**Q: Can I use the AI proposal writer?**
A: Yes, when submitting a proposal, tap "Generate with AI." It reads the request details and your profile to write a personalized proposal. You can edit it before submitting.

**Q: What happens if my subscription expires?**
A: You can still browse requests and receive messages, but you won't be able to submit new proposals until you resubscribe.

### Referrals

**Q: When do I get paid for referrals?**
A: Commissions enter a 30-day pending period after each payment. Once cleared, they move to your available balance. Withdraw when you reach $100.

**Q: What if my referral signs up on the app after clicking my link on the web?**
A: Fayvrs uses server-side deferred deep linking. If they sign up within 7 days of clicking your link, you'll automatically get credit — even if they switch from web to the native app.

### Technical

**Q: Does Fayvrs work on mobile?**
A: Yes. Fayvrs is a Progressive Web App (PWA) that also has native iOS and Android apps built with Capacitor.

**Q: Is my data secure?**
A: Yes. All data is protected by row-level security, encrypted in transit (HTTPS), and encrypted at rest. Video calls use P2P encryption. You can delete your account and all associated data at any time.

---

## Support

- **Email:** support@fayvrs.com
- **In-App:** Settings → Support
- **Safety Concerns:** Settings → Safety Center

---

*Document Version: 1.0*
*Last Updated: March 2026*
*Platform: Fayvrs Service Marketplace*
