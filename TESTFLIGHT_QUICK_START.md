# 🚀 TestFlight Deployment - Quick Start

## ✅ Prerequisites Check

- [x] EAS Account: `mostafaalgamal` ✅
- [x] Bundle ID: `com.modawa.mira` ✅
- [ ] Apple Developer Account (Required)
- [ ] Apple Developer Program Membership ($99/year)

---

## 📋 Step-by-Step Commands

### Step 1: Initialize EAS Project

Run this command and answer the prompts:

```bash
cd /Users/mostafagml/mira/apps/mira
npx eas project:init
```

**Prompts you'll see:**
- `Would you like to create a project for @mostafaalgamal/mira?`
  - **Answer:** `Y` (Yes)

This creates the EAS project and links it to your Expo account.

---

### Step 2: Configure iOS Credentials

Run this command to set up your Apple credentials:

```bash
npx eas credentials
```

**Select:**
1. Platform: `iOS`
2. Action: `Set up credentials`

**You'll need:**
- Your **Apple ID** (email)
- Your **Apple ID Password**
- **App-Specific Password** (generate at https://appleid.apple.com)

---

### Step 3: Build for TestFlight

Run the production build command:

```bash
npx eas build --platform ios --profile production
```

**This will:**
- Build your iOS app
- Take ~15-20 minutes
- Generate an `.ipa` file
- Store it on EAS servers

**During build, you'll be asked:**
- `Generate a new Apple Distribution Certificate?` → **Yes**
- `Generate a new Apple Provisioning Profile?` → **Yes**

---

### Step 4: Monitor the Build

While building, you can:

**Check build status:**
```bash
npx eas build:list
```

**View build logs:**
- Visit: https://expo.dev/accounts/mostafaalgamal/projects/mira/builds

---

### Step 5: Create App in App Store Connect

While the build is running, prepare App Store Connect:

1. **Go to:** https://appstoreconnect.apple.com
2. Click **"My Apps"** → **"+"** → **"New App"**
3. Fill in:
   - **Platform:** iOS
   - **Name:** Mira
   - **Primary Language:** English
   - **Bundle ID:** `com.modawa.mira`
   - **SKU:** `mira-2025` (or any unique ID)
   - **User Access:** Full Access
4. Click **"Create"**

---

### Step 6: Submit to TestFlight (After Build Completes)

Once the build is complete, submit it:

```bash
npx eas submit --platform ios --latest
```

**You'll need:**
- **Apple ID** (your developer account email)
- **App-Specific Password**
  - Generate at: https://appleid.apple.com
  - Sign In → Security → App-Specific Passwords → **"Generate Password"**
  - Name it: "EAS Submit"
  - Copy the password

**Prompts:**
- `Apple ID:` → Your Apple developer email
- `App-Specific Password:` → Paste the password you generated

---

### Step 7: Configure TestFlight

After submission (5-10 minutes):

1. **Go to:** https://appstoreconnect.apple.com
2. Click **Mira** → **TestFlight** tab
3. Wait for build to appear (~5-10 minutes)
4. Click on the build
5. **Add Test Information:**
   ```
   Test the complete e-commerce experience including authentication,
   shopping cart, checkout, and user profile management.
   
   Test Credentials:
   - Phone: 01019233560
   - OTP: 1111
   - User: Mostafa
   ```
6. **Export Compliance:**
   - `Does your app use encryption?` → **No** (unless you added custom encryption)
7. Click **"Start Internal Testing"**

---

### Step 8: Add Testers

#### Internal Testing (Immediate):
1. **TestFlight** → **Internal Testing** → **Add Internal Testers**
2. Select team members (up to 100)
3. They'll receive an email invitation
4. Install TestFlight app from App Store
5. Accept invitation and test!

#### External Testing (Optional, requires review):
1. **TestFlight** → **External Testing** → **Create Group**
2. Name it: "Beta Testers"
3. Add tester emails
4. Submit for Beta App Review (~24-48 hours)

---

## 🎯 All Commands in One Place

```bash
# Navigate to project
cd /Users/mostafagml/mira/apps/mira

# Step 1: Initialize EAS project
npx eas project:init

# Step 2: Configure credentials (interactive)
npx eas credentials

# Step 3: Build for iOS
npx eas build --platform ios --profile production

# Step 4: Check build status
npx eas build:list

# Step 5: Submit to TestFlight (after build completes)
npx eas submit --platform ios --latest

# Step 6: Check submission status
npx eas build:list
```

---

## ⚠️ Important Requirements

### 1. Apple Developer Account
- **Required:** Yes
- **Cost:** $99/year
- **Sign up:** https://developer.apple.com/programs/

### 2. Apple ID 2FA
- **Required:** Yes
- Must have Two-Factor Authentication enabled

### 3. App-Specific Password
- **Generate at:** https://appleid.apple.com
- **Steps:**
  1. Sign in with Apple ID
  2. Security section
  3. App-Specific Passwords
  4. Generate new password
  5. Name it "EAS Submit"
  6. Copy and save it

### 4. Bundle ID Registration
EAS will automatically register `com.modawa.mira` for you during the build process if you have proper credentials.

---

## 📱 Testing Your App

After TestFlight setup:

1. **Install TestFlight** from App Store (on iPhone)
2. Open invitation email
3. Tap **"View in TestFlight"**
4. Tap **"Install"**
5. Open Mira app
6. Test with credentials:
   - Phone: `01019233560`
   - OTP: `1111`

---

## 🐛 Troubleshooting

### Error: "Apple Developer account not found"
**Solution:** Make sure you have an active Apple Developer Program membership ($99/year)

### Error: "Bundle identifier is already in use"
**Solution:** 
- Go to https://developer.apple.com/account/resources/identifiers/list
- Check if `com.modawa.mira` exists
- If yes, you're good to proceed
- If registered to another account, change bundle ID in `app.json`

### Build Failed
**Solution:**
- Check build logs: `npx eas build:list`
- View detailed logs on: https://expo.dev
- Common issues:
  - Missing credentials
  - Invalid bundle ID
  - Missing dependencies

### Submission Failed
**Solution:**
- Verify App Store Connect app exists
- Check Apple ID and App-Specific Password
- Ensure 2FA is enabled
- Wait a few minutes and retry

---

## 📊 Build Timeline

| Step | Duration | Total |
|------|----------|-------|
| Project Init | 1 min | 1 min |
| Credentials Setup | 5 min | 6 min |
| Build (iOS) | 15-20 min | 26 min |
| Submit to TestFlight | 2 min | 28 min |
| Processing | 5-10 min | 38 min |
| **Total Time** | | **~40 min** |

---

## ✅ Checklist

Before you start:
- [ ] Have Apple Developer Account ($99/year)
- [ ] Have Apple ID with 2FA enabled
- [ ] Generated App-Specific Password
- [ ] Created App Store Connect app
- [ ] Ready to wait ~40 minutes for full process

---

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Build shows "Complete" in EAS dashboard
- ✅ Build appears in App Store Connect → TestFlight
- ✅ Status changes from "Processing" to "Ready to Test"
- ✅ Testers receive invitation emails
- ✅ App installs via TestFlight on device

---

## 🔗 Important Links

- **EAS Dashboard:** https://expo.dev/accounts/mostafaalgamal/projects/mira
- **App Store Connect:** https://appstoreconnect.apple.com
- **Apple Developer:** https://developer.apple.com/account
- **Apple ID:** https://appleid.apple.com
- **EAS Docs:** https://docs.expo.dev/build/introduction/

---

## 📞 Need Help?

If you encounter issues:
1. Check EAS build logs
2. Review Apple Developer portal
3. Verify all credentials
4. Check this guide again
5. Ask for specific error messages

---

**Ready to deploy? Start with Step 1! 🚀**

Run: `npx eas project:init`

