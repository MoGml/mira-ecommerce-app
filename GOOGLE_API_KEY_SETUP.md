# 🗺️ Google Places API Key Setup - Quick Guide

## 📍 What You Need

Google Places API key for:
- ✅ Address autocomplete
- ✅ Place search
- ✅ Reverse geocoding
- ✅ Map display

---

## 🚀 Quick Setup (5 minutes)

### Step 1: Go to Google Cloud Console

**Link:** https://console.cloud.google.com/

1. Sign in with your Google account
2. Click **Select a project** → **NEW PROJECT**
3. **Project name:** Mira App
4. Click **CREATE**

---

### Step 2: Enable Required APIs

1. Go to **APIs & Services** → **Library**
2. Search and **ENABLE** each of these:

   ✅ **Places API**
   - Click "Places API"
   - Click "ENABLE"

   ✅ **Maps SDK for iOS**
   - Search "Maps SDK for iOS"
   - Click "ENABLE"

   ✅ **Maps SDK for Android**
   - Search "Maps SDK for Android"
   - Click "ENABLE"

   ✅ **Geocoding API** (optional but recommended)
   - Search "Geocoding API"
   - Click "ENABLE"

---

### Step 3: Create API Keys

#### Create iOS API Key

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API key**
3. Copy the API key immediately (you'll need it)
4. Click **Edit API key** (pencil icon)
5. **Name:** Mira iOS Key
6. **Application restrictions:**
   - Select **iOS apps**
   - Click **ADD AN ITEM**
   - Bundle ID: `com.modawa.mira`
7. **API restrictions:**
   - Select **Restrict key**
   - Check:
     - ✅ Places API
     - ✅ Maps SDK for iOS
     - ✅ Geocoding API
8. Click **SAVE**

**Copy your iOS API key:**
```
AIzaSy...your_actual_ios_key_here...xyz
```

---

#### Create Android API Key

1. Click **+ CREATE CREDENTIALS** → **API key** again
2. Copy this API key
3. Click **Edit API key**
4. **Name:** Mira Android Key
5. **Application restrictions:**
   - Select **Android apps**
   - Click **ADD AN ITEM**
   - **Package name:** `com.modawa.mira`
   - **SHA-1 certificate fingerprint:** (see below how to get it)
6. **API restrictions:**
   - Select **Restrict key**
   - Check:
     - ✅ Places API
     - ✅ Maps SDK for Android
     - ✅ Geocoding API
7. Click **SAVE**

**Copy your Android API key:**
```
AIzaSy...your_actual_android_key_here...xyz
```

---

### Step 4: Get SHA-1 Fingerprint (Android)

#### For Debug Build:
```bash
cd /Users/mostafagml/mira/apps/mira/android
./gradlew signingReport
```

Look for:
```
Variant: debug
Config: debug
Store: ~/.android/debug.keystore
SHA1: AB:CD:EF:12:34:56:78:90:AB:CD:EF:12:34:56:78:90:AB:CD:EF:12
```

Copy the SHA1 value and add it to your Android API key restrictions.

---

### Step 5: Add API Keys to Your Project

Update these files:

#### 1. Update `app.json`

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "AIzaSy...your_ios_key...xyz"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "AIzaSy...your_android_key...xyz"
        }
      }
    }
  }
}
```

#### 2. Update AddAddressScreenWithPlaces.tsx

Replace the placeholder in `src/screens/location/AddAddressScreenWithPlaces.tsx`:

```typescript
const GOOGLE_PLACES_API_KEY = Platform.select({
  ios: 'AIzaSy...your_ios_key...xyz',
  android: 'AIzaSy...your_android_key...xyz',
  default: 'AIzaSy...your_ios_key...xyz',
});
```

---

### Step 6: Update Navigation to Use New Screen

Update `src/navigation/AuthNavigator.tsx`:

```typescript
// Change the import
import AddAddressScreen from '../screens/location/AddAddressScreenWithPlaces';

// Keep the rest as is
```

---

## 🔒 Security Best Practices

### Option 1: Use Environment Variables (Recommended)

1. Create `.env` file in project root:
```env
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_IOS=AIzaSy...your_ios_key...xyz
EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_ANDROID=AIzaSy...your_android_key...xyz
```

2. Add to `.gitignore`:
```
.env
.env.local
```

3. Use in code:
```typescript
const GOOGLE_PLACES_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_IOS,
  android: process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY_ANDROID,
});
```

4. Install dotenv:
```bash
npm install dotenv
```

---

### Option 2: Use expo-constants (Also Good)

1. Install:
```bash
npx expo install expo-constants
```

2. In code:
```typescript
import Constants from 'expo-constants';

