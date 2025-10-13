# 🔒 Security Fix - Google API Key Exposure

## ⚠️ Issue

GitGuardian detected an exposed Google API Key in the repository:
- **Repository:** MoGml/mira-ecommerce-app
- **Secret type:** Google API Key
- **Pushed date:** October 13th 2025, 00:08:16 UTC

## ✅ Actions Taken

### 1. Removed Exposed API Key
- ✅ Removed API key from `app.json`
- ✅ Removed API key from `src/screens/location/AddAddressScreenWithPlaces.tsx`
- ✅ Updated code to use environment variables

### 2. Added to `.gitignore`
- ✅ Added `.env` files to gitignore
- ✅ Added `.env.local` to gitignore
- ✅ Added `.env.*.local` to gitignore

### 3. Created Example File
- ✅ Created `env.example` with placeholders

---

## 🚨 **IMPORTANT: You Must Do This Immediately**

### Step 1: Revoke the Exposed API Key

The exposed API key **MUST BE REVOKED** immediately:

1. Go to: https://console.cloud.google.com/apis/credentials
2. Find the exposed key: `AIzaSyA1wBN5q6PIct5UOkkAOosEhhm1x74guw4`
3. Click on it
4. Click **"Delete"** or **"Regenerate"**
5. Confirm deletion

**⚠️ Anyone who saw this key in the git history can use it until you revoke it!**

---

### Step 2: Generate New API Keys

Create new API keys with proper restrictions:

#### iOS API Key
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **"+ CREATE CREDENTIALS"** → **"API key"**
3. Name: `Mira iOS Key (New)`
4. **Application restrictions:**
   - Select **"iOS apps"**
   - Bundle ID: `com.modawa.mira`
5. **API restrictions:**
   - Select **"Restrict key"**
   - Enable: Places API, Maps SDK for iOS, Geocoding API
6. Click **"Save"**
7. **Copy the new key**

#### Android API Key
1. Click **"+ CREATE CREDENTIALS"** → **"API key"**
2. Name: `Mira Android Key (New)`
3. **Application restrictions:**
   - Select **"Android apps"**
   - Package name: `com.modawa.mira`
   - Add SHA-1 fingerprint
4. **API restrictions:**
   - Select **"Restrict key"**
   - Enable: Places API, Maps SDK for Android, Geocoding API
5. Click **"Save"**
6. **Copy the new key**

---

### Step 3: Create .env File (Local Development)

Create a new file `.env` in the project root:

```bash
cd /Users/mostafagml/mira/apps/mira
nano .env
```

Add your **NEW** API keys:

```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=AIzaSy...your_new_ios_key...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=AIzaSy...your_new_android_key...
```

**Save and exit** (Ctrl+X, then Y, then Enter)

**⚠️ NEVER commit the `.env` file to git!**

---

### Step 4: Update app.json for Builds

For EAS builds, you'll need to configure secrets:

```bash
# Add iOS key
npx eas secret:create --scope project --name GOOGLE_MAPS_API_KEY_IOS --value "your_new_ios_key"

# Add Android key
npx eas secret:create --scope project --name GOOGLE_MAPS_API_KEY_ANDROID --value "your_new_android_key"
```

Then update `app.json` to use EAS secrets:

```json
{
  "expo": {
    "ios": {
      "config": {
        "googleMapsApiKey": "${GOOGLE_MAPS_API_KEY_IOS}"
      }
    },
    "android": {
      "config": {
        "googleMaps": {
          "apiKey": "${GOOGLE_MAPS_API_KEY_ANDROID}"
        }
      }
    }
  }
}
```

---

### Step 5: Clean Git History (Advanced)

**⚠️ WARNING:** This rewrites git history and will affect all collaborators!

The exposed key is still in git history. To completely remove it:

