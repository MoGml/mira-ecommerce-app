import { Platform } from 'react-native';
import { firebaseMessaging, FirebaseMessagingTypes } from '../config/firebase';
import * as Notifications from 'expo-notifications';

/**
 * Firebase Cloud Messaging Service
 * Provides methods for push notifications using Firebase Cloud Messaging
 */
class FirebaseMessagingService {
  private fcmToken: string | null = null;

  /**
   * Initialize messaging service
   * Request permissions and get FCM token
   */
  async initialize(): Promise<void> {
    try {
      // Request notification permissions
      const hasPermission = await this.requestPermission();

      if (!hasPermission) {
        console.warn('Notification permission not granted');
        return;
      }

      // Get FCM token
      await this.getFCMToken();

      // Setup notification handlers
      this.setupNotificationHandlers();

      // Handle token refresh
      this.setupTokenRefreshHandler();
    } catch (error) {
      console.error('Failed to initialize messaging service:', error);
      throw error;
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      const authStatus = await firebaseMessaging.requestPermission();
      const enabled =
        authStatus === 1 || // authorized
        authStatus === 2; // provisional

      if (enabled) {
        console.log('Notification permission granted:', authStatus);
      }

      return enabled;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token
   */
  async getFCMToken(): Promise<string | null> {
    try {
      if (this.fcmToken) {
        return this.fcmToken;
      }

      const token = await firebaseMessaging.getToken();
      this.fcmToken = token;
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  /**
   * Delete FCM token
   */
  async deleteFCMToken(): Promise<void> {
    try {
      await firebaseMessaging.deleteToken();
      this.fcmToken = null;
      console.log('FCM Token deleted');
    } catch (error) {
      console.error('Failed to delete FCM token:', error);
      throw error;
    }
  }

  /**
   * Setup notification handlers
   */
  private setupNotificationHandlers(): void {
    // Handle foreground messages
    firebaseMessaging.onMessage(async (remoteMessage) => {
      console.log('Foreground message received:', remoteMessage);
      await this.displayNotification(remoteMessage);
    });

    // Handle background/quit state messages
    firebaseMessaging.setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message received:', remoteMessage);
      // Background messages are automatically displayed by the system
    });

    // Handle notification opened from quit state
    firebaseMessaging.getInitialNotification().then((remoteMessage) => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage);
        this.handleNotificationOpen(remoteMessage);
      }
    });

    // Handle notification opened from background state
    firebaseMessaging.onNotificationOpenedApp((remoteMessage) => {
      console.log('Notification caused app to open from background state:', remoteMessage);
      this.handleNotificationOpen(remoteMessage);
    });
  }

  /**
   * Setup token refresh handler
   */
  private setupTokenRefreshHandler(): void {
    firebaseMessaging.onTokenRefresh(async (newToken) => {
      console.log('FCM Token refreshed:', newToken);
      this.fcmToken = newToken;
      // TODO: Send updated token to your backend server
    });
  }

  /**
   * Display notification when app is in foreground
   */
  private async displayNotification(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): Promise<void> {
    try {
      const notification = remoteMessage.notification;
      if (!notification) return;

      await Notifications.scheduleNotificationAsync({
        content: {
          title: notification.title || 'New Notification',
          body: notification.body || '',
          data: remoteMessage.data || {},
          sound: 'default',
        },
        trigger: null, // Show immediately
      });
    } catch (error) {
      console.error('Failed to display notification:', error);
    }
  }

  /**
   * Handle notification tap/open
   */
  private handleNotificationOpen(
    remoteMessage: FirebaseMessagingTypes.RemoteMessage
  ): void {
    // TODO: Navigate to appropriate screen based on notification data
    console.log('Notification data:', remoteMessage.data);
  }

  /**
   * Subscribe to a topic
   */
  async subscribeToTopic(topic: string): Promise<void> {
    try {
      await firebaseMessaging.subscribeToTopic(topic);
      console.log(`Subscribed to topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to subscribe to topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Unsubscribe from a topic
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    try {
      await firebaseMessaging.unsubscribeFromTopic(topic);
      console.log(`Unsubscribed from topic: ${topic}`);
    } catch (error) {
      console.error(`Failed to unsubscribe from topic ${topic}:`, error);
      throw error;
    }
  }

  /**
   * Set auto-initialization enabled
   */
  async setAutoInitEnabled(enabled: boolean): Promise<void> {
    try {
      await firebaseMessaging.setAutoInitEnabled(enabled);
      console.log(`Auto-initialization ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      console.error('Failed to set auto-initialization:', error);
      throw error;
    }
  }

  /**
   * Check if auto-initialization is enabled
   */
  async isAutoInitEnabled(): Promise<boolean> {
    try {
      return await firebaseMessaging.isAutoInitEnabled;
    } catch (error) {
      console.error('Failed to check auto-initialization status:', error);
      return false;
    }
  }

  /**
   * Get notification badge count (iOS only)
   */
  async getBadgeCount(): Promise<number> {
    if (Platform.OS !== 'ios') return 0;

    try {
      return await firebaseMessaging.getApplicationBadgeCount();
    } catch (error) {
      console.error('Failed to get badge count:', error);
      return 0;
    }
  }

  /**
   * Set notification badge count (iOS only)
   */
  async setBadgeCount(count: number): Promise<void> {
    if (Platform.OS !== 'ios') return;

    try {
      await firebaseMessaging.setApplicationBadgeCount(count);
      console.log(`Badge count set to ${count}`);
    } catch (error) {
      console.error('Failed to set badge count:', error);
      throw error;
    }
  }
}

export default new FirebaseMessagingService();
