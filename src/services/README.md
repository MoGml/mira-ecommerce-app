# Firebase Services Documentation

This directory contains Firebase service implementations for the Mira e-commerce app.

## Services

### 1. FirebaseAuthService

Handles all authentication-related operations.

**Location:** `src/services/FirebaseAuthService.ts`

**Methods:**
- `signUpWithEmail(email, password)` - Create new user account
- `signInWithEmail(email, password)` - Sign in existing user
- `signInWithPhoneNumber(phoneNumber)` - Start phone authentication
- `confirmPhoneVerification(confirmation, code)` - Confirm phone OTP
- `signOut()` - Sign out current user
- `sendPasswordResetEmail(email)` - Send password reset email
- `updateProfile(updates)` - Update user profile
- `updateEmail(newEmail)` - Change user email
- `updatePassword(newPassword)` - Change user password
- `deleteAccount()` - Delete user account
- `onAuthStateChanged(callback)` - Listen to auth state changes
- `getIdToken(forceRefresh)` - Get user ID token for API calls
- `getCurrentUser()` - Get current authenticated user

**Usage Example:**
```typescript
import FirebaseAuthService from './src/services/FirebaseAuthService';

// Sign up
const userCredential = await FirebaseAuthService.signUpWithEmail(
  'user@example.com',
  'password123'
);

// Sign in
const userCredential = await FirebaseAuthService.signInWithEmail(
  'user@example.com',
  'password123'
);

// Listen to auth state
const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
  if (user) {
    console.log('User is logged in:', user.uid);
  }
});
```

### 2. FirebaseMessagingService

Handles push notifications via Firebase Cloud Messaging.

**Location:** `src/services/FirebaseMessagingService.ts`

**Methods:**
- `initialize()` - Initialize FCM service and request permissions
- `requestPermission()` - Request notification permissions
- `getFCMToken()` - Get FCM device token
- `deleteFCMToken()` - Delete FCM token
- `subscribeToTopic(topic)` - Subscribe to notification topic
- `unsubscribeFromTopic(topic)` - Unsubscribe from topic
- `setAutoInitEnabled(enabled)` - Enable/disable auto-initialization
- `isAutoInitEnabled()` - Check auto-init status
- `getBadgeCount()` - Get badge count (iOS)
- `setBadgeCount(count)` - Set badge count (iOS)

**Usage Example:**
```typescript
import FirebaseMessagingService from './src/services/FirebaseMessagingService';

// Initialize (call once in App.tsx)
await FirebaseMessagingService.initialize();

// Get FCM token
const token = await FirebaseMessagingService.getFCMToken();
console.log('FCM Token:', token);

// Subscribe to topics
await FirebaseMessagingService.subscribeToTopic('promotions');
await FirebaseMessagingService.subscribeToTopic('order_updates');

// Unsubscribe
await FirebaseMessagingService.unsubscribeFromTopic('promotions');
```

## Hooks

### useFirebaseAuth

React hook for Firebase authentication state management.

**Location:** `src/hooks/useFirebaseAuth.ts`

**Returns:**
- `user` - Current authenticated user or null
- `loading` - Loading state
- `error` - Error object if any
- `signIn(email, password)` - Sign in function
- `signUp(email, password)` - Sign up function
- `signOut()` - Sign out function
- `resetPassword(email)` - Password reset function
- `isAuthenticated` - Boolean indicating if user is logged in

**Usage Example:**
```typescript
import { useFirebaseAuth } from './src/hooks/useFirebaseAuth';

const LoginScreen = () => {
  const { user, loading, signIn, signOut, isAuthenticated } = useFirebaseAuth();

  const handleLogin = async () => {
    try {
      await signIn('user@example.com', 'password123');
    } catch (error) {
      console.error('Login failed:', error.message);
    }
  };

  if (isAuthenticated) {
    return <HomeScreen />;
  }

  return <LoginForm onSubmit={handleLogin} />;
};
```

## Utilities

### initializeFirebase

Initialize all Firebase services on app startup.

**Location:** `src/utils/initializeFirebase.ts`

**Functions:**
- `initializeFirebase()` - Initialize all Firebase services
- `logFCMToken()` - Log FCM token for testing
- `subscribeToDefaultTopics(userId?)` - Subscribe to default topics
- `unsubscribeFromTopics(userId?)` - Unsubscribe from topics

**Usage Example:**
```typescript
import { initializeFirebase } from './src/utils/initializeFirebase';

// In App.tsx
useEffect(() => {
  initializeFirebase();
}, []);
```

## Configuration

### Firebase Config

**Location:** `src/config/firebase.ts`

Exports:
- `firebaseAuth` - Auth instance
- `firebaseMessaging` - Messaging instance
- `isFirebaseInitialized()` - Check if Firebase is ready
- `FirebaseAuthTypes` - TypeScript types for Auth
- `FirebaseMessagingTypes` - TypeScript types for Messaging

## Best Practices

1. **Initialize Once:** Call `initializeFirebase()` only once in App.tsx
2. **Handle Errors:** Always wrap Firebase calls in try-catch blocks
3. **Cleanup Listeners:** Unsubscribe from listeners when component unmounts
4. **Secure Tokens:** Send FCM tokens to your backend securely
5. **Type Safety:** Use provided TypeScript types for better IDE support
6. **Testing:** Use `__DEV__` flag to enable debug logs in development only

## Error Handling

All services include error handling with user-friendly messages:

```typescript
try {
  await FirebaseAuthService.signInWithEmail(email, password);
} catch (error) {
  // Error message is already user-friendly
  Alert.alert('Error', error.message);
}
```

## Testing

See `FIREBASE_SETUP.md` for detailed testing instructions.

## Troubleshooting

**Authentication not working:**
- Verify Firebase project configuration
- Check google-services.json is in place
- Enable authentication method in Firebase Console

**Notifications not received:**
- Check notification permissions are granted
- Verify FCM token is generated
- Test with Firebase Console
- Check notification handler setup

**Build errors:**
- Clean build: `cd android && ./gradlew clean && cd ..`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check Firebase package versions are compatible
