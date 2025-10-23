# Notification Permissions - Complete Guide

## ✅ Already Configured

### Android Permissions
The following notification permissions are **already added** to your AndroidManifest.xml:

```xml
<uses-permission android:name="android.permission.POST_NOTIFICATIONS"/>
<uses-permission android:name="android.permission.VIBRATE"/>
```

**Location:** [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml:7)

### What These Permissions Do

1. **POST_NOTIFICATIONS** (Line 7)
   - Required for Android 13 (API 33) and above
   - Allows the app to display notifications
   - User must grant this permission at runtime

2. **VIBRATE** (Line 10)
   - Allows notification vibration
   - Automatically granted (normal permission)

3. **INTERNET** (Line 6)
   - Required for FCM to work
   - Already present

## 📱 How Permissions Work

### Android (Already Handled by Our Code)

Our `FirebaseMessagingService` automatically requests notification permissions:

**File:** [src/services/FirebaseMessagingService.ts](src/services/FirebaseMessagingService.ts:43)

```typescript
async requestPermission(): Promise<boolean> {
  try {
    const authStatus = await firebaseMessaging.requestPermission();
    const enabled =
      authStatus === 1 || // authorized
      authStatus === 2;   // provisional

    if (enabled) {
      console.log('Notification permission granted:', authStatus);
    }

    return enabled;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    return false;
  }
}
```

**This automatically:**
1. Shows the permission dialog to users (Android 13+)
2. Checks if permission is granted
3. Returns true/false based on user's choice

### iOS (When You Set It Up)

For iOS, permissions are requested the same way through Firebase:
- The system shows a native iOS permission dialog
- User can allow/deny notifications
- Our code handles this automatically

## 🔧 Additional Configuration Added

### Firebase Messaging Service (AndroidManifest.xml)

I've added the Firebase Messaging service declaration:

**Location:** [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml:33-40)

```xml
<!-- Firebase Cloud Messaging -->
<service
  android:name="com.google.firebase.messaging.FirebaseMessagingService"
  android:exported="false">
  <intent-filter>
    <action android:name="com.google.firebase.MESSAGING_EVENT"/>
  </intent-filter>
</service>
```

**This enables:**
- Background notification handling
- Notification tap events
- FCM message processing

## 🚀 How It Works in Practice

### 1. App First Launch
```typescript
// In App.tsx
import { initializeFirebase } from './src/utils/initializeFirebase';

useEffect(() => {
  initializeFirebase(); // This will request permissions automatically
}, []);
```

### 2. User Flow
1. App calls `initializeFirebase()`
2. Firebase requests notification permission
3. User sees system dialog:
   - **Android 13+:** "Allow [App Name] to send you notifications?"
   - **iOS:** "App Name Would Like to Send You Notifications"
4. User grants/denies permission
5. If granted, FCM token is generated

### 3. Check Permission Status
```typescript
import FirebaseMessagingService from './src/services/FirebaseMessagingService';

// Check if permission is granted
const hasPermission = await FirebaseMessagingService.requestPermission();

if (hasPermission) {
  // Get FCM token
  const token = await FirebaseMessagingService.getFCMToken();
  console.log('FCM Token:', token);
} else {
  // Show message to user explaining why notifications are needed
  Alert.alert(
    'Notifications Disabled',
    'Enable notifications in settings to receive order updates.'
  );
}
```

## 🔍 Testing Permissions

### Test on Android Device/Emulator

1. **First Install:**
   ```bash
   npm run android
   ```
   - You should see permission dialog on first launch
   - Grant permission

2. **Check Permission Status:**
   - Go to: Settings → Apps → Mira → Notifications
   - Should show "Allowed"

3. **Test Notification:**
   - Use Firebase Console → Cloud Messaging
   - Send test message
   - You should receive it

### Manually Request Permission Again

```typescript
import FirebaseMessagingService from './src/services/FirebaseMessagingService';

// Request permission
const granted = await FirebaseMessagingService.requestPermission();

if (!granted) {
  // User denied - show instructions to enable in settings
  Alert.alert(
    'Permission Required',
    'Please enable notifications in app settings',
    [
      { text: 'Cancel' },
      {
        text: 'Settings',
        onPress: () => Linking.openSettings()
      }
    ]
  );
}
```

## ⚠️ Important Notes

### Android 13+ (API 33+)
- **Runtime permission required** (already handled)
- User can deny permission
- App should handle denied state gracefully

### Android 12 and below
- Notifications automatically allowed
- No runtime permission needed
- Still declared in manifest (best practice)

### iOS
- Always requires runtime permission
- User can deny or allow
- Can choose "Provisional" (silent notifications)

## 📋 Summary

**Question:** Are notification permissions added?

**Answer:** ✅ **YES!** Everything is configured:

1. ✅ Manifest permissions added (`POST_NOTIFICATIONS`, `VIBRATE`, etc.)
2. ✅ Firebase Messaging service declared in manifest
3. ✅ Runtime permission request implemented in code
4. ✅ Permission handling in `FirebaseMessagingService.initialize()`
5. ✅ Auto-requested when you call `initializeFirebase()`

**You don't need to do anything else!** The permissions are ready to use.

## 🎯 Next Steps

1. Test the app on Android device/emulator
2. Check if permission dialog appears
3. Grant permission
4. Send test notification from Firebase Console
5. Verify notification is received

---

**No additional permission setup needed!** Everything is ready to go. 🎉
