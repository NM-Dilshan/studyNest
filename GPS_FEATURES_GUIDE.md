# GPS Location Features - Implementation Guide

## Overview
StudyNest now includes comprehensive GPS location features that allow students to:
1. **Share location anonymously** to contribute to accurate crowd level data
2. **Toggle GPS on/off anytime** with a dedicated button
3. **Request GPS permission** automatically after login
4. **Control GPS privacy settings** from the study-areas page

## Features Implemented

### 1. **Automatic GPS Permission Request After Login**
- **Location**: Home page (`/app/home/page.tsx`)
- **Trigger**: Shows automatically 1 second after login (if not previously asked)
- **Dialog includes**:
  - GPS request with privacy explanation
  - Privacy guarantee: "Your location is never stored permanently or shared"
  - Data expiration: "Data expires every 5 minutes"
  - Options: "Enable Location", "Skip for Now"
  - Remembers user choice per session

### 2. **GPS Toggle Button on Study-Areas Page**
- **Location**: Study Area Finder page header (`/app/study-areas/page.tsx`)
- **Features**:
  - Visual indicator: Blue when ON, Gray when OFF
  - One-click toggle to enable/disable GPS
  - Shows "GPS On" / "GPS Off" label (on larger screens)
  - Icon changes color based on status
  - Persists user preference in localStorage

### 3. **Location Permission Banner**
- **Location**: Study-areas page main content
- **Shows**:
  - Current location sharing status
  - Toggle button to start/stop sharing
  - Privacy guarantee messages
  - Data expiration information
  - Close button to dismiss
  - Fixed position (bottom-right) with z-index management

### 4. **Privacy-First Design**
All GPS features include:
- ✓ Privacy guarantee: Location never stored permanently
- ✓ Data expiration: Automatic 5-minute expiration
- ✓ Anonymity: Only occupancy counts are tracked
- ✓ User control: Easy on/off toggle
- ✓ Permission clear: What data is collected and how it's used

## How It Works

### User Flow

#### First Login (New User)
1. User logs in via `/login/signIN`
2. Home page loads
3. GPS permission dialog appears after 1 second
4. User can:
   - Click "Enable Location" → GPS permission requested → Location shared
   - Click "Skip for Now" → Dialog closes → Can enable later from study-areas page