const GOOGLE_PLACES_API_KEY = Platform.select({
  ios: Constants.expoConfig?.ios?.config?.googleMapsApiKey,
  android: Constants.expoConfig?.android?.config?.googleMaps?.apiKey,
});
```

---

## 💰 Cost & Limits

### Free Tier (Monthly)
- **$200 credit** (enough for ~28,000 autocomplete requests)
- **No credit card required** for testing
- Includes:
  - 1,000 autocomplete requests/day free
  - 28,500 map loads free
  - Geocoding: $5 per 1000 requests (covered by credit)

### Pricing After Free Tier
- **Autocomplete:** $2.83 per 1000 requests
- **Geocoding:** $5 per 1000 requests
- **Maps:** $7 per 1000 loads

### Set Billing Alerts
1. Go to **Billing** → **Budgets & alerts**
2. Create budget: $50/month
3. Set alert at 50%, 90%, 100%

---

## ✅ Testing Your Setup

### Test 1: Check API Key Works

Visit this URL in browser (replace YOUR_API_KEY):
```
https://maps.googleapis.com/maps/api/place/autocomplete/json?input=cairo&key=YOUR_API_KEY
```

Should return JSON with places.

---

### Test 2: Run the App

```bash
cd /Users/mostafagml/mira/apps/mira
npm start
```

1. Navigate to Add Address screen
2. Type in search box
3. See autocomplete suggestions
4. Select a place
5. Map should move to that location

---

## 🐛 Troubleshooting

### "This API key is not authorized"
**Fix:**
- Check bundle ID matches: `com.modawa.mira`
- Verify APIs are enabled
- Wait 5 minutes for changes to propagate

### "API key restrictions"
**Fix:**
- Make sure you restricted to correct APIs
- Verify SHA-1 is correct (Android)

### No autocomplete suggestions
**Fix:**
- Check API key is correct in code
- Verify Places API is enabled
- Check network connectivity
- Look at console logs for errors

### Maps showing blank/gray
**Fix:**
- Check Maps SDK for iOS/Android is enabled
- Verify API key in app.json
- Clear cache: `npx expo start -c`

---

## 📝 Quick Checklist

Before building/testing:
- [ ] Created Google Cloud Project
- [ ] Enabled all 4 APIs (Places, Maps iOS, Maps Android, Geocoding)
- [ ] Created iOS API key with bundle ID restriction
- [ ] Created Android API key with package name + SHA-1
- [ ] Added keys to `app.json`
- [ ] Added keys to `AddAddressScreenWithPlaces.tsx`
- [ ] Updated AuthNavigator to use new screen
- [ ] Tested autocomplete in simulator/device

---

## 🔗 Quick Links

- **Google Cloud Console:** https://console.cloud.google.com/
- **API Library:** https://console.cloud.google.com/apis/library
- **Credentials:** https://console.cloud.google.com/apis/credentials
- **Billing:** https://console.cloud.google.com/billing
- **Usage:** https://console.cloud.google.com/apis/dashboard

---

## 📧 Summary Email Template

Send this info to your team:

```
Google Places API Keys for Mira App

iOS API Key: AIzaSy...xyz
Android API Key: AIzaSy...xyz

Bundle ID: com.modawa.mira
Package Name: com.modawa.mira

Restrictions Applied:
- iOS: Bundle ID restricted
- Android: Package name + SHA-1 restricted
- APIs: Places API, Maps SDK, Geocoding API

Monthly Budget: $50
Alert thresholds: 50%, 90%, 100%

Project: Mira App
Project ID: mira-app-xxxxx
```

---

## ✨ Next Steps After Setup

1. **Commit changes:**
   ```bash
   git add .
   git commit -m "Add Google Places integration"
   git push
   ```

2. **Test thoroughly:**
   - Test autocomplete
   - Test map interaction
   - Test current location
   - Test delivery zone validation

3. **Monitor usage:**
   - Check Google Cloud Console daily
   - Monitor API calls
   - Optimize if needed

---

**Setup Time:** 5-10 minutes  
**Cost:** Free for testing (with $200 monthly credit)  
**Ready to use!** 🚀

