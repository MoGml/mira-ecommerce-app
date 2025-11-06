# Silent Notifications Guide

## ✅ Silent Notifications Are Now Enabled!

Your Firebase notification system now supports **both regular notifications** (visible with sound) and **silent notifications** (background data updates without UI).

---

## 📋 What Are Silent Notifications?

Silent notifications (also called "background notifications" or "data-only notifications") are push notifications that:
- ✅ **Don't show any alert** to the user
- ✅ **Don't play any sound**
- ✅ **Don't update the badge**
- ✅ **Wake up the app** in the background to process data
- ✅ **Perfect for data syncing**, content updates, or background tasks

---

## 🎯 Use Cases

### 1. **Data Synchronization**
Silently sync user data, orders, inventory, or settings without disturbing the user.

### 2. **Order Status Updates**
Update order tracking information in the background so it's ready when the user opens the app.

### 3. **Content Pre-loading**
Download new content, images, or data before the user needs it.

### 4. **State Changes**
Update app state based on server-side changes (e.g., delivery driver location, inventory availability).

### 5. **Cache Invalidation**
Clear or refresh cached data when it becomes stale.

---

## 🔔 Notification Types

### Regular Notification (Visible)
```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "🎉 Order Delivered!",
  "body": "Your order #12345 has been delivered successfully.",
  "sound": "default",
  "badge": 1,
  "data": {
    "type": "order-delivered",
    "orderId": "12345"
  }
}
```

**Result:**
- ✅ Shows notification banner
- ✅ Plays sound
- ✅ Updates badge
- ✅ User can tap to open app

---

### Silent Notification (Background)
```json
{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "data": {
    "silent": true,
    "type": "order-update",
    "orderId": "12345",
    "status": "out-for-delivery",
    "driverLocation": {
      "lat": 30.0444,
      "lng": 31.2357
    }
  },
  "priority": "high",
  "_contentAvailable": true
}
```

**Result:**
- ❌ No notification banner
- ❌ No sound
- ❌ No badge update
- ✅ App wakes up in background
- ✅ Data is processed silently

**Key Difference:** The `"silent": true` flag in the `data` object!

---

## 🚀 How to Send Silent Notifications

### Option 1: Using Expo Push API

```javascript
// backend/sendSilentNotification.js
const fetch = require('node-fetch');

async function sendSilentNotification(expoPushToken, data) {
  const message = {
    to: expoPushToken,
    data: {
      silent: true,  // ← THIS IS THE KEY!
      type: 'order-update',
      orderId: '12345',
      status: 'delivered',
      ...data
    },
    priority: 'high',
    _contentAvailable: true  // iOS background content
  };

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(message)
  });

  return response.json();
}

// Usage
await sendSilentNotification('ExponentPushToken[...]', {
  orderId: '12345',
  newStatus: 'delivered'
});
```

---

### Option 2: Using Firebase Admin SDK

```javascript
// backend/firebaseSilentNotification.js
const admin = require('firebase-admin');

async function sendSilentNotificationViaFirebase(expoPushToken, data) {
  const message = {
    token: expoPushToken,
    data: {
      silent: 'true',  // Must be string in Firebase
      type: 'data-sync',
      ...data
    },
    android: {
      priority: 'high',
    },
    apns: {
      headers: {
        'apns-priority': '5',
        'apns-push-type': 'background'
      },
      payload: {
        aps: {
          'content-available': 1
        }
      }
    }
  };

  return admin.messaging().send(message);
}
```

---

### Option 3: Using curl (for testing)

```bash
curl -X POST https://exp.host/--/api/v2/push/send \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
    "data": {
      "silent": true,
      "type": "data-sync",
      "message": "Background sync triggered"
    },
    "priority": "high",
    "_contentAvailable": true
  }'
```

---

## 💻 Handling Silent Notifications in Your App

### Method 1: Register a Global Handler

In your [App.tsx](App.tsx) or main component:

```typescript
import { useEffect } from 'react';
import FirebaseMessagingService from './src/services/FirebaseMessagingService';

export default function App() {
  useEffect(() => {
    // Register handler for silent notifications
    FirebaseMessagingService.setSilentNotificationHandler((data) => {
      console.log('🔕 Silent notification received:', data);

      // Handle different notification types
      switch (data.type) {
        case 'order-update':
          // Update order state
          updateOrderStatus(data.orderId, data.status);
          break;

        case 'data-sync':
          // Trigger data synchronization
          syncAppData();
          break;

        case 'content-refresh':
          // Refresh content
          refreshContent();
          break;

        default:
          console.log('Unknown silent notification type:', data.type);
      }
    });

    // Cleanup on unmount
    return () => {
      FirebaseMessagingService.removeSilentNotificationHandler();
    };
  }, []);

  return (
    // Your app content...
  );
}
```

---

### Method 2: Built-in Type Handlers

The [FirebaseMessagingService](src/services/FirebaseMessagingService.ts) has built-in handlers for common notification types:

#### Supported Types:

1. **`data-sync`** - Triggers general data synchronization
2. **`order-update`** - Handles order status updates
3. **`content-refresh`** - Refreshes app content

Example payload:
```json
{
  "silent": true,
  "type": "order-update",
  "orderId": "12345",
  "status": "delivered",
  "timestamp": 1699876543
}
```

