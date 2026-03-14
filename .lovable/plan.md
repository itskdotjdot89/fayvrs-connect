

## Fix: Provider Dashboard "Failed to load activity"

### Root Cause

The "Recent Activity" query fails with a **300 status code** because there are two foreign key relationships between the `proposals` and `requests` tables:

1. `proposals.request_id -> requests.id` (many-to-one, via `proposals_request_id_fkey`)
2. `requests.selected_proposal_id -> proposals.id` (one-to-many, via `requests_selected_proposal_id_fkey`)

The database cannot determine which relationship to use, so it returns an ambiguous relationship error instead of data.

### Fix

Update the query on line 94 of `src/pages/ProviderDashboard.tsx` to use an explicit relationship hint:

```text
Before: .select('*, requests(*)')
After:  .select('*, requests!proposals_request_id_fkey(*)')
```

This tells the database to join via the `proposals.request_id` foreign key, which is the correct relationship (each proposal belongs to one request).

### Files to Modify

- **src/pages/ProviderDashboard.tsx** - One line change on the recent activity query (line 94)

### Impact

This is a one-line fix that resolves the "Failed to load activity" error and ensures the Recent Activity section displays correctly for App Store review completeness (Guideline 2.1).

