# 🚀 Deploy to TestFlight NOW - Step by Step

## ✅ Pre-Flight Checklist

Before you start, make sure you have:
- [ ] **Apple Developer Account** (active, paid $99/year)
- [ ] **Apple ID** credentials ready
- [ ] **iOS Google Maps API Key** configured in `app.json`
- [ ] Project committed to git

---

## 🎯 Quick Deployment Steps

### Step 1: Login to EAS (Expo Account)

```bash
cd /Users/mostafagml/mira/apps/mira
npx eas login
```

**Don't have an Expo account?**
- Go to https://expo.dev/signup
- Create a free account
- Come back and run the login command

---

### Step 2: Configure Apple Credentials

```bash
npx eas build:configure
```

This will:
- Detect your iOS project
- Ask about automatic credential management (choose **Yes**)

---

### Step 3: Build for iOS (Production)

```bash
npx eas build --platform ios --profile production
```

**What happens:**
1. EAS will ask for your **Apple ID** and **Password**
2. It will create/manage certificates automatically
3. Your code will be uploaded to EAS servers
4. Build will start (takes ~15-20 minutes)
5. You'll get a build URL to track progress

**Example output:**
```
✔ Build complete!
View build: https://expo.dev/accounts/your-account/projects/mira/builds/[BUILD_ID]
```

**While waiting:**
- Monitor build at https://expo.dev
- The build artifact will be `.ipa` file ready for TestFlight

---

### Step 4: Submit to TestFlight

After the build completes successfully:

```bash
npx eas submit --platform ios --latest
```

**You'll be asked for:**

1. **Apple ID:** your-apple-id@example.com
2. **App-specific password:**
   - Go to https://appleid.apple.com
   - Sign In → Security → App-Specific Passwords
   - Click **Generate an App-Specific Password**
   - Name it "EAS CLI"
   - Copy the password
   - Paste it when EAS asks

**What happens:**
- EAS uploads your `.ipa` to App Store Connect
- Build appears in TestFlight within 5-10 minutes
- Apple processes it for beta testing (~24 hours)

---

### Step 5: Configure in App Store Connect

