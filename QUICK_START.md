# 🚀 Mira E-Commerce App - Quick Start Guide

## 📦 Installation

```bash
cd /Users/mostafagml/mira/apps/mira
npm install
```

## ▶️ Run the App

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Expo Go
```bash
npm start
# Scan QR code with Expo Go app
```

---

## 🧪 Test Credentials

### Phone Verification
- **Registered User:** `01019233560` (Name: Mostafa)
- **New User:** Any other 11-digit number
- **Valid OTP:** `1111`

### Example Test Flow:
1. Enter phone: `01019233560`
2. Tap "Verify"
3. Enter OTP: `1111`
4. See "Welcome back Mostafa!"

---

## 🗺️ Google Places API Setup (Required for Maps)

### Quick Setup:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable **Places API** and **Maps SDK**
3. Create API keys (one for iOS, one for Android)
4. Update `app.json` with your API keys:

```json
{
  "ios": {
    "config": {
      "googleMapsApiKey": "YOUR_IOS_API_KEY"
    }
  },
  "android": {
    "config": {
      "googleMaps": {
        "apiKey": "YOUR_ANDROID_API_KEY"
      }
    }
  }
}
```

**Detailed Instructions:** See `GOOGLE_PLACES_SETUP.md`

---

## 📱 Features Implemented

### ✅ Authentication Flow
- Splash Screen
- Language Selection (Arabic/English)
- Onboarding (3 slides)
- Phone Verification
- OTP Entry
- Profile Completion (new users)
- Location Access
- Address Selection

### ✅ Shopping Features
- Categories & Subcategories
- Product Cards (with discounts, tags, UOM)
- Cart Management (Express & Scheduled)
- Out-of-Stock Handling
- Checkout Flow
- Authentication Guards

### ✅ Location Services
- Current Location Access
- Interactive Map
- Address Search (ready for Google Places)
- Delivery Zone Validation

---

## 🔑 App Permissions

### iOS
- Location (Always, When in Use)
- Notifications
- Tracking (iOS 14+)
- Camera
- Photo Library

### Android
- Location (Fine, Coarse, Background)
- Notifications
- Internet

All permissions are configured in `app.json`.

---

## 📁 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── CartItemCard.tsx
│   ├── ProductCard.tsx
│   ├── OutOfStockBanner.tsx
│   └── ...
├── context/            # React Context
│   └── AuthContext.tsx # Authentication state
├── models/             # TypeScript interfaces
│   └── data.ts
├── navigation/         # Navigation setup
│   ├── AppNavigator.tsx     # Main app navigation
│   └── AuthNavigator.tsx    # Auth flow navigation
├── screens/
│   ├── auth/          # Authentication screens
│   │   ├── SplashScreen.tsx
│   │   ├── LanguageScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── PhoneInputScreen.tsx
│   │   ├── OTPVerificationScreen.tsx
│   │   └── CompleteProfileScreen.tsx
│   ├── location/      # Location screens
│   │   ├── LocationAccessScreen.tsx
│   │   └── AddAddressScreen.tsx
│   ├── CategoriesScreen.tsx
│   ├── SubCategoriesScreen.tsx
│   ├── CartScreen.tsx
│   ├── CheckoutScreen.tsx
│   └── ...
```

---

## 🐛 Troubleshooting

### Maps Not Showing?
- Check API key is correct in `app.json`
- Verify APIs are enabled in Google Cloud Console
- Check bundle ID/package name restrictions

### Location Not Working?
- Grant location permission in device settings
- Test on real device (simulator has limitations)
- Check Info.plist/AndroidManifest.xml

### Dependencies Issue?
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Rebuild
npx expo start -c
```

---

## 📚 Documentation

- **Authentication Details:** `AUTH_IMPLEMENTATION_SUMMARY.md`
- **Google Places Setup:** `GOOGLE_PLACES_SETUP.md`
- **Cart & Checkout:** `CART_CHECKOUT_IMPLEMENTATION.md`

---

## 🌐 Repository

**GitHub:** https://github.com/MoGml/mira-ecommerce-app

---

## 🎯 Next Steps

1. **Replace Mock Data:**
   - Connect to backend API
   - Replace test phone numbers
   - Integrate real SMS service (Twilio, AWS SNS)

2. **Google Places:**
   - Get API keys
   - Configure autocomplete
   - Test address search

3. **Additional Features:**
   - Payment gateway integration
   - Order tracking
   - Push notifications
   - User profile management

---

## 💬 Support

For issues or questions, check:
- GitHub Issues
- Documentation files
- Code comments

---

**Happy Coding! 🎉**

