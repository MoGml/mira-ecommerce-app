# 🚀 TestFlight Deployment Guide for Mira App

## Prerequisites Checklist ✅

Before deploying to TestFlight, ensure you have:

- [ ] Apple Developer Account ($99/year)
- [ ] Admin access to App Store Connect
- [ ] Xcode installed (for iOS builds)
- [ ] EAS CLI installed
- [ ] App icons and splash screens ready
- [ ] Google Maps API keys configured
- [ ] App Bundle ID registered in Apple Developer Portal

---

## Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

Login to your Expo account:
```bash
eas login
```

If you don't have an Expo account, create one at https://expo.dev

---

## Step 2: Configure EAS Build

Initialize EAS in your project:

```bash
cd /Users/mostafagml/mira/apps/mira
eas build:configure
```

This will create an `eas.json` file. Update it with the following configuration:

```json
{
  "cli": {
    "version": ">= 5.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": false
      }
    },
    "production": {
      "distribution": "store",
      "ios": {
        "bundleIdentifier": "com.mira.app"
      }
    }
  },
  "submit": {
    "production": {
      "ios": {
        "appleId": "your-apple-id@email.com",
        "ascAppId": "YOUR_ASC_APP_ID",
        "appleTeamId": "YOUR_TEAM_ID"
      }
    }
  }
}
```

---

## Step 3: Update app.json Configuration

Make sure your `app.json` has the correct production settings:

```json
{
  "expo": {
    "name": "Mira",
    "slug": "mira",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "userInterfaceStyle": "light",
    "splash": {
      "image": "./assets/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#FF0000"
    },
    "ios": {
      "supportsTablet": false,
      "bundleIdentifier": "com.mira.app",
      "buildNumber": "1",
      "infoPlist": {
        "NSLocationWhenInUseUsageDescription": "Mira needs your location to provide accurate delivery addresses and show nearby stores.",
        "NSLocationAlwaysAndWhenInUseUsageDescription": "Mira needs your location to track delivery status and provide real-time updates.",
        "NSLocationAlwaysUsageDescription": "Mira needs your location to track delivery status even when the app is in the background.",
        "UIBackgroundModes": ["location", "fetch", "remote-notification"],
        "NSUserTrackingUsageDescription": "Mira would like to track your activity to improve your shopping experience and show you relevant offers.",
        "NSPhotoLibraryUsageDescription": "Mira needs access to your photos to allow you to upload profile pictures.",
        "NSCameraUsageDescription": "Mira needs camera access to allow you to take photos for your profile."
      },
      "config": {
        "googleMapsApiKey": "YOUR_IOS_GOOGLE_MAPS_API_KEY"
      }
    }
  }
}
```

**Important:** Replace `YOUR_IOS_GOOGLE_MAPS_API_KEY` with your actual iOS Google Maps API key.

---

## Step 4: Register App in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in the details:
   - **Platform:** iOS
   - **Name:** Mira
   - **Primary Language:** English
   - **Bundle ID:** Select `com.mira.app` (must match your app.json)
   - **SKU:** `mira-app` (unique identifier)
   - **User Access:** Full Access

4. Click **Create**

