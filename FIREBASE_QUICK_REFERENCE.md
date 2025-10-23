# Firebase Quick Reference

## 🔥 Branch Info
- **Branch:** `firebase-integration`
- **Status:** Ready to merge/test
- **Commit:** `0d3050c`

## 📦 What's Included

### Services
| Service | File | Purpose |
|---------|------|---------|
| Authentication | `src/services/FirebaseAuthService.ts` | Email, password, phone auth |
| Messaging | `src/services/FirebaseMessagingService.ts` | Push notifications (FCM) |

### Hooks
| Hook | File | Purpose |
|------|------|---------|
| useFirebaseAuth | `src/hooks/useFirebaseAuth.ts` | React auth state management |

### Utilities
| Utility | File | Purpose |
|---------|------|---------|
| initializeFirebase | `src/utils/initializeFirebase.ts` | Initialize all Firebase services |

## ⚡ Quick Usage

### Initialize (App.tsx)
```typescript
import { initializeFirebase } from './src/utils/initializeFirebase';

useEffect(() => {
  initializeFirebase();
}, []);
```

### Authentication
```typescript
import { useFirebaseAuth } from './src/hooks/useFirebaseAuth';

const { signIn, signUp, signOut, user, isAuthenticated } = useFirebaseAuth();

// Sign in
await signIn('user@example.com', 'password');

// Sign up
await signUp('user@example.com', 'password');

// Sign out
await signOut();
```

### Push Notifications
```typescript
import FirebaseMessagingService from './src/services/FirebaseMessagingService';

// Get token (auto-initialized)
const token = await FirebaseMessagingService.getFCMToken();

// Subscribe to topic
await FirebaseMessagingService.subscribeToTopic('promotions');
```

## 🔑 Firebase Project Details

- **Project:** miramart-app
- **Package (Android):** com.modawa.mira
- **Bundle ID (iOS):** com.modawa.mira

## 📱 Platform Setup

### Android ✅ (Ready)
```bash
npm run android
```

### iOS ⏳ (Need to complete)
```bash
# 1. Generate iOS code
npx expo prebuild --platform ios

# 2. Add GoogleService-Info.plist to ios/mira/

# 3. Install pods
cd ios && pod install && cd ..

# 4. Run
npm run ios
```

## 📖 Full Documentation

| Document | Purpose |
|----------|---------|
| [FIREBASE_SETUP.md](FIREBASE_SETUP.md) | Complete setup & troubleshooting |
| [FIREBASE_INTEGRATION_SUMMARY.md](FIREBASE_INTEGRATION_SUMMARY.md) | What was done |
| [src/services/README.md](src/services/README.md) | Service API reference |
| [ios-firebase-setup.md](ios-firebase-setup.md) | iOS-specific setup |

## 🧪 Testing

```typescript
import { runAllFirebaseTests } from './src/test/firebase-integration-test';

if (__DEV__) {
  runAllFirebaseTests();
}
```

## 🔒 Security Checklist

- [ ] Never commit `google-services.json`
- [ ] Never commit `GoogleService-Info.plist`
- [ ] Set up Firebase Security Rules
- [ ] Use environment variables for sensitive data
- [ ] Enable App Check in production

## 🚀 Next Actions

1. Test Android build: `npm run android`
2. Complete iOS setup (if needed)
3. Integrate auth in login screens
4. Test notifications
5. Configure backend to handle FCM tokens
6. Set up Firebase Security Rules
7. Merge branch: `git checkout main && git merge firebase-integration`

## 💡 Common Commands

```bash
# Switch to Firebase branch
git checkout firebase-integration

# Build Android
npm run android

# Build iOS (after setup)
npm run ios

# Test TypeScript
npx tsc --noEmit

# Clean Android build
cd android && ./gradlew clean && cd ..
```

## 🐛 Troubleshooting

**Issue:** Build errors on Android
```bash
cd android && ./gradlew clean && cd ..
npm run android
```

**Issue:** Can't get FCM token
- Check notification permissions are granted
- Verify `google-services.json` is present
- Check Firebase project configuration

**Issue:** Auth not working
- Enable authentication method in Firebase Console
- Check Firebase project configuration
- Verify API keys

## 📞 Support

- [React Native Firebase Docs](https://rnfirebase.io/)
- [Firebase Console](https://console.firebase.google.com/)
- [Firebase Support](https://firebase.google.com/support)
