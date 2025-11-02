import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';

/**
 * Firebase Cloud Messaging Service using Expo Notifications
 * Provides push notification functionality
 */
class FirebaseMessagingService {
  private expoPushToken: string | null = null;
  private notificationReceivedSubscription: ReturnType<typeof Notifications.addNotificationReceivedListener> | null = null;
  private notificationResponseSubscription: ReturnType<typeof Notifications.addNotificationResponseReceivedListener> | null = null;

  /**
   * Initialize messaging service
   * Request permissions and get push token
   */
  async initialize(): Promise<void> {
    try {
      console.log('Initializing Firebase Cloud Messaging with Expo Notifications...');

      // Request notification permissions
      const hasPermission = await this.requestPermission();

      if (!hasPermission) {
        console.warn('Notification permission not granted');
        return;
      }

      // Get Expo push token
      await this.getFCMToken();

      // Setup notification handlers
      this.setupNotificationHandlers();

      console.log('FCM initialized successfully');
    } catch (error) {
      console.error('Failed to initialize messaging service:', error);
    }
  }

  /**
   * Request notification permissions
   */
  async requestPermission(): Promise<boolean> {
    try {
      if (!Device.isDevice) {
        console.warn('Must use physical device for push notifications');
        return false;
      }

      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('Notification permission not granted');
        return false;
      }

      // Set up notification channel for Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF0000',
        });
      }

      console.log('Notification permission granted');
      return true;
    } catch (error) {
      console.error('Failed to request notification permission:', error);
      return false;
    }
  }

  /**
   * Get FCM token (Expo Push Token)
   */
  async getFCMToken(): Promise<string | null> {
    try {
      if (this.expoPushToken) {
        return this.expoPushToken;
      }

      if (!Device.isDevice) {
        console.warn('Must use physical device for push notifications');
        return null;
      }

      const projectId = Constants.expoConfig?.extra?.eas?.projectId;
      if (!projectId) {
        throw new Error('Project ID not found');
      }

      const token = (await Notifications.getExpoPushTokenAsync({ projectId })).data;
      this.expoPushToken = token;
      console.log('Expo Push Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get push token:', error);
      return null;
    }
  }

  /**
   * Delete FCM token
   */
  async deleteFCMToken(): Promise<void> {
    try {
      this.expoPushToken = null;
      console.log('Push token cleared');
    } catch (error) {
      console.error('Failed to delete push token:', error);
    }
  }

  /**
   * Setup notification handlers
   */
  private setupNotificationHandlers(): void {
    // Remove existing listeners to prevent duplicates
    if (this.notificationReceivedSubscription) {
      this.notificationReceivedSubscription.remove();
    }
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.remove();
    }

    // Configure how notifications are presented when app is in foreground
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      }),
    });

    // Handle notification received while app is in foreground
    this.notificationReceivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
      console.log('Foreground notification received:', notification);
    });

    // Handle notification tap
    this.notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('Notification tapped:', response);
      this.handleNotificationOpen(response.notification.request.content.data);
    });
  }

  /**
   * Cleanup notification listeners
   */
  cleanup(): void {
    if (this.notificationReceivedSubscription) {
      this.notificationReceivedSubscription.remove();
      this.notificationReceivedSubscription = null;
    }
    if (this.notificationResponseSubscription) {
      this.notificationResponseSubscription.remove();
      this.notificationResponseSubscription = null;
    }
    console.log('Notification listeners cleaned up');
  }

  /**
   * Setup token refresh handler
   * Note: Expo handles token refresh automatically
   */
  setupTokenRefreshHandler(): void {
    console.log('Token refresh is handled automatically by Expo');
  }

  /**
   * Display notification when app is in foreground
   */
  async displayNotification(data: any): Promise<void> {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: data.title || 'New Notification',
          body: data.body || '',
          data: data.data || {},
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
  private handleNotificationOpen(data: any): void {
    // TODO: Navigate to appropriate screen based on notification data
    console.log('Notification data:', data);
  }

  /**
   * Subscribe to a topic
   * Note: Topic subscription is not supported with Expo push notifications
   * Use your backend to manage topic subscriptions with Firebase Admin SDK
   */
  async subscribeToTopic(topic: string): Promise<void> {
    console.log(`Topic subscription should be handled via your backend API. Topic: ${topic}`);
  }

  /**
   * Unsubscribe from a topic
   * Note: Topic unsubscription is not supported with Expo push notifications
   * Use your backend to manage topic subscriptions with Firebase Admin SDK
   */
  async unsubscribeFromTopic(topic: string): Promise<void> {
    console.log(`Topic unsubscription should be handled via your backend API. Topic: ${topic}`);
  }

  /**
   * Set auto-initialization enabled
   */
  async setAutoInitEnabled(enabled: boolean): Promise<void> {
    console.log(`Auto-initialization is always enabled with Expo: ${enabled}`);
  }

  /**
   * Check if auto-initialization is enabled
   */
  async isAutoInitEnabled(): Promise<boolean> {
    return true;
  }

  /**
   * Get notification badge count (iOS only)
   */
  async getBadgeCount(): Promise<number> {
    if (Platform.OS !== 'ios') return 0;

    try {
      return await Notifications.getBadgeCountAsync();
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
      await Notifications.setBadgeCountAsync(count);
      console.log(`Badge count set to ${count}`);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }
}

export default new FirebaseMessagingService();
