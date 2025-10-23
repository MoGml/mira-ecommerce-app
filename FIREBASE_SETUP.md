# Firebase Integration Setup Guide

This guide will help you complete the Firebase integration for your Mira e-commerce app.

## Prerequisites

- Firebase project created at [Firebase Console](https://console.firebase.google.com/)
- Node.js and npm installed
- Android Studio (for Android development)
- Xcode (for iOS development on macOS)

## 🔥 Firebase Services Configured

- ✅ Firebase Authentication
- ✅ Firebase Cloud Messaging (Push Notifications)

## 📱 Platform Configuration

### Android Configuration (Already Done)

The Android configuration is already complete:

1. ✅ Firebase dependencies added to `android/build.gradle`
2. ✅ Google Services plugin added to `android/app/build.gradle`
3. ✅ Firebase config file: `android/app/google-services.json`
4. ✅ Package name: `com.modawa.mira`

**Your Firebase Project Details:**
- Project ID: `miramart-app`
- Project Number: `980882564289`
- Android App ID: `1:980882564289:android:5e983cf006eac022352040`

### iOS Configuration (Pending)

Since this is an Expo project, you'll need to generate iOS native code:

```bash
# Generate iOS native code
npx expo prebuild --platform ios
```

After generating iOS code:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `miramart-app`
3. Add an iOS app with bundle identifier: `com.modawa.mira`
4. Download `GoogleService-Info.plist`
5. Place the file in `ios/mira/GoogleService-Info.plist`
6. Install iOS dependencies:
   ```bash
   cd ios
   pod install
   cd ..
   ```

## 📦 Installed Dependencies

```json
"@react-native-firebase/app": "latest"
"@react-native-firebase/auth": "latest"
"@react-native-firebase/messaging": "latest"
```

## 🛠️ Service Files Created

### 1. Firebase Configuration
- **File:** `src/config/firebase.ts`
- **Purpose:** Initialize and export Firebase services

### 2. Authentication Service
- **File:** `src/services/FirebaseAuthService.ts`
- **Features:**
  - Email/Password authentication
  - Phone number authentication
  - Password reset
  - Profile updates
  - Auth state observer
  - Error handling

### 3. Cloud Messaging Service
- **File:** `src/services/FirebaseMessagingService.ts`
- **Features:**
  - FCM token management
  - Foreground/Background notifications
  - Notification handlers
  - Topic subscriptions
  - Badge management (iOS)

## 🚀 Usage Examples

### Authentication

```typescript
import FirebaseAuthService from './src/services/FirebaseAuthService';

// Sign up with email
const signUp = async (email: string, password: string) => {
  try {
    const userCredential = await FirebaseAuthService.signUpWithEmail(email, password);
    console.log('User created:', userCredential.user.uid);
  } catch (error) {
    console.error('Sign up failed:', error.message);
  }
};

// Sign in with email
const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await FirebaseAuthService.signInWithEmail(email, password);
    console.log('User signed in:', userCredential.user.uid);
  } catch (error) {
    console.error('Sign in failed:', error.message);
  }
};

// Listen to auth state changes
const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is signed in:', user.uid);
  } else {
    console.log('User is signed out');
  }
});

// Sign out
await FirebaseAuthService.signOut();
```

### Push Notifications

```typescript
import FirebaseMessagingService from './src/services/FirebaseMessagingService';

// Initialize messaging service (call this in your App.tsx)
const initializeNotifications = async () => {
  try {
    await FirebaseMessagingService.initialize();
    const token = await FirebaseMessagingService.getFCMToken();
    console.log('FCM Token:', token);
    // Send token to your backend server
  } catch (error) {
    console.error('Failed to initialize notifications:', error);
  }
};

// Subscribe to a topic
await FirebaseMessagingService.subscribeToTopic('promotions');

// Unsubscribe from a topic
await FirebaseMessagingService.unsubscribeFromTopic('promotions');
```

## 📝 Integration Checklist

### Android
- [x] Add google-services.json
- [x] Update build.gradle files
- [x] Add Firebase dependencies
- [ ] Test on Android device/emulator

### iOS
- [ ] Generate iOS native code (`npx expo prebuild --platform ios`)
- [ ] Add GoogleService-Info.plist
- [ ] Install CocoaPods dependencies
- [ ] Test on iOS device/simulator

### Code Integration
- [ ] Initialize Firebase Messaging in App.tsx
- [ ] Setup Auth state listener
- [ ] Handle FCM tokens on your backend
- [ ] Test authentication flow
- [ ] Test push notifications

## 🔒 Security Considerations

1. **Never commit sensitive files:**
   - Add to `.gitignore`:
     ```
     android/app/google-services.json
     ios/GoogleService-Info.plist
     ```

2. **Use Firebase Security Rules:**
   - Configure rules in Firebase Console
   - Restrict unauthorized access

3. **Implement proper error handling:**
   - Don't expose sensitive error details to users
   - Log errors securely

## 🧪 Testing

### Test Authentication

```bash
# Run on Android
npm run android

# Run on iOS (after iOS setup)
npm run ios
```

Test the following flows:
1. User registration
2. User login
3. Password reset
4. Profile updates
5. User logout

### Test Push Notifications

1. Get FCM token from the app
2. Use Firebase Console -> Cloud Messaging -> Send test message
3. Verify notifications in:
   - Foreground
   - Background
   - Quit state

## 📚 Additional Resources

- [React Native Firebase Documentation](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Authentication Guide](https://rnfirebase.io/auth/usage)
- [Firebase Cloud Messaging Guide](https://rnfirebase.io/messaging/usage)

## 🐛 Troubleshooting

### Android Issues

**Build errors:**
```bash
cd android
./gradlew clean
cd ..
npm run android
```

**Google Services error:**
- Verify `google-services.json` is in `android/app/`
- Check package name matches Firebase console

### iOS Issues

**CocoaPods errors:**
```bash
cd ios
pod deintegrate
pod install
cd ..
```

**GoogleService-Info.plist not found:**
- Verify file is in `ios/mira/`
- Check bundle identifier matches Firebase console

## 🔄 Next Steps

1. Complete iOS configuration (if needed)
2. Initialize Firebase Messaging in your App.tsx
3. Integrate authentication in your login/signup screens
4. Test all features
5. Configure backend to handle FCM tokens
6. Set up Firebase Security Rules
7. Enable additional Firebase services as needed (Firestore, Storage, etc.)

---

**Need Help?** Check the [Firebase Support](https://firebase.google.com/support) or [Stack Overflow](https://stackoverflow.com/questions/tagged/react-native-firebase).
