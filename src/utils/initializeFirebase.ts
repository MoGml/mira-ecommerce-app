import FirebaseMessagingService from '../services/FirebaseMessagingService';
import { isFirebaseInitialized } from '../config/firebase';
import * as Notifications from 'expo-notifications';

/**
 * Initialize Firebase services for the application
 * Call this function in your App.tsx on mount
 */
export const initializeFirebase = async (): Promise<void> => {
  try {
    // Check if Firebase is initialized
    if (!isFirebaseInitialized()) {
      console.error('Firebase is not properly initialized');
      return;
    }

    console.log('Firebase initialized successfully');

    // Initialize Firebase Cloud Messaging
    // Note: Notification handler is configured in FirebaseMessagingService.setupNotificationHandlers()
    // This includes support for both regular and silent notifications
    await FirebaseMessagingService.initialize();

    console.log('Firebase services initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Firebase services:', error);
    throw error;
  }
};

/**
 * Get and log FCM token
 * Useful for testing push notifications
 */
export const logFCMToken = async (): Promise<void> => {
  try {
    const token = await FirebaseMessagingService.getFCMToken();
    if (token) {
      console.log('='.repeat(60));
      console.log('FCM TOKEN FOR TESTING:');
      console.log(token);
      console.log('='.repeat(60));
    }
  } catch (error) {
    console.error('Failed to get FCM token:', error);
  }
};

/**
 * Subscribe to default notification topics
 * Customize based on your app's requirements
 */
export const subscribeToDefaultTopics = async (userId?: string): Promise<void> => {
  try {
    // Subscribe to general announcements
    await FirebaseMessagingService.subscribeToTopic('announcements');

    // Subscribe to user-specific topic if userId is provided
    if (userId) {
      await FirebaseMessagingService.subscribeToTopic(`user_${userId}`);
    }

    console.log('Subscribed to default topics');
  } catch (error) {
    console.error('Failed to subscribe to topics:', error);
  }
};

/**
 * Unsubscribe from notification topics
 * Call this on user logout
 */
export const unsubscribeFromTopics = async (userId?: string): Promise<void> => {
  try {
    // Unsubscribe from general announcements
    await FirebaseMessagingService.unsubscribeFromTopic('announcements');

    // Unsubscribe from user-specific topic if userId is provided
    if (userId) {
      await FirebaseMessagingService.unsubscribeFromTopic(`user_${userId}`);
    }

    console.log('Unsubscribed from topics');
  } catch (error) {
    console.error('Failed to unsubscribe from topics:', error);
  }
};
