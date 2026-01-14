# Demo Accounts for App Store Review

## Overview
Fayvrs includes pre-configured demo accounts for app store reviewers to thoroughly test all features without needing to complete onboarding or verification processes.

## Demo Requester Account

**Email:** demo-requester@fayvrs.com  
**Password:** [Provide securely in App Review Information section]

### Profile Details:
- **Name:** Demo Requester
- **Username:** @demo_requester
- **Location:** San Francisco, CA
- **Verified:** Yes
- **Bio:** "This is a demo account for app store reviewers to test the requester experience."

### Pre-loaded Content:
1. **Active Request - "Need help moving furniture"**
   - Category: Moving
   - Budget: $80-$150
   - Location: San Francisco, CA
   - Status: Open with 1 proposal from Demo Provider

2. **Active Request - "Fix leaky faucet"**
   - Category: Handyman
   - Budget: $50-$100
   - Location: San Francisco, CA
   - Status: Open with 1 proposal from Demo Provider

### Available Actions:
- View and respond to proposals
- Message the demo provider
- Post new service requests
- Browse nearby providers
- Access all requester features

## Demo Provider Account

**Email:** demo-provider@fayvrs.com  
**Password:** [Provide securely in App Review Information section]

### Profile Details:
- **Name:** Demo Provider
- **Username:** @demo_provider
- **Location:** San Francisco, CA
- **Verified:** Yes
- **Bio:** "Experienced handyman and service provider. This is a demo account for app store reviewers."
- **Service Categories:** Handyman, Moving
- **Service Radius:** 25 miles

### Account Status:
- **Subscription:** Active Monthly Plan
- **Expires:** Auto-renews (demo purposes only)
- **Can Submit Proposals:** Yes
- **Can Receive Notifications:** Yes

### Pre-loaded Content:
1. **Submitted Proposal for "Moving furniture" request**
   - Price: $120
   - Message: Professional proposal with experience details

2. **Submitted Proposal for "Leaky faucet" request**
   - Price: $75
   - Message: Professional proposal with experience details

### Available Actions:
- View nearby service requests
- Submit new proposals
- Message requesters
- Update portfolio
- Manage subscription (view details only, no real charges)
- Access provider dashboard and analytics
- Receive request notifications

## Testing Scenarios

### Requester Flow:
1. Log in with demo requester account
2. View active requests and proposals
3. Navigate to "Feed" to see nearby providers
4. Tap a proposal to view provider profile
5. Message the provider using in-app messaging
6. Post a new test request (will be visible to nearby providers)
7. Test video call functionality (optional)

### Provider Flow:
1. Log in with demo provider account
2. View provider dashboard
3. Check "Nearby Requests" widget for new opportunities
4. View request details and existing proposals
5. Submit a new proposal to a request
6. Navigate to Messages to chat with requester
7. View and test subscription details page
8. Update portfolio items

### Safety & Compliance Testing:
1. Access Safety Center from Settings
2. Test report functionality on:
   - A user profile
   - A service request
   - A message thread
3. Review Privacy Policy, Terms of Service, Community Guidelines
4. Test account deletion flow (warning: this will delete the demo account)

### Permission Testing:
1. Location: App will request when viewing nearby providers/requests
2. Camera/Photos: Requested when uploading profile photo or request images
3. Notifications: Requested when enabling push notifications in settings

## Important Notes

### For iOS Review:
- All permissions include pre-permission screens explaining usage
- Subscriptions managed through Apple In-App Purchase via RevenueCat
- Demo accounts have location set to San Francisco for testing

### For Android Review:
- All required permissions declared in manifest
- Data safety information accurately reflects data collection
- Location permission uses ACCESS_FINE_LOCATION
- Camera and storage permissions for media uploads

### Account Limitations:
- Demo accounts are permanent and cannot be deleted by reviewers
- No real payments will be processed
- Sample data is reset periodically
- Subscription for demo provider is perpetual for testing

### Support During Review:
If reviewers encounter any issues or have questions:
- Email: contact@fayvrs.com
- Expected response time: Within 24 hours
- Emergency contact: [Provide phone number in App Review Information]

## Post-Review Maintenance

After app approval:
- Demo accounts will remain active
- Credentials can be changed if compromised
- Sample data will be maintained
- Accounts monitored for abuse

## Security

**Important:** Demo account passwords should be:
- Unique and strong (min 12 characters)
- Changed after each review cycle if shared publicly
- Only provided through secure Apple/Google channels
- Monitored for suspicious activity

**Never share demo account credentials:**
- In public documentation
- In git repositories
- In screenshot annotations
- In public support forums
