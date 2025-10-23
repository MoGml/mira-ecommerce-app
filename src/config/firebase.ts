import { FirebaseApp } from '@react-native-firebase/app';
import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth';
import messaging, { FirebaseMessagingTypes } from '@react-native-firebase/messaging';

/**
 * Firebase Configuration
 * This file initializes and exports Firebase services for the application
 */

// Firebase app is auto-initialized from google-services.json (Android) and GoogleService-Info.plist (iOS)

/**
 * Firebase Auth Instance
 */
export const firebaseAuth = auth();

/**
 * Firebase Messaging Instance
 */
export const firebaseMessaging = messaging();

/**
 * Check if Firebase is properly initialized
 */
export const isFirebaseInitialized = (): boolean => {
  try {
    return auth().app !== null;
  } catch (error) {
    console.error('Firebase initialization check failed:', error);
    return false;
  }
};

/**
 * Firebase App Instance Types
 */
export type { FirebaseAuthTypes, FirebaseMessagingTypes };

export default {
  auth: firebaseAuth,
  messaging: firebaseMessaging,
  isInitialized: isFirebaseInitialized,
};