5. Note your **App ID** (you'll need it for eas.json)

---

## Step 5: Configure Apple Developer Portal

### 5.1 Create App ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account/)
2. Navigate to **Certificates, Identifiers & Profiles**
3. Click **Identifiers** → **"+"**
4. Select **App IDs** → Continue
5. Select **App** → Continue
6. Fill in:
   - **Description:** Mira E-Commerce App
   - **Bundle ID:** `com.mira.app` (Explicit)
7. Enable capabilities:
   - ✅ Push Notifications
   - ✅ Background Modes
   - ✅ Associated Domains (if needed)
8. Click **Continue** → **Register**

### 5.2 App Store Listing Assets

Prepare these assets:

#### App Icon (Required)
- **1024x1024px** PNG (no transparency, no rounded corners)

#### Screenshots (Required for at least one device)
- **iPhone 6.7" Display (iPhone 15 Pro Max):** 1290 x 2796 pixels
- **iPhone 6.5" Display (iPhone 11 Pro Max):** 1242 x 2688 pixels
- **iPhone 5.5" Display (iPhone 8 Plus):** 1242 x 2208 pixels

You'll need 3-10 screenshots showing:
1. Home/Categories screen
2. Product listing
3. Cart/Bag screen
4. Checkout flow
5. Profile/Account

#### App Preview Video (Optional)
- 15-30 seconds
- MP4 or MOV format

---

## Step 6: Build for Production

### Build the iOS app:

```bash
cd /Users/mostafagml/mira/apps/mira
eas build --platform ios --profile production
```

This will:
1. Ask you to configure Apple credentials (if not already done)
2. Generate certificates and provisioning profiles automatically
3. Build your app in the cloud
4. Provide a download link when complete

**Build time:** Usually 10-20 minutes

### Check build status:
```bash
eas build:list
```

Or visit: https://expo.dev/accounts/[your-account]/projects/mira/builds

---

## Step 7: Submit to TestFlight

Once the build is complete, submit it:

```bash
eas submit --platform ios --profile production
```

You'll be asked for:
- **Apple ID** (your developer account email)
- **App-specific password** (generate at appleid.apple.com)

Or submit with specific build ID:
```bash
eas submit --platform ios --latest
```

---

## Step 8: Configure TestFlight in App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Select your **Mira** app
3. Go to **TestFlight** tab
4. Wait for the build to appear (5-10 minutes after submission)
5. The build will go through **App Store Review** (usually 24-48 hours)

### While waiting, configure:

#### Test Information
1. Click on the build
2. Add **Test Information:**
   - **What to Test:** "Initial release. Test authentication flow, cart functionality, and checkout process."
   - **Test Account:** Provide test credentials
     ```
     Phone: 01019233560
     OTP: 1111
     ```
   - **Notes:** "This is a grocery delivery app. Location permissions required."

#### Export Compliance
1. Answer the export compliance questions
2. For most apps: **No** to encryption (unless you added custom encryption)

---

## Step 9: Add Testers

### Internal Testing (up to 100 testers)
1. Go to **TestFlight** → **Internal Testing**
2. Click **"+"** next to Internal Group
3. Add testers by email
4. Testers will receive an invitation email

### External Testing (up to 10,000 testers)
1. Go to **TestFlight** → **External Testing**
2. Create a new group
3. Add testers
4. Submit for beta review (required, takes 24-48 hours)

---

## Step 10: Testers Install the App

Testers need to:
1. Install **TestFlight** from App Store
2. Accept the invitation email
3. Open TestFlight app
4. Find **Mira** and tap **Install**
5. Test the app and provide feedback

---

## Troubleshooting Common Issues

### Issue 1: Build Fails - Missing Credentials
**Solution:**
```bash
eas credentials
```
Select your platform and regenerate credentials.

### Issue 2: Bundle ID Already Registered
**Solution:**
- Change bundle ID in `app.json` to something unique
- Or use your existing bundle ID if you own it

### Issue 3: Google Maps Not Working
**Solution:**
- Verify API key is correct in `app.json`
- Check bundle ID restriction in Google Cloud Console
- Make sure Places API and Maps SDK for iOS are enabled

### Issue 4: Build Rejected - Missing Privacy Manifest
**Solution:**
Add this to `app.json`:
```json
"ios": {
  "privacyManifests": {
    "NSPrivacyAccessedAPITypes": [
      {
        "NSPrivacyAccessedAPIType": "NSPrivacyAccessedAPICategoryUserDefaults",
        "NSPrivacyAccessedAPITypeReasons": ["CA92.1"]
      }
    ]
  }
}
```

### Issue 5: Location Permission Rejected
**Solution:**
- Ensure all location usage descriptions are clear and justified
- Update descriptions to be more specific about delivery tracking

---

## Update Builds

When you need to push an update:

1. **Increment version or build number** in `app.json`:
   ```json
   {
     "version": "1.0.1",
     "ios": {
       "buildNumber": "2"
     }
   }
   ```

2. **Commit changes:**
   ```bash
   git add .
   git commit -m "Version 1.0.1 - Bug fixes"
   git push
   ```

3. **Build new version:**
   ```bash
   eas build --platform ios --profile production
   ```

4. **Submit to TestFlight:**
   ```bash
   eas submit --platform ios --latest
   ```

---

## Production Release Checklist

Before submitting to App Store (not TestFlight):

- [ ] All TestFlight feedback addressed
- [ ] App tested on multiple iOS versions
- [ ] App Store screenshots prepared
- [ ] App description written
- [ ] Keywords optimized for SEO
- [ ] Privacy policy URL ready
- [ ] Support URL/email configured
- [ ] Pricing and availability set
- [ ] Age rating completed
- [ ] App review information filled

---

## Useful Commands

```bash
# Check EAS CLI version
eas --version

# Login to EAS
eas login

# Check build status
eas build:list

# Download build locally
eas build:download --id BUILD_ID

# View credentials
eas credentials

# Configure project
eas build:configure

# Run in development mode
npm start

# Clear cache and rebuild
eas build --platform ios --profile production --clear-cache
```

---

## Cost & Timeline

### Apple Developer Program
- **Cost:** $99/year
- **Required:** Yes, for TestFlight and App Store

### EAS Build
- **Free tier:** 30 builds/month
- **Production tier:** Unlimited builds ($29/month)

### Timeline
- **Initial build:** 10-20 minutes
- **TestFlight processing:** 5-10 minutes
- **Beta review:** 24-48 hours
- **Subsequent builds:** 10-20 minutes each

---

## Next Steps After TestFlight

1. **Gather feedback** from testers
2. **Fix bugs** and iterate
3. **Prepare for production** release
4. **Submit to App Store** for public release
5. **Monitor crash reports** in App Store Connect

---

## Support Resources

- **Expo Documentation:** https://docs.expo.dev/
- **EAS Build Docs:** https://docs.expo.dev/build/introduction/
- **TestFlight Guide:** https://developer.apple.com/testflight/
- **App Store Connect:** https://appstoreconnect.apple.com/

---

## Quick Reference

```bash
# Complete deployment workflow
cd /Users/mostafagml/mira/apps/mira

# 1. Install dependencies
npm install

# 2. Configure EAS
eas build:configure

# 3. Build for iOS
eas build --platform ios --profile production

# 4. Submit to TestFlight
eas submit --platform ios --latest

# 5. Check status
eas build:list
```

---

**Ready to deploy!** 🚀

Follow the steps above carefully, and your app will be on TestFlight soon!

