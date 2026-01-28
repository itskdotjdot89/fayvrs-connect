
# Enhance Demo Requests for App Store Review

## Overview
Improve the demo data to give App Store reviewers a comprehensive understanding of the full user flow and app functionality. This involves enriching the existing demo requests with more realistic content, adding request images, creating more diverse request states, and ensuring proper message threading that demonstrates the complete lifecycle of a service request.

## Current State Analysis

The demo setup currently includes:
- 8 requests with various statuses (open, in_progress, completed, cancelled)
- 7 proposals from Demo Provider
- 12 messages showing conversations
- 6 portfolio items for Demo Provider
- Notifications for both demo accounts
- Referral data for Demo Provider

However, reviewers would benefit from:
1. More recent, fresh demo requests (current ones are from December 2025)
2. Request images to demonstrate the full posting experience
3. More detailed, realistic descriptions that show real-world use cases
4. Additional message threads showing different conversation stages
5. More variety in proposal statuses and pricing discussions

## Files to Modify

### 1. supabase/functions/setup-demo-accounts/index.ts

**Enhancements:**

#### A. Add Request Images (lines 255-384)
Add `images` array to demo requests using placeholder service-related images to show reviewers what a complete request looks like:

```typescript
{
  id: requestIds.plumbing,
  // ... existing fields ...
  images: [
    'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800' // Leaky sink image
  ],
}
```

#### B. Fresher Timestamps
Update `created_at` timestamps to use more recent dates (hours/days ago instead of weeks) so requests appear active and current.

#### C. Enhanced Request Descriptions
Expand descriptions to include:
- Specific details about the work needed
- Preferred timing/availability
- Any special requirements
- Context that shows the requester's situation

Example for plumbing request:
```typescript
description: 'Kitchen sink has a persistent drip that\'s getting worse. The leak appears to be coming from under the sink near the drain pipe connection. I\'ve tried tightening the connections but it hasn\'t helped. Available any day this week after 2 PM. The sink is a standard single-basin with a garbage disposal unit.'
```

#### D. More Diverse Request Categories
Add 2-3 additional demo requests covering categories not yet represented:
- **Technology/IT Support**: "Home network setup and troubleshooting"
- **Event Services**: "Need DJ for birthday party next month"
- **Tutoring/Education**: "Math tutor for high school student"

#### E. Enhanced Message Threads (lines 470-567)
Create more comprehensive conversation flows that demonstrate:
- Initial inquiry and response
- Price negotiation
- Scheduling discussion
- Confirmation and follow-up
- Post-service feedback

Example expanded thread for electrical job:
```typescript
// Message 1: Initial response to proposal
{ content: 'Hi! Your proposal looks great. Quick question - are the outlets going to be standard or USB-equipped?' }

// Message 2: Provider clarifies
{ content: 'I can install either! USB outlets are about $15 more per outlet but very convenient for charging devices.' }

// Message 3: Decision made
{ content: 'Let\'s go with USB outlets for 2 of them and standard for 1. Can you do Thursday afternoon?' }

// Message 4: Confirmation
{ content: 'Perfect! Thursday at 2 PM works. I\'ll bring all the materials. See you then!' }

// Message 5: After service
{ content: 'The outlets look fantastic! Professional work. Thank you!' }

// Message 6: Provider thanks
{ content: 'Thank you! It was a pleasure. Don\'t hesitate to reach out for any future electrical needs!' }
```

#### F. Varied Proposal States
Ensure proposals demonstrate different stages:
- `pending` - Awaiting customer response (3-4 proposals)
- `accepted` - Selected provider (2 proposals)
- `rejected` - Customer chose another provider (1 proposal)
- Include proposals with different pricing strategies (flat rate, hourly, with/without materials)

#### G. Add Provider Specialties for Demo Requester
Since demo requester also has the provider role, add some specialties so role switching shows meaningful data:
```typescript
await supabaseAdmin.from('provider_specialties').insert([
  { provider_id: requesterId, category: 'Photography' },
  { provider_id: requesterId, category: 'Graphic Design' }
]);
```

## Technical Implementation Details

### Timestamp Strategy
Use relative timestamps that will always appear fresh:
```typescript
const now = Date.now();
const hoursAgo = (hours: number) => new Date(now - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(now - days * 24 * 60 * 60 * 1000).toISOString();

// Recent active requests
created_at: hoursAgo(4),  // 4 hours ago
created_at: hoursAgo(18), // 18 hours ago
created_at: daysAgo(1),   // 1 day ago
created_at: daysAgo(3),   // 3 days ago
```

### Image Sources
Use royalty-free Unsplash images that represent each service type:
- Plumbing: Sink/faucet image
- Electrical: Outlet/wiring image
- Painting: Paint cans/roller image
- Moving: Boxes/furniture image
- HVAC: AC unit image
- Landscaping: Garden/lawn image

### Request Variety Matrix

| Request | Status | Has Proposal | Has Messages | Has Images |
|---------|--------|--------------|--------------|------------|
| Emergency Plumbing | open | Yes (pending) | Yes (4 msgs) | Yes |
| Electrical Outlets | in_progress | Yes (accepted) | Yes (6 msgs) | Yes |
| Interior Painting | open | Yes (pending) | Yes (2 msgs) | Yes |
| Moving Help | open | Yes (rejected) | Yes (3 msgs) | No |
| HVAC Repair | open | Yes (pending) | Yes (3 msgs) | Yes |
| Fence Repair | completed | Yes (accepted) | Yes (4 msgs) | No |
| Landscaping | open | Yes (pending) | Yes (2 msgs) | No |
| Home Network Setup | open | No proposals | No messages | Yes |
| Math Tutoring | open | No proposals | No messages | No |

## Additional Enhancements

### Notifications Update
Add more notification types to showcase the full notification system:
- `new_request_nearby` - For provider role
- `request_expiring` - 24-hour warning
- `provider_responded` - When provider messages

### Portfolio Enhancement
Add 2 more portfolio items to Demo Provider with video placeholder:
```typescript
{
  title: 'Smart Home Installation',
  description: 'Complete smart thermostat and lighting system installation',
  image_url: 'https://images.unsplash.com/photo-...',
  media_type: 'image',
  is_featured: true,
  price: 450,
  category: 'Electrical Services'
}
```

## Deployment Steps

1. Deploy the updated `setup-demo-accounts` edge function
2. Call the function to regenerate demo data with enhanced content
3. Verify demo accounts show the enriched data in the app preview
4. Test both demo-requester and demo-provider login flows

## Expected Reviewer Experience

### As Demo Requester (demo-requester@fayvrs.com):
- **Dashboard**: Shows 6+ active requests with proposal counts
- **Request Details**: Displays detailed requests with images and multiple proposals
- **Messages**: Active conversation threads with Demo Provider
- **Notifications**: Mix of read/unread notifications

### As Demo Provider (demo-provider@fayvrs.com):
- **Dashboard**: Shows proposal stats, nearby requests, earnings card
- **Feed**: Multiple requests matching provider specialties
- **Proposals**: Various statuses demonstrating the full workflow
- **Portfolio**: 8 items showcasing past work
- **Messages**: Ongoing conversations with Demo Requester

This comprehensive demo setup will allow App Store reviewers to fully test the requester flow (posting, reviewing proposals, selecting providers, messaging) and the provider flow (browsing requests, submitting proposals, managing subscriptions, messaging customers).