```bash
cd /Users/mostafagml/mira/apps/mira

# Install BFG Repo-Cleaner (if not installed)
brew install bfg

# Create a backup first!
cd ..
git clone --mirror git@github.com:MoGml/mira-ecommerce-app.git mira-backup.git

# Replace the exposed key in history
cd mira-ecommerce-app
bfg --replace-text replacements.txt

# Or manually with git filter-branch (slower but built-in)
git filter-branch --force --index-filter \
  "git rm --cached --ignore-unmatch app.json src/screens/location/AddAddressScreenWithPlaces.tsx" \
  --prune-empty --tag-name-filter cat -- --all

# Force push (⚠️ WARNING: This will rewrite history!)
git push origin --force --all
git push origin --force --tags
```

**Alternative (Easier):** Contact GitHub support to completely purge the exposed key from cache.

---

## ✅ Updated Files

### `.gitignore`
```
# Environment variables
.env
.env.local
.env.*.local
```

### `env.example`
```env
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=your_ios_api_key_here
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=your_android_api_key_here
```

### `src/screens/location/AddAddressScreenWithPlaces.tsx`
```typescript
const GOOGLE_PLACES_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || 'YOUR_IOS_GOOGLE_PLACES_API_KEY',
  android: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || 'YOUR_ANDROID_GOOGLE_PLACES_API_KEY',
  default: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || 'YOUR_GOOGLE_PLACES_API_KEY',
});
```

---

## 🔐 Best Practices Going Forward

### 1. Never Commit Secrets
- ✅ Use `.env` files (already in `.gitignore`)
- ✅ Use EAS Secrets for production builds
- ✅ Use environment variables in code
- ❌ Never hardcode API keys

### 2. API Key Restrictions
- ✅ Always restrict by application (bundle ID/package name)
- ✅ Always restrict by API (only enable needed APIs)
- ✅ Set usage quotas and alerts
- ✅ Rotate keys periodically

### 3. Monitor for Leaks
- ✅ Enable GitGuardian (already done)
- ✅ Set up Google Cloud billing alerts
- ✅ Monitor API usage regularly
- ✅ Review git commits before pushing

### 4. Code Review Checklist
Before every commit, check:
- [ ] No API keys in code
- [ ] No passwords or tokens
- [ ] No `.env` files committed
- [ ] All secrets use environment variables

---

## 📞 If Key Was Abused

If you see unexpected API usage:

1. **Immediately revoke** the exposed key
2. **Check billing** in Google Cloud Console
3. **Generate new keys** with restrictions
4. **Report to Google** if charges are fraudulent
5. **Enable billing alerts** to prevent future abuse

---

## ✅ Verification Checklist

After completing the fix:

- [ ] Old API key revoked in Google Cloud Console
- [ ] New API keys created with proper restrictions
- [ ] `.env` file created locally (not committed)
- [ ] EAS secrets configured for production
- [ ] `app.json` uses environment variables
- [ ] Code uses `process.env` for API keys
- [ ] `.gitignore` includes `.env` files
- [ ] Tested app with new keys
- [ ] Git history cleaned (optional but recommended)
- [ ] Team notified about the change

---

## 🚀 Quick Fix Commands

```bash
cd /Users/mostafagml/mira/apps/mira

# 1. Create .env file
cat > .env << EOF
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS=YOUR_NEW_IOS_KEY_HERE
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID=YOUR_NEW_ANDROID_KEY_HERE
EOF

# 2. Verify .env is ignored
git status  # Should NOT show .env file

# 3. Test the app
npm start

# 4. Commit the security fixes
git add .
git commit -m "🔒 Security fix: Remove exposed API keys, use environment variables"
git push origin main
```

---

## 📚 Resources

- **Google API Key Best Practices:** https://cloud.google.com/docs/authentication/api-keys
- **EAS Secrets:** https://docs.expo.dev/build-reference/variables/
- **GitGuardian Docs:** https://docs.gitguardian.com/
- **Expo Environment Variables:** https://docs.expo.dev/guides/environment-variables/

---

**Status:** ✅ Code fixed, API key removed from repository

**Next Steps:** 
1. ⚠️ **REVOKE the old API key immediately**
2. ✅ **Generate new API keys**
3. ✅ **Create `.env` file with new keys**
4. ✅ **Test the app**
5. ✅ **Commit and push the fix**

