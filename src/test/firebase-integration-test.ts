/**
 * Firebase Integration Test
 *
 * This file contains manual test functions for Firebase integration.
 * Run these tests after setting up Firebase to verify everything works.
 *
 * Note: This is for manual testing only. Remove or disable in production.
 */

import FirebaseAuthService from '../services/FirebaseAuthService';
import FirebaseMessagingService from '../services/FirebaseMessagingService';
import { isFirebaseInitialized } from '../config/firebase';

/**
 * Test Firebase initialization
 */
export const testFirebaseInitialization = (): void => {
  console.log('=== Testing Firebase Initialization ===');
  const initialized = isFirebaseInitialized();
  console.log('Firebase Initialized:', initialized ? '✅' : '❌');

  if (!initialized) {
    console.error('Firebase is not properly initialized!');
  }
};

/**
 * Test Firebase Authentication
 */
export const testFirebaseAuth = async (
  testEmail: string = 'test@example.com',
  testPassword: string = 'test123456'
): Promise<void> => {
  console.log('=== Testing Firebase Authentication ===');

  try {
    // Test sign up
    console.log('Testing sign up...');
    const signUpResult = await FirebaseAuthService.signUpWithEmail(
      testEmail,
      testPassword
    );
    console.log('✅ Sign up successful:', signUpResult.user.uid);

    // Test sign out
    console.log('Testing sign out...');
    await FirebaseAuthService.signOut();
    console.log('✅ Sign out successful');

    // Test sign in
    console.log('Testing sign in...');
    const signInResult = await FirebaseAuthService.signInWithEmail(
      testEmail,
      testPassword
    );
    console.log('✅ Sign in successful:', signInResult.user.uid);

    // Test get current user
    const currentUser = FirebaseAuthService.getCurrentUser();
    console.log('✅ Current user:', currentUser?.email);

    // Test get ID token
    const idToken = await FirebaseAuthService.getIdToken();
    console.log('✅ ID Token obtained:', idToken.substring(0, 20) + '...');

  } catch (error: any) {
    console.error('❌ Auth test failed:', error.message);
  }
};

/**
 * Test Firebase Cloud Messaging
 */
export const testFirebaseMessaging = async (): Promise<void> => {
  console.log('=== Testing Firebase Cloud Messaging ===');

  try {
    // Test initialization
    console.log('Testing FCM initialization...');
    await FirebaseMessagingService.initialize();
    console.log('✅ FCM initialized');

    // Test get token
    console.log('Testing FCM token retrieval...');
    const token = await FirebaseMessagingService.getFCMToken();
    if (token) {
      console.log('✅ FCM Token:', token);
    } else {
      console.log('❌ Failed to get FCM token');
    }

    // Test topic subscription
    console.log('Testing topic subscription...');
    await FirebaseMessagingService.subscribeToTopic('test_topic');
    console.log('✅ Subscribed to test_topic');

    // Test topic unsubscription
    console.log('Testing topic unsubscription...');
    await FirebaseMessagingService.unsubscribeFromTopic('test_topic');
    console.log('✅ Unsubscribed from test_topic');

  } catch (error: any) {
    console.error('❌ Messaging test failed:', error.message);
  }
};

/**
 * Test auth state listener
 */
export const testAuthStateListener = (): () => void => {
  console.log('=== Testing Auth State Listener ===');

  const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
    if (user) {
      console.log('✅ Auth state changed - User logged in:', user.email);
    } else {
      console.log('✅ Auth state changed - User logged out');
    }
  });

  console.log('Auth state listener active');
  return unsubscribe;
};

/**
 * Run all tests
 */
export const runAllFirebaseTests = async (): Promise<void> => {
  console.log('\n🔥 Starting Firebase Integration Tests 🔥\n');

  // Test initialization
  testFirebaseInitialization();

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test messaging (doesn't require auth)
  await testFirebaseMessaging();

  // Wait a bit
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Test auth
  await testFirebaseAuth();

  console.log('\n✅ All Firebase tests completed\n');
};

/**
 * Usage instructions:
 *
 * 1. In your App.tsx or a test screen, import these functions:
 *    import { runAllFirebaseTests } from './src/test/firebase-integration-test';
 *
 * 2. Call the test in a useEffect or button press:
 *    useEffect(() => {
 *      if (__DEV__) {
 *        runAllFirebaseTests();
 *      }
 *    }, []);
 *
 * 3. Check the console for test results
 *
 * 4. Remove or disable these tests in production builds
 */