5. Dialog remembers that user was asked (won't show again same session)

#### Existing Session
1. User navigates to `/study-areas`
2. GPS toggle button visible in page header (right side)
3. Can click button to enable/disable GPS immediately
4. Location Permission Banner shows detailed status at top of page
5. Personal GPS preference persists in localStorage

#### Turning Off GPS
Users can turn off GPS in multiple ways:
1. **Study-areas page**: Click "GPS On" button in header
2. **Location banner**: Click "Stop Sharing Location" button
3. **Browser settings**: Revoke location permission (app respects this)
4. **localStorage**: App reads `gpsEnabled_{userId}` flag

### Data Flow

```
User Login
    ↓
Home Page GPS Dialog
    ↓ (Enable Location)
RequestPermission → navigator.geolocation.getCurrentPosition
    ↓
Send Location to /api/location
    ↓
Store in `gpsEnabled_{userId}` (localStorage)
    ↓
Study-areas page loads with GPS enabled
    ↓
LocationPermissionBanner shows sharing active
    ↓
Toggle button shows "GPS On"
    ↓
Location updates sent every ~10 seconds (via useLocationTracking hook)
```

## Component Architecture

### New/Updated Components

#### 1. Home Page (`/app/home/page.tsx`)
**New State:**
- `showGPSDialog`: boolean - controls dialog visibility
- `gpsStatus`: 'idle' | 'requesting' | 'enabled' | 'denied'

**New Functions:**
- `requestGPSPermission()`: Handles GPS permission flow
- `handleSkipGPS()`: Dismisses dialog + marks as shown

**New JSX:**
- GPS Permission Dialog with modern modal design
- Success/error states
- Skip and Enable buttons

#### 2. Study-Areas Page (`/app/study-areas/page.tsx`)
**New State:**
- `gpsEnabled`: boolean - tracks GPS status

**New Functions:**
- `toggleGPS()`: Enable/disable GPS with location tracking

**New UI Elements:**
- GPS toggle button in header (next to title)
- Updated LocationPermissionBanner integration

#### 3. LocationPermissionBanner (`/components/LocationPermissionBanner.tsx`)
**Existing:** Already has full GPS management capability
- Handles permission requests
- Manages location watching
- Shows status and toggle button
- Persists preferences

## Testing the Features

### Test Case 1: First Login GPS Request
1. Clear browser localStorage (DevTools → Application → Clear All)
2. Navigate to `/login/signIN`
3. Log in with valid credentials
4. Wait ~1 second on home page
5. ✓ GPS permission dialog should appear
6. ✓ Dialog shows with privacy explanation
7. Click "Enable Location" or "Skip for Now"
8. ✓ Dialog closes and choice is remembered

### Test Case 2: Study-Areas Page GPS Toggle
1. Navigate to `/study-areas`
2. Look at header (right side next to title)
3. ✓ GPS toggle button should be visible saying "GPS Off"
4. Click the button
5. ✓ Button should change to "GPS On" 
6. ✓ Location Permission Banner should update
7. Click again
8. ✓ Button should change back to "GPS Off"

### Test Case 3: Location Permission Banner
1. On `/study-areas` page
2. Look for Location Permission Banner (may be at bottom of notifications)
3. ✓ Should show "Enable Location" button if GPS is off
4. ✓ Should show "Stop Sharing Location" if GPS is on
5. Click toggle in banner
6. ✓ Header button should update to match

### Test Case 4: Persistence
1. Enable GPS on `/study-areas` page
2. Refresh the page (Ctrl+R)
3. ✓ GPS should still show as enabled
4. ✓ Header button should show "GPS On"
5. Navigate away and back to `/study-areas`
6. ✓ State should persist

### Test Case 5: Privacy Message
1. On home GPS dialog, read privacy message
2. ✓ Should say: "Your location is never stored permanently"
3. ✓ Should say: "Data expires after 5 minutes"
4. On `/study-areas` LocationPermissionBanner
5. ✓ Should show privacy guarantee about occupancy counts only

## Configuration

### localStorage Keys
- `gpsDialogShown_{userId}`: Tracks if user was shown permission dialog
- `gpsEnabled_{userId}`: Tracks if GPS is enabled for user
- `locationTracking_{userId}`: Used by LocationPermissionBanner

### API Endpoints Used
- `POST /api/location`: Receives location updates
  ```javascript
  {
    userId: string,
    latitude: number,
    longitude: number
  }
  ```

### Environment Variables
None required - uses browser Geolocation API directly

## Browser Compatibility

✓ Chrome/Edge 80+
✓ Firefox 74+
✓ Safari 13.1+
✓ Mobile browsers with geolocation support

## Privacy & Security

### Data Handling
- ✓ Location **never permanently stored**
- ✓ Only **occupancy counts** shown to users
- ✓ Data **expires every 5 minutes**
- ✓ Individual locations **not shared** between users
- ✓ Only **aggregated data** (crowd levels) used

### User Control
- ✓ Can **turn off anytime** (header button)
- ✓ Can **revoke** browser permission entirely
- ✓ No **forced tracking** (always optional)
- ✓ Clear **privacy messages** before enabling

## Future Enhancements

Potential improvements:
1. Add activity map showing where students spend most time
2. Add "Near Me Now" feature to find closest study areas
3. Add GPS-based area recommendations
4. Add heat map visualization of crowd density
5. Add audit log of GPS usage history
6. Add granular privacy settings (share distance, time window, etc.)

## Troubleshooting

### GPS Dialog Not Appearing
- **Cause**: Dialog already shown in this session
- **Fix**: Refresh page or clear localStorage for `gpsDialogShown_{userId}`

### GPS Toggle Not Updating
- **Cause**: Browser didn't grant permission
- **Fix**: Check browser notification bar / browser settings
- **Note**: "GPS On" won't persist if browser denies permission

### Location Not Being Sent to Server
- **Cause**: API endpoint `/api/location` not working
- **Fix**: Check server logs for `/api/location` endpoint errors
- **Debug**: Check browser Network tab for POST requests

### Button Shows "GPS Off" After Refresh
- **Cause**: Location data expired (5 minute expiration)
- **Fix**: Click "GPS On" button to re-enable and send fresh location

## Deployment Notes

1. Ensure `/api/location` endpoint exists and is working
2. Ensure HTTPS is enabled (browser requires secure context for geolocation)
3. Test on mobile devices (iOS, Android require specific permission flows)
4. Update privacy policy to mention location collection feature
5. Consider adding analytics for GPS feature adoption

---

**Last Updated**: April 8, 2026
**Version**: 1.0
