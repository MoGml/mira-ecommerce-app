# Environment Setup Guide

This guide will help you configure the necessary API keys and environment variables for the Mira e-commerce app.

## Prerequisites

Before building the app, you need to obtain API keys from:
1. Google Cloud Platform (for Maps and Places API)
2. Firebase (already partially configured)

---

## 1. Google Maps API Keys Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable billing (required for Maps API)

### Step 2: Enable Required APIs
Navigate to **APIs & Services > Library** and enable:
- ✅ Maps SDK for Android
- ✅ Maps SDK for iOS
- ✅ Places API
- ✅ Geocoding API

### Step 3: Create API Keys
1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. Create two separate keys:
   - One for Android
   - One for iOS

### Step 4: Restrict API Keys (IMPORTANT for security)

#### Android Key Restrictions:
- **Application restrictions**: Android apps
- **Package name**: `com.modawa.mira`
- **SHA-1 certificate fingerprint**: Get from your keystore
  ```bash
  # For debug keystore
  keytool -list -v -keystore android/app/debug.keystore -alias androiddebugkey -storepass android -keypass android
  ```

#### iOS Key Restrictions:
- **Application restrictions**: iOS apps
- **Bundle identifier**: `com.modawa.mira`

---

## 2. Configure Environment Variables

### Step 1: Copy the example file
```bash
cp .env.example .env
```

### Step 2: Edit .env file
Open [.env](.env) and replace the placeholder values:

```env
# Firebase Configuration
EXPO_PUBLIC_FIREBASE_API_KEY=AIza...your_actual_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=mira-xxxxx.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=mira-xxxxx
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=mira-xxxxx.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
EXPO_PUBLIC_FIREBASE_APP_ID=1:123456789:android:xxxxx

# Google Maps API Keys
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=AIza...your_ios_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=AIza...your_android_key

# API Configuration
EXPO_PUBLIC_API_URL=https://your-backend-api.com/api
```

---

## 3. Update Configuration Files

### Update app.json
Replace placeholder values in [app.json](app.json):

```json
"ios": {
  "config": {
    "googleMapsApiKey": "YOUR_ACTUAL_IOS_KEY"
  }
},
"android": {
  "config": {
    "googleMaps": {
      "apiKey": "YOUR_ACTUAL_ANDROID_KEY"
    }
  }
}
```

### Update AndroidManifest.xml
Edit [android/app/src/main/AndroidManifest.xml](android/app/src/main/AndroidManifest.xml#L21):

```xml
<meta-data
  android:name="com.google.android.geo.API_KEY"
  android:value="YOUR_ACTUAL_ANDROID_KEY"/>
```

### Update AppDelegate.swift (iOS)
Edit [ios/mira/AppDelegate.swift](ios/mira/AppDelegate.swift#L47):

```swift
GMSServices.provideAPIKey("YOUR_ACTUAL_IOS_KEY")
```

---

## 4. Verify Configuration

### Check .env file is loaded
The app uses environment variables with the `EXPO_PUBLIC_` prefix, which are automatically exposed to your app.

### Test location features
- Address autocomplete should work
- Maps should display correctly
- Geocoding should function

---

## 5. Build APK for Testing

Once all keys are configured:

### Option 1: EAS Build (Recommended)
```bash
# Preview build for internal testing
npx eas-cli build --platform android --profile preview

# Development build with dev client
npx eas-cli build --platform android --profile development
```

### Option 2: Local Build
```bash
# Generate release APK locally
npx expo run:android --variant release

# Or for debug build
npx expo run:android
```

---

## Security Notes

⚠️ **IMPORTANT**:
- Never commit `.env` file to git (already in .gitignore)
- Always restrict API keys by package name/bundle ID
- Use separate keys for development and production
- Monitor API usage in Google Cloud Console
- Set up billing alerts to avoid unexpected charges

---

## Troubleshooting

### Maps not loading
- Verify API key is correct in all locations
- Check that Maps SDK is enabled in Google Cloud
- Verify package name matches in restrictions

### Places autocomplete not working
- Ensure Places API is enabled
- Check API key restrictions
- Verify billing is enabled on Google Cloud project

### Build fails
- Run `npx expo prebuild --clean` to regenerate native folders
- Delete `node_modules` and reinstall: `npm install`
- Clear Metro cache: `npx expo start -c`

---

## Next Steps

After configuration:
1. ✅ Fill in `.env` with actual values
2. ✅ Update `app.json` with API keys
3. ✅ Update `AndroidManifest.xml`
4. ✅ Update `AppDelegate.swift` (for iOS)
5. ✅ Test the app locally
6. ✅ Build APK for internal testing
7. ✅ Distribute to testers

---

For more information:
- [Google Maps Platform Documentation](https://developers.google.com/maps/documentation)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [EAS Build Documentation](https://docs.expo.dev/build/introduction/)
