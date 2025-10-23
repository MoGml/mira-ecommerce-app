# iOS Firebase Setup Instructions

Since this is an Expo project, you'll need to generate the iOS native code first.

## Steps to configure Firebase for iOS:

1. **Generate iOS native code:**
   ```bash
   npx expo prebuild --platform ios
   ```

2. **Download GoogleService-Info.plist:**
   - Go to Firebase Console
   - Select your project
   - Go to Project Settings
   - Add an iOS app or select existing iOS app
   - Download the `GoogleService-Info.plist` file

3. **Add GoogleService-Info.plist to your project:**
   - Place the file in `ios/mira/GoogleService-Info.plist`

4. **Update Podfile:**
   The Podfile should already include Firebase dependencies after running `npx expo prebuild`

5. **Install iOS dependencies:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

## Package name for iOS:
- Bundle Identifier: `com.modawa.mira`

## Firebase Features Enabled:
- Firebase Authentication
- Firebase Cloud Messaging (Push Notifications)
