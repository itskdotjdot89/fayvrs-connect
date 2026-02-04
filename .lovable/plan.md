

## Overview

Re-enable the "Take Photo" functionality for profile pictures on iOS by using the native Capacitor Camera plugin instead of the HTML file input that was causing crashes on iPad.

## The Problem

The previous implementation used an HTML `<input type="file" capture="camera">` which triggers WKWebView's unstable camera session on iPadOS, causing the app to crash. The temporary fix removed the camera option entirely, only allowing photo library selection.

## The Solution

Use the `@capacitor/camera` plugin's `CameraSource.Camera` option, which goes through native iOS UIImagePickerController rather than WKWebView. This approach:
- Uses native iOS camera APIs (not WKWebView getUserMedia)
- Provides a more stable and consistent experience
- Handles iPad presentation modes correctly

## Implementation Plan

### Step 1: Add Camera Option Handler

Create a new function `handleTakePhoto` in Settings.tsx that:
- Uses `Camera.getPhoto()` with `source: CameraSource.Camera`
- Includes robust error handling for permission denials and cancellations
- Converts the captured photo to a File for upload

### Step 2: Update UI for iOS Native

Modify the profile picture section to show two buttons on iOS native:
- **"Take Photo"** - Uses native camera via Capacitor
- **"Choose from Photos"** - Uses native photo library via Capacitor (existing)

### Step 3: Add iPad-Specific Handling

Add additional safety for iPad:
- Use `presentationStyle: "popover"` option if needed for iPad
- Add extra error catching around the camera invocation
- Log any errors for debugging

## UI Changes

**Current (iOS Native):**
```text
┌─────────────────────────────────┐
│  [Choose from Photos]           │
└─────────────────────────────────┘
```

**New (iOS Native):**
```text
┌─────────────────────────────────┐
│  [Take Photo]  [Choose from Photos] │
└─────────────────────────────────┘
```

## Technical Details

### Code Changes (Settings.tsx)

1. **New handler function:**
```typescript
const handleTakePhotoNative = async () => {
  if (uploading) return;
  setUploading(true);
  try {
    const photo = await Camera.getPhoto({
      source: CameraSource.Camera, // Native camera
      resultType: CameraResultType.Uri,
      quality: 85,
      width: 1024,
    });
    // ... convert to File and upload
  } catch (error) {
    // Handle cancellation gracefully (not an error)
    // Show toast for actual errors
  } finally {
    setUploading(false);
  }
};
```

2. **Updated UI section:**
```tsx
{isNative() && isIOS() ? (
  <div className="flex flex-wrap gap-2">
    <Button onClick={handleTakePhotoNative} disabled={uploading}>
      <Camera /> Take Photo
    </Button>
    <Button variant="outline" onClick={handlePickAvatarFromPhotos} disabled={uploading}>
      <Upload /> Choose from Photos
    </Button>
  </div>
) : (
  // Web fallback with HTML file input
)}
```

## Why This Works

| Approach | Technology | Stability on iPad |
|----------|-----------|-------------------|
| HTML `<input capture="camera">` | WKWebView getUserMedia | ❌ Crashes |
| Capacitor `CameraSource.Camera` | Native UIImagePickerController | ✅ Stable |
| Capacitor `CameraSource.Photos` | Native PHPickerViewController | ✅ Stable |

The native Capacitor Camera plugin bypasses WKWebView entirely when accessing the camera, using iOS's native UIImagePickerController which Apple designed specifically for this purpose.

## Testing Recommendations

After implementation:
1. Test on iPad specifically (the device that caused the rejection)
2. Test camera permission flow (first-time grant)
3. Test camera cancellation (user presses Cancel)
4. Test photo library selection (should still work)
5. Test on iPhone for regression
6. Run on iPadOS 26.2 if possible (matches review device)

## Files to Modify

- `src/pages/Settings.tsx` - Add camera handler and update UI

