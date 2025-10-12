# Google Places API & Permissions Setup Guide

## 📋 Table of Contents
1. [Google Places API Setup](#google-places-api-setup)
2. [iOS Permissions Configuration](#ios-permissions-configuration)
3. [Android Permissions Configuration](#android-permissions-configuration)
4. [Implementation Code](#implementation-code)
5. [Testing](#testing)

---

## 🗺️ Google Places API Setup

### Step 1: Create/Access Google Cloud Console Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
   - Click on the project dropdown at the top
   - Click "New Project"
   - Name it: **Mira E-Commerce App**
   - Click "Create"

### Step 2: Enable Required APIs

1. Navigate to **APIs & Services** → **Library**
2. Search for and enable the following APIs:
   - ✅ **Places API**
   - ✅ **Maps SDK for iOS**
   - ✅ **Maps SDK for Android**
   - ✅ **Geocoding API** (optional, for reverse geocoding)

### Step 3: Create API Keys

#### For iOS:
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API key**
3. Copy the API key
4. Click **Edit API key** (pencil icon)
5. Restrict the key:
   - **Application restrictions**: Select **iOS apps**
   - Add your bundle identifier: `com.yourcompany.mira` (or your actual bundle ID)
6. **API restrictions**: Select **Restrict key** and choose:
   - Places API
   - Maps SDK for iOS
   - Geocoding API
7. Click **Save**

#### For Android:
1. Create another API key following the same steps
2. Restrict the key:
   - **Application restrictions**: Select **Android apps**
   - Add package name: `com.yourcompany.mira`
   - Add SHA-1 certificate fingerprint (see below)
3. **API restrictions**: Same as iOS
4. Click **Save**

### Step 4: Get SHA-1 Certificate Fingerprint (Android)

#### For Debug Build:
```bash
cd android
./gradlew signingReport
```

Look for `SHA1:` under `Variant: debug` and copy it.

#### For Release Build:
```bash
keytool -list -v -keystore your-keystore.jks -alias your-key-alias
```

### Step 5: Add API Keys to Your Project

Create a `.env` file in the project root:

```env
# Google Places API Keys
GOOGLE_PLACES_API_KEY_IOS=your_ios_api_key_here
GOOGLE_PLACES_API_KEY_ANDROID=your_android_api_key_here

# Expo will expose these as process.env.EXPO_PUBLIC_...
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_IOS=your_ios_api_key_here
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_ANDROID=your_android_api_key_here
```

⚠️ **Important**: Add `.env` to your `.gitignore` file to keep keys secure!

---

## 📱 iOS Permissions Configuration

### Step 1: Update `app.json`

Add the following to your `app.json` under the `ios` section:

```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.yourcompany.mira",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Mira needs your location to provide accurate delivery addresses and show nearby stores.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Mira needs your location to track delivery status and provide real-time updates.",
        "NSLocationAlwaysUsageDescription": "Mira needs your location to track delivery status even when the app is in the background.",
        "UIBackgroundModes": ["location", "fetch", "remote-notification"],
        "NSUserTrackingUsageDescription": "Mira would like to track your activity to improve your shopping experience and show you relevant offers.",
        "NSPhotoLibraryUsageDescription": "Mira needs access to your photos to allow you to upload profile pictures.",
        "NSCameraUsageDescription": "Mira needs camera access to allow you to take photos for your profile.",
        "NSNotificationUsageDescription": "Mira needs permission to send you notifications about order status, delivery updates, and special offers."
      },
      "config": {
        "googleMapsApiKey": "YOUR_IOS_API_KEY_HERE"
      }
    }
  }
}
```

### Step 2: Request Location Permission (iOS)

In your code, request location permission:

```typescript
import * as Location from 'expo-location';

const requestLocationPermission = async () => {
  const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
  
  if (foregroundStatus === 'granted') {
    // For delivery tracking
    const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
    return backgroundStatus === 'granted';
  }
  
  return false;
};
```

### Step 3: Request Notification Permission (iOS)

```typescript
import * as Notifications from 'expo-notifications';

const requestNotificationPermission = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  return finalStatus === 'granted';
};
```

### Step 4: Request Tracking Permission (iOS 14+)

For iOS 14 and above, you need to request tracking permission for App Tracking Transparency:

```typescript
import { Platform } from 'react-native';
import * as Tracking from 'expo-tracking-transparency';

const requestTrackingPermission = async () => {
  if (Platform.OS === 'ios') {
    const { status } = await Tracking.requestTrackingPermissionsAsync();
    return status === 'granted';
  }
  return true; // Android doesn't need this
};
```

**Install the package:**
```bash
npx expo install expo-tracking-transparency
```

---

## 🤖 Android Permissions Configuration

### Step 1: Update `app.json`

Add the following to your `app.json` under the `android` section:

```json
{
  "expo": {
    "android": {
      "package": "com.yourcompany.mira",
      "permissions": [
        "ACCESS_COARSE_LOCATION",
        "ACCESS_FINE_LOCATION",
        "ACCESS_BACKGROUND_LOCATION",
        "POST_NOTIFICATIONS",
        "INTERNET",
        "ACCESS_NETWORK_STATE"
      ],
      "config": {
        "googleMaps": {
          "apiKey": "YOUR_ANDROID_API_KEY_HERE"
        }
      }
    }
  }
}
```

### Step 2: Update `AndroidManifest.xml`

If you're using a bare workflow or need to eject, add these to `android/app/src/main/AndroidManifest.xml`:

```xml
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <!-- Location Permissions -->
    <uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.ACCESS_BACKGROUND_LOCATION" />
    
    <!-- Notifications (Android 13+) -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
    
    <!-- Internet -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- Google Maps API Key -->
    <application>
        <meta-data
            android:name="com.google.android.geo.API_KEY"
            android:value="YOUR_ANDROID_API_KEY_HERE"/>
    </application>
</manifest>
```

### Step 3: Request Runtime Permissions (Android)

Android requires runtime permission requests for sensitive permissions:

```typescript
import { PermissionsAndroid, Platform } from 'react-native';

const requestAndroidPermissions = async () => {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        PermissionsAndroid.PERMISSIONS.ACCESS_BACKGROUND_LOCATION,
        PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      ]);
      
      return (
        granted['android.permission.ACCESS_FINE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED &&
        granted['android.permission.ACCESS_COARSE_LOCATION'] === PermissionsAndroid.RESULTS.GRANTED
      );
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
};
```

---

## 💻 Implementation Code

### Install Dependencies

```bash
cd /Users/mostafagml/mira/apps/mira
npm install
```

This will install:
- `@react-native-async-storage/async-storage`
- `expo-location`
- `expo-notifications`
- `react-native-google-places-autocomplete`
- `react-native-maps`

### Usage Example: Location Access Screen

The location access screen implementation is already created in:
- `src/screens/location/LocationAccessScreen.tsx`
- `src/screens/location/AddAddressScreen.tsx`

---

## 🧪 Testing

### Test Location Permission
1. Open the app
2. Navigate to Location Access screen
3. Tap "Current Location"
4. Accept the permission prompt
5. Verify location is retrieved

### Test Google Places Autocomplete
1. Navigate to Add Address screen
2. Type an address in the search field
3. Verify autocomplete suggestions appear
4. Select an address
5. Verify it populates on the map

### Test Notifications
1. Trigger a notification (e.g., order placed)
2. Verify notification appears in notification center
3. Tap notification to verify deep linking works

---

## 🔒 Security Best Practices

1. **Never commit API keys** to version control
2. Use **environment variables** for API keys
3. **Restrict API keys** by bundle ID/package name
4. **Enable API restrictions** to only necessary APIs
5. **Monitor usage** in Google Cloud Console to detect unauthorized use
6. For production, consider using a **proxy server** to hide API keys

---

## 📝 Additional Notes

### Billing
- Google Places API has a free tier with $200 monthly credit
- Monitor usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

### Rate Limiting
- Implement debouncing for autocomplete requests
- Cache frequently searched locations
- Use session tokens to reduce API costs

### Fallback
- Implement fallback for when location services are disabled
- Allow manual address entry
- Provide error messages for permission denials

---

## 🆘 Troubleshooting

### iOS Simulator Not Showing Permissions
- iOS Simulator has limited location simulation
- Test on a real device for accurate permission testing

### Android: Google Maps Not Showing
- Verify SHA-1 fingerprint is correct
- Check API key is added to `app.json`
- Ensure APIs are enabled in Google Cloud Console

### Autocomplete Not Working
- Check API key restrictions
- Verify Places API is enabled
- Check network connectivity
- Review console logs for errors

---

## 📚 Resources

- [Google Places API Documentation](https://developers.google.com/maps/documentation/places/web-service/overview)
- [Expo Location Documentation](https://docs.expo.dev/versions/latest/sdk/location/)
- [Expo Notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [React Native Maps Documentation](https://github.com/react-native-maps/react-native-maps)
- [Google Places Autocomplete Documentation](https://github.com/FaridSafi/react-native-google-places-autocomplete)

---

**Last Updated:** October 12, 2025

