# Firebase Push Notifications Setup Guide

## ✅ Configuration Complete!

Firebase Cloud Messaging (FCM) is now initialized and configured for both iOS and Android platforms.

## 📋 What Was Configured

### 1. **App.tsx** - Automatic Initialization
- Firebase initializes automatically when the app starts
- Requests notification permissions
- Generates and logs FCM push token

### 2. **Platform-Specific Configuration**
Firebase has been configured to use platform-specific values:

**iOS:**
- App ID: `1:980882564289:ios:7153966f093753d7352040`
- Measurement ID: `12293347351`

**Android:**
- App ID: `1:980882564289:android:5e983cf006eac022352040`
- Measurement ID: `12338355419`

The [firebase.ts](src/config/firebase.ts) file automatically detects the platform and uses the correct App ID and Measurement ID.

### 3. **Configuration Files**

#### [app.json](app.json#L85-L97)
Contains all Firebase credentials in the `extra` section:
```json
{
  "EXPO_PUBLIC_FIREBASE_API_KEY": "AIzaSyBM-b-n-9c5wDP4dZL2UeIu6grHfFl_Y7o",
  "EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN": "miramart-app.firebaseapp.com",
  "EXPO_PUBLIC_FIREBASE_PROJECT_ID": "miramart-app",
  "EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET": "miramart-app.firebasestorage.app",
  "EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID": "980882564289",
  "EXPO_PUBLIC_FIREBASE_APP_ID_IOS": "1:980882564289:ios:7153966f093753d7352040",
  "EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID": "1:980882564289:android:5e983cf006eac022352040",
  "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID_IOS": "12293347351",
  "EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID_ANDROID": "12338355419"
}
```

#### [.env](.env)
Contains the same Firebase credentials for development (optional but recommended).

## 🚀 How It Works

### Initialization Flow
1. App starts → [App.tsx](App.tsx#L31-L43) runs `useEffect`
2. Calls `initializeFirebase()` from [src/utils/initializeFirebase.ts](src/utils/initializeFirebase.ts)
3. Firebase SDK initializes with platform-specific App ID
4. [FirebaseMessagingService](src/services/FirebaseMessagingService.ts) requests notification permissions
5. FCM token is generated and logged to console

### Platform Detection
The [src/config/firebase.ts](src/config/firebase.ts#L11-L31) file automatically selects the correct App ID and Measurement ID:

```typescript
const getFirebaseAppId = () => {
  if (Platform.OS === 'ios') {
    return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID_IOS;
  } else if (Platform.OS === 'android') {
    return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID;
  }
  return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID_IOS;
};

const getFirebaseMeasurementId = () => {
  if (Platform.OS === 'ios') {
    return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID_IOS;
  } else if (Platform.OS === 'android') {
    return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID_ANDROID;
  }
  return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID_IOS;
};
```

## 📱 Testing Push Notifications

### 1. Run Your App
```bash
# For iOS
npm run ios

# For Android
npm run android
```

### 2. Get Your FCM Token
When the app starts, check the console logs for:
```
✅ Firebase initialized successfully
Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

### 3. Send a Test Notification

#### Option A: Firebase Console
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **miramart-app**
3. Navigate to: **Engage** → **Messaging**
4. Click **"Create your first campaign"** → **"Firebase Notification messages"**
5. Enter notification title and text
6. Click **"Send test message"**
7. Paste your FCM token
8. Click **"Test"**

#### Option B: Using curl (for testing)
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "notification": {
      "title": "Test Notification",
      "body": "This is a test from Mira!"
    }
  }'
```

Get your Server Key from: Firebase Console → Project Settings → Cloud Messaging → Server key

## 🔧 Features Available

### ✅ What Works Now:
- ✅ Automatic Firebase initialization on app start
- ✅ Notification permission requests
- ✅ FCM token generation
- ✅ Foreground notifications (shown while app is open)
- ✅ Background notifications (shown when app is closed)
- ✅ **Silent notifications** (background data updates without UI)
- ✅ Notification tap handling
- ✅ Platform-specific configuration (iOS & Android)
- ✅ Badge count management (iOS)
- ✅ Notification channels (Android)
- ✅ Custom silent notification handlers

### 📝 Available Methods:

#### Get FCM Token
```typescript
import FirebaseMessagingService from './src/services/FirebaseMessagingService';

const token = await FirebaseMessagingService.getFCMToken();
console.log('FCM Token:', token);
// Send this token to your backend
```

#### Subscribe to Topics
```typescript
await FirebaseMessagingService.subscribeToTopic('promotions');
await FirebaseMessagingService.subscribeToTopic('order-updates');
```

#### Set Badge Count (iOS)
```typescript
await FirebaseMessagingService.setBadgeCount(5);
```

#### Display Local Notification
```typescript
await FirebaseMessagingService.displayNotification({
  title: 'Order Delivered!',
  body: 'Your order has been delivered successfully.',
  data: { orderId: '12345' }
});
```

#### Handle Silent Notifications
```typescript
// Register a handler for silent background notifications
FirebaseMessagingService.setSilentNotificationHandler((data) => {
  console.log('Silent notification received:', data);
  // Process data without showing UI
  syncData(data);
});
```

**See [SILENT_NOTIFICATIONS_GUIDE.md](SILENT_NOTIFICATIONS_GUIDE.md) for complete documentation on silent notifications.**

## 🔐 Security Notes

### Current Setup:
- ✅ Firebase config files ([google-services.json](google-services.json), [GoogleService-Info.plist](GoogleService-Info.plist)) are tracked in git
- ✅ This is acceptable for EAS Build (Expo's build service needs them)

### For Enhanced Security:
If you want to keep config files out of git:
1. Add them to `.gitignore`
2. Use EAS Secrets instead
3. See: [EAS Build Secrets Documentation](https://docs.expo.dev/build-reference/variables/)

## 📚 Additional Resources

- **Firebase Service**: [src/services/FirebaseMessagingService.ts](src/services/FirebaseMessagingService.ts)
- **Firebase Config**: [src/config/firebase.ts](src/config/firebase.ts)
- **Initialization Utility**: [src/utils/initializeFirebase.ts](src/utils/initializeFirebase.ts)
- **Expo Notifications Docs**: https://docs.expo.dev/versions/latest/sdk/notifications/
- **Firebase Cloud Messaging**: https://firebase.google.com/docs/cloud-messaging

## ⚠️ Important Notes

1. **Physical Device Required**: Push notifications only work on physical devices, not simulators/emulators
2. **Permissions**: Users must grant notification permissions for push notifications to work
3. **Google Services Files**: Both `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) must be present for builds
4. **Measurement IDs**: Platform-specific IDs configured for Google Analytics (iOS: `12293347351`, Android: `12338355419`)

## 🎉 You're All Set!

Firebase Cloud Messaging is now fully configured and ready to use. Run your app on a physical device to test push notifications!