To implement the logic for these types, edit [FirebaseMessagingService.ts](src/services/FirebaseMessagingService.ts#L254-L270).

---

## 🧪 Testing Silent Notifications

### Step 1: Get Your Push Token

Run your app and check the console logs:
```
Expo Push Token: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
```

Copy this token.

---

### Step 2: Send a Test Silent Notification

Create a test file:

```javascript
// testSilentNotification.js
const fetch = require('node-fetch');

async function testSilentNotification() {
  const token = 'ExponentPushToken[YOUR_TOKEN_HERE]';

  const response = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      data: {
        silent: true,
        type: 'data-sync',
        testMessage: 'This is a silent notification test!',
        timestamp: Date.now()
      },
      priority: 'high',
      _contentAvailable: true
    })
  });

  const result = await response.json();
  console.log('Notification sent:', result);
}

testSilentNotification();
```

Run it:
```bash
node testSilentNotification.js
```

---

### Step 3: Verify in App Console

You should see in your app console:
```
🔕 Silent notification received: {
  silent: true,
  type: 'data-sync',
  testMessage: 'This is a silent notification test!',
  timestamp: 1699876543000
}
📦 Processing silent notification data: {...}
🔄 Triggering data sync...
```

**Important:** You won't see any UI notification - that's correct for silent notifications!

---

## 📱 Platform-Specific Behavior

### iOS
- ✅ Silent notifications work even when app is closed
- ✅ Requires `UIBackgroundModes` with `remote-notification` (already configured in [app.json](app.json#L28))
- ⚠️ iOS may throttle silent notifications to conserve battery
- ⚠️ Requires physical device (doesn't work on simulator)

### Android
- ✅ Silent notifications work when app is in foreground or background
- ✅ Requires `priority: 'high'` for reliable delivery
- ✅ Works on emulator and physical devices
- ⚠️ Doze mode may delay notifications

---

## 🔧 Advanced Configuration

### Custom Silent Notification Handler

```typescript
import FirebaseMessagingService from './src/services/FirebaseMessagingService';
import { store } from './src/redux/store';
import { updateOrder } from './src/redux/orderSlice';

// Set up custom handler
FirebaseMessagingService.setSilentNotificationHandler(async (data) => {
  console.log('Processing silent notification:', data);

  try {
    switch (data.type) {
      case 'order-update':
        // Update Redux store
        store.dispatch(updateOrder({
          orderId: data.orderId,
          status: data.status
        }));

        // Update AsyncStorage
        await AsyncStorage.setItem(
          `order_${data.orderId}`,
          JSON.stringify(data)
        );
        break;

      case 'inventory-update':
        // Refresh inventory from API
        await fetchAndUpdateInventory();
        break;

      case 'user-data-sync':
        // Sync user data
        await syncUserData();
        break;

      default:
        console.warn('Unknown notification type:', data.type);
    }
  } catch (error) {
    console.error('Error handling silent notification:', error);
  }
});
```

---

## 🎨 Notification Comparison

| Feature | Regular Notification | Silent Notification |
|---------|---------------------|---------------------|
| **Shows Banner** | ✅ Yes | ❌ No |
| **Plays Sound** | ✅ Yes | ❌ No |
| **Updates Badge** | ✅ Yes | ❌ No |
| **Wakes App** | ✅ Yes | ✅ Yes |
| **User Visible** | ✅ Yes | ❌ No |
| **Can Tap** | ✅ Yes | ❌ No |
| **Background Processing** | ✅ Yes | ✅ Yes |
| **Data Payload** | ✅ Yes | ✅ Yes |
| **Requires `silent: true`** | ❌ No | ✅ **YES** |

---

## 📚 Code References

- **Silent Notification Detection**: [FirebaseMessagingService.ts:130-133](src/services/FirebaseMessagingService.ts#L130-L133)
- **Notification Handler**: [FirebaseMessagingService.ts:148-176](src/services/FirebaseMessagingService.ts#L148-L176)
- **Silent Processing Logic**: [FirebaseMessagingService.ts:241-271](src/services/FirebaseMessagingService.ts#L241-L271)
- **Handler Registration**: [FirebaseMessagingService.ts:292-303](src/services/FirebaseMessagingService.ts#L292-L303)

---

## ⚠️ Important Notes

1. **The `silent: true` flag is required** in the `data` object for silent notifications to work
2. **Don't include `title` or `body`** in silent notifications - they're data-only
3. **Use `priority: 'high'`** for reliable delivery on Android
4. **iOS requires physical device** - silent notifications don't work on simulator
5. **Silent notifications may be throttled** by the OS to conserve battery
6. **Background time is limited** - complete processing quickly (< 30 seconds)

---

## 🐛 Troubleshooting

### Silent Notification Shows UI
**Problem:** Notification shows alert even with `silent: true`

**Solution:** Verify the notification payload:
- ✅ Has `"silent": true` in `data` object (not root level)
- ❌ Remove `title` and `body` fields
- ❌ Remove `sound` field

### Silent Notification Not Received
**Problem:** App doesn't wake up for silent notification

**Solution:**
- ✅ Check push token is correct
- ✅ Use `priority: 'high'` for Android
- ✅ Add `_contentAvailable: true` for iOS
- ✅ Test on physical device (not simulator)
- ✅ Verify app has notification permissions

### Handler Not Called
**Problem:** `setSilentNotificationHandler` callback not executing

**Solution:**
- ✅ Register handler before sending notification
- ✅ Check console for error messages
- ✅ Verify `silent: true` is in notification payload

---

## 🎉 Summary

Your app now supports both **regular** and **silent** notifications:

✅ **Regular notifications** show UI and alert users
✅ **Silent notifications** process data in background
✅ **Easy to use** - just add `"silent": true` to payload
✅ **Customizable** - register your own handlers
✅ **Production ready** - works on iOS and Android

Start sending silent notifications to improve your app's data freshness without disturbing users! 🚀
