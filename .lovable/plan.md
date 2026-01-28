
# Remove Provider/Requester Dropdown from Navigation

## Overview
Remove the RoleSwitcher dropdown button (Provider/Customer mode toggle) from all navigation menus across the application.

## Files to Modify

### 1. src/components/Layout.tsx
- Remove the import statement for `RoleSwitcher` (line 9)
- Remove the desktop navigation instance: `{user && <RoleSwitcher />}` (line 108)
- Remove the mobile menu instance wrapped in a div (lines 171-175)

### 2. src/components/ProfileMenu.tsx
- Remove the import statement for `RoleSwitcher` (line 7)
- Remove the RoleSwitcher component and its wrapper div along with the Separator below it (lines 89-93)

## Optional Cleanup

### 3. src/components/RoleSwitcher.tsx (optional)
- This file can be deleted entirely if the role switcher functionality is no longer needed anywhere in the app
- If you might want to use it again in the future, keep the file but it will be unused

## Impact
- Users will no longer see the Provider/Customer toggle dropdown in the header, mobile menu, or profile menu
- The role switching functionality will still exist in the AuthContext but won't be accessible from the navigation UI

## Technical Notes
- No database changes required
- No breaking changes to other components
- The `RoleSwitchModal` component will also become unused if RoleSwitcher is removed, so it could optionally be deleted as well