1. Go to https://appstoreconnect.apple.com
2. Click **My Apps** → **Mira** (or create new app if doesn't exist)

#### If creating new app:
- Click **"+"** → **New App**
- Platform: **iOS**
- Name: **Mira**
- Primary Language: **English**
- Bundle ID: **com.mira.app**
- SKU: **mira-app**
- User Access: **Full Access**
- Click **Create**

3. Go to **TestFlight** tab
4. Wait for build to appear (refresh page after 5-10 min)
5. Click on the build when it appears

---

### Step 6: Complete Test Information

For your build in TestFlight:

**Test Information:**
- What to Test:
  ```
  Initial release of Mira e-commerce app.
  
  Test Flow:
  1. Phone verification (use: 01019233560, OTP: 1111)
  2. Browse categories and products
  3. Add items to cart
  4. Complete checkout flow
  5. Test location permissions
  
  Known Test Account:
  Phone: 01019233560
  Name: Mostafa
  OTP: 1111
  ```

**Export Compliance:**
- Does your app use encryption? **No** (unless you added custom encryption)
- Click **Start Internal Testing**

---

### Step 7: Add Testers

#### Internal Testing (Recommended first):
1. In TestFlight → **Internal Testing**
2. Click **"+"** or **App Store Connect Users**
3. Select team members to test
4. They'll receive email invitation

#### External Testing (Optional, requires review):
1. TestFlight → **External Testing**
2. Create group → Add tester emails
3. Submit for review (takes 24-48 hours)

---

### Step 8: Install & Test

**Testers:**
1. Install **TestFlight** app from App Store
2. Open invitation email
3. Tap **View in TestFlight**
4. Tap **Accept** → **Install**
5. Test the app!

---

## 🔧 Alternative: Manual Steps if Automated Fails

### Create App Manually in App Store Connect

1. **App Store Connect** → **My Apps** → **"+"** → **New App**
2. Fill form:
   - Platform: iOS
   - Name: Mira
   - Language: English
   - Bundle ID: com.mira.app
   - SKU: mira-2025
   - Full Access
3. **Create**

### Get Your App Info

After creating, note these values (needed for `eas.json`):

**App ID (ASC App ID):**
- Go to **App Information** → **General Information**
- Copy the **Apple ID** number (example: 1234567890)

**Team ID:**
- Go to https://developer.apple.com/account
- Click **Membership**
- Copy **Team ID** (example: ABCD123456)

Update `eas.json`:
```json
"submit": {
  "production": {
    "ios": {
      "appleId": "your-email@example.com",
      "ascAppId": "1234567890",
      "appleTeamId": "ABCD123456"
    }
  }
}
```

---

## 📱 App Store Listing (Optional, for full release later)

### App Information
- **Name:** Mira
- **Subtitle:** Everything you need, delivered fast
- **Category:** Shopping
- **Privacy Policy URL:** (required before public release)

### What's New
```
Version 1.0
• Phone-based authentication
• Browse categories and products  
• Express and scheduled delivery options
• Interactive cart management
• Secure checkout flow
• Location-based delivery
```

### Description
```
Mira - Your Ultimate Grocery Delivery App

Order everything you need from one place – anytime, anywhere!

🛒 SHOP SMART
• Browse thousands of products
• Quick search and filters
• Multiple categories

🚚 FAST DELIVERY
• Express delivery - Get it today
• Scheduled delivery - Plan ahead
• Real-time tracking

💳 EASY CHECKOUT
• Multiple payment options
• Secure transactions
• Order history

📍 LOCATION-BASED
• Automatic address detection
• Multiple delivery addresses
• Coverage verification

Download Mira today and experience hassle-free grocery shopping!
```

### Keywords (Max 100 characters)
```
grocery,delivery,shopping,food,express,cart,checkout,online
```

### Screenshots (Required)
You'll need to take screenshots from the iOS Simulator or real device:
1. Categories screen
2. Products list
3. Cart/Bag screen
4. Checkout screen
5. Profile screen

Take with Simulator (Cmd+S) or use Xcode's screenshot tool.

---

## 🐛 Troubleshooting

### Build Failed: "Unable to find bundle identifier"
**Fix:** Make sure `bundleIdentifier` in `app.json` matches what's registered in Apple Developer Portal

### Build Failed: "Provisioning profile error"
**Fix:**
```bash
npx eas credentials
# Select iOS → Manage credentials → Delete all → Try build again
```

### Submit Failed: "Invalid App Store Connect credentials"
**Fix:**
- Generate new app-specific password at appleid.apple.com
- Make sure 2FA is enabled on Apple ID

### Build takes too long
**Normal:** First builds can take 20-30 minutes
**Check status:** https://expo.dev/accounts/[your-account]/builds

### TestFlight build not appearing
**Wait:** Can take 5-15 minutes after submission
**Check:** App Store Connect → Activity tab → All Builds

---

## 📊 Build Status Commands

```bash
# Check all builds
npx eas build:list

# Check specific build
npx eas build:view BUILD_ID

# Download build locally  
npx eas build:download --id BUILD_ID

# Cancel ongoing build
npx eas build:cancel
```

---

## 🔄 Update/New Build Process

When you make changes and need a new build:

1. **Update version** in `app.json`:
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
   git commit -m "Version 1.0.1 - Your changes"
   git push
   ```

3. **Build:**
   ```bash
   npx eas build --platform ios --profile production
   ```

4. **Submit:**
   ```bash
   npx eas submit --platform ios --latest
   ```

---

## ⚡ Quick Command Reference

```bash
# Full deployment in one go (after initial setup)
cd /Users/mostafagml/mira/apps/mira

# Build
npx eas build --platform ios --profile production

# After build completes, submit
npx eas submit --platform ios --latest

# Check status anytime
npx eas build:list
```

---

## 🎉 Success Criteria

You'll know it worked when:
- ✅ Build completes on expo.dev
- ✅ .ipa file is generated
- ✅ Submission succeeds
- ✅ Build appears in App Store Connect → TestFlight
- ✅ Status changes to "Ready to Test"
- ✅ Testers can install via TestFlight app

---

## 📞 Need Help?

- **EAS Docs:** https://docs.expo.dev/build/introduction/
- **TestFlight Docs:** https://developer.apple.com/testflight/
- **Check builds:** https://expo.dev

---

## 🚀 Ready? Let's Deploy!

Run these commands **now**:

```bash
cd /Users/mostafagml/mira/apps/mira
npx eas login
npx eas build --platform ios --profile production
```

**That's it!** Follow the prompts and you'll have your app on TestFlight in about 20-30 minutes! 🎉

