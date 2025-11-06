import { initializeApp, FirebaseApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { Platform } from 'react-native';
import Constants from 'expo-constants';

/**
 * Firebase Configuration
 * This file initializes and exports Firebase services for the application
 */

// Get the correct App ID based on platform
const getFirebaseAppId = () => {
  if (Platform.OS === 'ios') {
    return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID_IOS;
  } else if (Platform.OS === 'android') {
    return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID_ANDROID;
  }
  // Fallback for web or other platforms
  return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_APP_ID_IOS;
};

// Get the correct Measurement ID based on platform
const getFirebaseMeasurementId = () => {
  if (Platform.OS === 'ios') {
    return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID_IOS;
  } else if (Platform.OS === 'android') {
    return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID_ANDROID;
  }
  // Fallback for web or other platforms
  return Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID_IOS;
};

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Constants.expoConfig?.extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: getFirebaseAppId(),
  measurementId: getFirebaseMeasurementId(),
};

// Initialize Firebase
let firebaseApp: FirebaseApp;
if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
} else {
  firebaseApp = getApps()[0];
}

/**
 * Firebase Auth Instance
 */
export const firebaseAuth: Auth = getAuth(firebaseApp);

/**
 * Firebase App Instance
 */
export const app = firebaseApp;

/**
 * Check if Firebase is properly initialized
 */
export const isFirebaseInitialized = (): boolean => {
  try {
    return firebaseApp !== null && firebaseAuth !== null;
  } catch (error) {
    console.error('Firebase initialization check failed:', error);
    return false;
  }
};

export default {
  auth: firebaseAuth,
  app: firebaseApp,
  isInitialized: isFirebaseInitialized,
};
