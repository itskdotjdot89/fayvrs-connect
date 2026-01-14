# Fayvrs Legal & Compliance Documentation

**Last Updated:** January 2026

This document provides a comprehensive overview of Fayvrs' legal and compliance infrastructure, designed to meet App Store, Google Play, GDPR, CCPA, and marketplace safety requirements.

---

## Table of Contents

1. [Overview](#overview)
2. [Legal Pages](#legal-pages)
3. [Compliance Systems](#compliance-systems)
4. [App Store Requirements](#app-store-requirements)
5. [Data Protection & Privacy](#data-protection--privacy)
6. [Safety & Trust Systems](#safety--trust-systems)
7. [Testing & Verification](#testing--verification)
8. [Developer Resources](#developer-resources)

---

## Overview

Fayvrs is a location-based service marketplace connecting requesters with local service providers. As a platform facilitating real-world services and transactions, we implement comprehensive compliance measures across:

- **Legal**: Terms, privacy, community standards, refund policies
- **Safety**: User verification, content moderation, reporting systems
- **Privacy**: Data protection, user rights, transparent collection practices
- **Payments**: Subscription transparency, billing disclosures, RevenueCat integration (iOS, Android, Web)
- **Platform Policies**: App Store and Google Play requirements

---

## Legal Pages

All legal pages are accessible via:
- Footer links on desktop
- Settings → App & Legal on mobile
- Direct URL routes

### Implemented Pages

| Page | Route | Purpose | Status |
|------|-------|---------|--------|
| **Privacy Policy** | `/privacy-policy` | GDPR/CCPA compliance, data collection disclosure | ✅ Live |
| **Terms of Service** | `/terms-of-service` | Legal agreement, liability, user obligations | ✅ Live |
| **Community Guidelines** | `/community-guidelines` | Acceptable use, prohibited content, user conduct | ✅ Live |
| **Refund Policy** | `/refund-policy` | Provider subscription refunds, dispute resolution | ✅ Live |
| **Safety Center** | `/safety-center` | Safety tips, meeting guidelines, emergency resources | ✅ Live |
| **Subscription Details** | `/subscription-details` | Pricing, billing cycle, cancellation, payment disclosure | ✅ Live |

### Legal Page Features

Each legal page includes:
- ✅ Clear, readable headings and sections
- ✅ Mobile-responsive design
- ✅ Easy navigation back to Settings
- ✅ Last updated timestamp
- ✅ Plain language explanations
- ✅ Contact information for questions

---

## Compliance Systems

### 1. KYC & Identity Verification

**Purpose:** Verify provider identities to build trust and prevent fraud

**Implementation:**
- **Component:** `src/pages/IdentityVerification.tsx`
- **Status Display:** `src/components/VerificationStatus.tsx`
- **Admin Review:** `src/pages/admin/KYCReview.tsx`
- **Database:** `identity_verifications` table

**Process:**
1. Provider uploads government-issued ID
2. Provider uploads selfie for facial verification
3. Documents stored securely in Supabase Storage
4. Admin reviews submission
5. Status: pending → approved/rejected
6. Verified badge displays on profile

**Admin Access:** `/admin/kyc-review` (admin role required)

---

### 2. Content Moderation

**Purpose:** Prevent prohibited content, comply with App Store safety rules

**Implementation:**
- **AI Analysis:** `supabase/functions/analyze-request-openai/index.ts`
- **Admin Queue:** `src/pages/admin/ModerationQueue.tsx`
- **Database:** `requests` table with moderation columns

**Moderation Levels:**
- **Auto-Rejected:** High-risk content (illegal, explicit, harmful)
- **Pending Review:** Medium-risk content held for manual review
- **Flagged:** Low-risk but noted for monitoring
- **Approved:** Safe content published immediately

**Moderation Statuses:**
- `approved` - Live in feed
- `pending` - Awaiting review
- `rejected` - Hidden from feed
- `flagged` - Live but marked for review

**Admin Access:** `/admin/moderation-queue` (admin role required)

---

### 3. User Reporting System

**Purpose:** Allow users to report safety concerns, abuse, or policy violations

**Implementation:**
- **Component:** `src/components/ReportDialog.tsx`
- **Database:** `user_reports` table
- **Edge Function:** Reports trigger admin notifications

**Report Types:**
- User profiles (harassment, impersonation, fraud)
- Requests (prohibited content, scams)
- Messages (abuse, spam)

**Report Locations:**
- User profile page (Report button)
- Request details page (Report button)
- Message threads (Report button)

**Admin Workflow:**
1. User submits report with reason
2. Record created in `user_reports` table
3. Admin receives notification
4. Admin reviews and takes action (warn, suspend, ban)
5. Audit trail maintained

---

### 4. Permission Management

**Purpose:** Comply with iOS/Android permission requirements with clear user explanations

**Implementation:**
- **Component:** `src/components/PermissionPreScreen.tsx`
- **Platform Config:** `ios/App/App/Info.plist`, `android/app/src/main/AndroidManifest.xml`

**Required Permissions:**

| Permission | Purpose | Pre-Screen | Platform Config |
|------------|---------|------------|-----------------|
| **Location (When in Use)** | Match nearby providers/requests | ✅ | iOS: `NSLocationWhenInUseUsageDescription`<br>Android: `ACCESS_FINE_LOCATION` |
| **Camera** | Profile photos, request images, portfolio | ✅ | iOS: `NSCameraUsageDescription`<br>Android: `CAMERA` |
| **Photo Library** | Upload existing photos | ✅ | iOS: `NSPhotoLibraryUsageDescription`<br>Android: `READ_EXTERNAL_STORAGE` |
| **Microphone** | Video calls | ✅ | iOS: `NSMicrophoneUsageDescription`<br>Android: `RECORD_AUDIO` |
| **Push Notifications** | New requests, messages, proposals | ✅ | Configured via Capacitor |

**User Flow:**
1. App requests permission
2. Pre-screen modal explains why needed
3. User clicks "Continue" → Native permission prompt
4. User grants/denies → App responds appropriately

---

### 5. Account Deletion

**Purpose:** GDPR/CCPA "Right to Erasure" compliance

**Implementation:**
- **UI:** Settings page → "Delete Account" button
- **Edge Function:** `supabase/functions/delete-user-account/index.ts`
- **Confirmation:** Two-step deletion (confirm + type "DELETE")

**Deletion Process:**
1. User clicks "Delete Account" in Settings
2. Warning dialog explains what will be deleted
3. User confirms and types "DELETE"
4. Edge function deletes all user data:
   - Profile information
   - Messages sent/received
   - Requests posted
   - Proposals submitted
   - Notifications
   - Verification records
   - Referral relationships
   - Subscription records
5. User session terminated
6. Redirected to home page

**Data Deleted:**
- `profiles` record
- `messages` (sender/recipient)
- `requests`
- `proposals`
- `notifications`
- `portfolio_items`
- `identity_verifications`
- `user_reports` (as reporter)
- `referral_codes`
- `referral_relationships`
- `provider_subscriptions`
- `notification_preferences`
- Auth record

---

### 6. Subscription Transparency

**Purpose:** Comply with App Store/Google Play billing disclosure requirements

**Implementation:**
- **Page:** `src/pages/SubscriptionDetails.tsx`
- **Route:** `/subscription-details`
- **Access:** Settings → Subscription Details

**Required Disclosures:**

✅ **Pricing Clarity**
- Monthly: $29.99/month (7-day free trial)
- Annual: $239.99/year (7-day free trial, 33% savings)

✅ **Billing Method**
- **iOS:** Apple In-App Purchase via RevenueCat
- **Android:** Google Play Billing via RevenueCat
- **Web:** RevenueCat Web Billing (Stripe-powered, managed by RevenueCat)
- All platforms use native payment methods for full App Store/Play Store compliance

✅ **Subscription Purpose**
- Provider access to request notifications
- Lead generation tools
- Portfolio management
- Provider verification badge

✅ **Cancellation**
- Cancel anytime
- **iOS:** Managed via App Store subscription settings
- **Android:** Managed via Google Play subscription settings
- **Web:** Managed via RevenueCat subscription management portal
- No refunds for partial months (handled by respective app stores)

✅ **Renewals**
- Auto-renewal disclosed
- Billing cycle clearly stated

**Subscription Management:**
- **Native (iOS/Android):** RevenueCat CustomerCenterView for native management UI
- **Web:** RevenueCat managementURL for subscription portal access
- **Hook:** `src/hooks/useRevenueCat.tsx` provides unified subscription status

---

## App Store Requirements

### Apple App Store Guidelines

**Category:** Lifestyle / Business

**Age Rating:** 17+ (real-world services, user-generated content)

**Compliance Checklist:**

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Legal pages accessible | ✅ | Footer + Settings |
| Privacy policy URL | ✅ | `/privacy-policy` |
| Terms of service URL | ✅ | `/terms-of-service` |
| Account deletion | ✅ | Settings page |
| Permissions explained | ✅ | Pre-screen modals |
| Safety center | ✅ | `/safety-center` |
| User reporting | ✅ | Report buttons |
| Content moderation | ✅ | AI + manual review |
| Subscription disclosure | ✅ | `/subscription-details` |
| Demo accounts | ✅ | See below |

### Google Play Store Requirements

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| Data safety labels | ✅ | Documented in `APP_STORE_METADATA.md` |
| Privacy policy link | ✅ | `/privacy-policy` |
| Sensitive permissions justified | ✅ | Manifest + pre-screens |
| User content policies | ✅ | Community Guidelines |
| Safety features | ✅ | Reporting + moderation |

### Demo Accounts for Reviewers

**Purpose:** Allow app reviewers to test all features without onboarding

**Accounts:**

```
Requester Account:
Email: demo-requester@fayvrs.com
Password: DemoFayvrs2025!

Provider Account:
Email: demo-provider@fayvrs.com
Password: DemoFayvrs2025!
```

**Pre-loaded Data:**
- Sample service requests
- Provider proposals
- Message threads
- Portfolio items
- Verification status
- Active subscription (provider)

**Documentation:** See `DEMO_ACCOUNTS.md` for detailed testing scenarios

---

## Data Protection & Privacy

### GDPR Compliance

**User Rights:**

| Right | Implementation |
|-------|----------------|
| **Right to Access** | Users can view all their data in Settings |
| **Right to Rectification** | Users can edit profile, requests, proposals |
| **Right to Erasure** | Account deletion in Settings |
| **Right to Data Portability** | _(Future: Export feature)_ |
| **Right to Object** | Users can disable location sharing, notifications |
| **Right to Be Informed** | Privacy Policy explains all collection |

### Data Collection Transparency

**What We Collect:**
- ✅ Name, email, phone (registration)
- ✅ Location (when permission granted, for matching)
- ✅ Profile photos (uploaded by user)
- ✅ Service requests (created by user)
- ✅ Messages (sent/received)
- ✅ Payment information (via RevenueCat/App Store/Play Store)
- ✅ Identity verification docs (providers only, secure storage)
- ✅ Usage analytics (anonymous)

**How We Use It:**
- ✅ Match requesters with nearby providers
- ✅ Facilitate communication
- ✅ Process payments via RevenueCat (Apple/Google/Web)
- ✅ Verify provider identities
- ✅ Improve service quality

**Who We Share With:**
- ✅ RevenueCat (subscription management)
- ✅ Apple/Google (payment processing via In-App Purchase)
- ✅ OpenAI (content moderation AI, no PII)
- ✅ No selling of user data

### Data Security

**Storage:**
- ✅ Encrypted at rest (Supabase)
- ✅ Encrypted in transit (HTTPS/WSS)
- ✅ Row-level security (RLS) policies
- ✅ Secure file storage (Supabase Storage)

**Access Control:**
- ✅ Users see only their own data (RLS)
- ✅ Admins have elevated permissions (role-based)
- ✅ Edge functions use service role securely

---

## Safety & Trust Systems

### User Verification

**Verification Levels:**
1. **Email Verified** - Confirmed email address
2. **Phone Verified** - SMS confirmation
3. **Identity Verified** - Government ID + selfie (optional for providers)

**Verification Badge:**
- Displays on profile if `is_verified = true`
- Providers encouraged to verify for trust

### Content Safety

**Prohibited Content:**
- Illegal services
- Adult content
- Weapons, drugs
- Fraudulent requests
- Harassment, hate speech

**Enforcement:**
- AI pre-screening (OpenAI Moderation API)
- Manual admin review queue
- User reporting
- Account suspension/bans

### Meeting Safety Guidelines

**Safety Center Topics:**
- ✅ Before meeting: Verify identity, read reviews, meet in public
- ✅ During meeting: Trust instincts, keep belongings secure
- ✅ Emergencies: Call 911, report to Fayvrs
- ✅ Payment: Use secure methods, avoid cash
- ✅ Communication: Keep in-app until confirmed

---

## Testing & Verification

### App Store Readiness Checklist

**Access:** `/app-store-readiness`

**Automated Checks:**
1. ✅ Permissions configured with explanations
2. ✅ Legal pages installed and accessible
3. ✅ Account deletion functional
4. ✅ Safety features enabled (reporting, moderation)
5. ✅ Payment transparency page exists
6. ✅ Reporting system active
7. ✅ Demo accounts ready
8. ✅ No fatal errors detected

**Manual Verification:**
- Test all legal page links
- Verify demo accounts can log in
- Test permission prompts on device
- Confirm moderation queue accessible
- Test account deletion flow
- Verify RevenueCat integration (all platforms)

---

## Developer Resources

### Key Files

**Legal Pages:**
```
src/pages/PrivacyPolicy.tsx
src/pages/TermsOfService.tsx
src/pages/CommunityGuidelines.tsx
src/pages/RefundPolicy.tsx
src/pages/SafetyCenter.tsx
src/pages/SubscriptionDetails.tsx
```

**Compliance Components:**
```
src/components/ReportDialog.tsx
src/components/PermissionPreScreen.tsx
src/components/VerificationStatus.tsx
```

**Admin Tools:**
```
src/pages/admin/KYCReview.tsx
src/pages/admin/ModerationQueue.tsx
```

**Edge Functions:**
```
supabase/functions/delete-user-account/
supabase/functions/analyze-request-openai/
supabase/functions/update-verification-status/
```

**Configuration:**
```
ios/App/App/Info.plist (iOS permissions)
android/app/src/main/AndroidManifest.xml (Android permissions)
capacitor.config.ts (app metadata)
```

**Documentation:**
```
APP_STORE_METADATA.md
DEMO_ACCOUNTS.md
COMPLIANCE_DOCUMENTATION.md (this file)
```

### Database Tables (Compliance-Related)

```
identity_verifications - KYC records
user_reports - Safety reports
requests - Moderation columns
profiles - User data
notification_preferences - Privacy settings
```

### Edge Functions Reference

**Content Moderation:**
- `analyze-request-openai` - AI content analysis

**User Management:**
- `delete-user-account` - Complete data deletion
- `update-verification-status` - KYC workflow

**Subscription & Payments:**
- `revenuecat-webhook` - RevenueCat server-to-server events for referral commission tracking
- `get-revenuecat-web-key` - Secure retrieval of RevenueCat Web API key
- `get-revenuecat-native-key` - Secure retrieval of RevenueCat Native API key

**Notifications:**
- `send-email-notification` - Compliance emails
- `send-founder-notification` - Critical alerts

### Testing Procedures

**Pre-Launch Testing:**
1. Test all legal page links (footer + settings)
2. Verify permission pre-screens display correctly
3. Test account deletion (use test account)
4. Submit test report (user, request, message)
5. Test moderation flow (create flagged content)
6. Verify KYC submission and admin review
7. Test subscription flow via RevenueCat (iOS/Android/Web)
8. Confirm demo accounts work

**Platform Testing:**
1. Build iOS app via Capacitor
2. Test on physical iOS device
3. Verify all permissions work
4. Test location matching
5. Build Android app
6. Test on physical Android device
7. Verify all permissions work

---

## Contact

For compliance questions or legal inquiries:
- **Email:** contact@fayvrs.com
- **Support:** Available via in-app chat or email

---

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| Jan 2025 | 1.0 | Initial compliance implementation |
| Jan 2026 | 2.0 | Migrated to RevenueCat-only payment architecture (removed direct Stripe integration) |

---

**Fayvrs** - Connecting communities through trusted local services.
