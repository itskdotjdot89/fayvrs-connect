
# Fix Scroll Position on Route Navigation

## Problem
When navigating to a new page in the app, the scroll position stays where it was on the previous page instead of scrolling to the top. This creates a confusing user experience, especially noticeable when browsing requests and clicking into details.

## Solution
Create a `ScrollToTop` component that listens for route changes and automatically scrolls to the top of the page whenever the user navigates to a new route.

## Implementation

### 1. Create ScrollToTop Component
**New file:** `src/components/ScrollToTop.tsx`

A simple component that uses React Router's `useLocation` hook to detect route changes and `useEffect` to scroll to top:

```text
┌─────────────────────────────────────┐
│         ScrollToTop Component        │
├─────────────────────────────────────┤
│ • Listens to location.pathname      │
│ • On change: window.scrollTo(0, 0)  │
│ • Returns null (no visual output)   │
└─────────────────────────────────────┘
```

### 2. Add to App.tsx
Place the `ScrollToTop` component inside the `BrowserRouter` but outside the routes, so it triggers on every navigation:

```text
<BrowserRouter>
  <ScrollToTop />      ← Add here
  <AppContent />
</BrowserRouter>
```

## Technical Details

- The component will use `useLayoutEffect` instead of `useEffect` to ensure scroll happens before the browser paints, preventing any flash of the old scroll position
- Uses `window.scrollTo(0, 0)` with smooth behavior disabled for instant response
- No dependencies other than React Router's `useLocation`

## Files to Create/Modify
1. **Create:** `src/components/ScrollToTop.tsx` - New scroll restoration component
2. **Modify:** `src/App.tsx` - Import and add ScrollToTop component

## Expected Behavior After Fix
- Clicking any link navigates to the new page starting at the top
- Back/forward browser navigation will also scroll to top (consistent behavior)
- No visual flicker or delayed scrolling
