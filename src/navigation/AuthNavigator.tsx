import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_KEY, ONBOARDING_SEEN_KEY, AUTH_STATUS_KEY, createGuestAddress, getGuestAddress, getBaseUrl, getDefaultHeaders } from '../services/api';

// Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LanguageScreen from '../screens/auth/LanguageScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import PhoneInputScreen from '../screens/auth/PhoneInputScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';
import LocationAccessScreen from '../screens/location/LocationAccessScreen';
import AddAddressScreen from '../screens/location/AddAddressScreen';
import GuestAddressScreen from '../screens/location/GuestAddressScreen';

type AuthFlowStep =
  | 'splash'
  | 'language'
  | 'onboarding'
  | 'phone-input'
  | 'otp-verification'
  | 'complete-profile'
  | 'location-access'
  | 'add-address'
  | 'complete';

interface AuthNavigatorProps {
  onComplete: () => void;
}

const AuthNavigator: React.FC<AuthNavigatorProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState<AuthFlowStep>('splash');
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isRegisteredUser, setIsRegisteredUser] = useState(false);
  const [userName, setUserName] = useState<string | undefined>();
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | undefined>();
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const init = async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
      const lang = (await AsyncStorage.getItem(LANGUAGE_KEY)) || 'en';
      setSelectedLanguage(lang);

      // Check if this is a guest user returning to the app
      const authStatus = await AsyncStorage.getItem(AUTH_STATUS_KEY);

      if (seen && authStatus === 'guest') {
        // Guest mode and onboarding already seen - check for guest address
        setIsGuestMode(true);
        try {
          const guestAddress = await getGuestAddress();
          if (guestAddress) {
            // Guest has an address - navigate to home
            await AsyncStorage.setItem('@mira_selected_address', JSON.stringify({
              id: guestAddress.id,
              tag: guestAddress.addressTag,
              description: guestAddress.description,
              lat: guestAddress.latitude,
              lng: guestAddress.longitude,
            }));
            setCurrentStep('complete');
            onComplete();
            return;
          } else {
            // Guest without address - go to add address
            setCurrentStep('add-address');
            return;
          }
        } catch (error) {
          console.log('[AUTH_NAVIGATOR] Error checking guest address:', error);
          // On error, go to add address screen
          setCurrentStep('add-address');
          return;
        }
      }

      if (seen) {
        setCurrentStep('phone-input');
      } else {
        setCurrentStep('language');
      }
    };
    init();
  }, []);

  const handleSplashFinish = () => {
    setCurrentStep('language');
  };

  const handleLanguageSelected = async (language: string) => {
    setSelectedLanguage(language);
    await AsyncStorage.setItem(LANGUAGE_KEY, language);
    setCurrentStep('onboarding');
  };

  const handleOnboardingFinish = async () => {
    await AsyncStorage.setItem(ONBOARDING_SEEN_KEY, 'true');
    setCurrentStep('phone-input');
  };

  const handlePhoneSubmitted = (phone: string, isRegistered: boolean, name?: string) => {
    setPhoneNumber(phone);
    setIsRegisteredUser(isRegistered);
    setUserName(name);
    setCurrentStep('otp-verification');
  };

  const handleOTPVerified = (isNewUser: boolean, needsAddressSetup?: boolean) => {
    if (isNewUser) {
      setCurrentStep('complete-profile');
    } else if (needsAddressSetup) {
      // Logged-in user needs address setup - go directly to address creation
      setCurrentStep('add-address');
    } else {
      // Logged-in user with existing address - complete the flow
      setCurrentStep('complete');
      onComplete();
    }
  };

  const handleProfileCompleted = () => {
    setCurrentStep('location-access');
  };

  const handleLocationGranted = (location: Location.LocationObject) => {
    setCurrentLocation(location);
    setCurrentStep('add-address');
  };

  const handleManualAddressEntry = () => {
    setCurrentStep('add-address');
  };

  const handleAddressConfirmed = async (address: any) => {
    let shouldNavigate = true;

    try {
      // GuestAddressScreen already handles API call and storage
      // Just need to verify the address was saved
      console.log('[AUTH_NAVIGATOR] Address confirmed:', address);

      // Double-check storage
      const savedAddress = await AsyncStorage.getItem('@mira_selected_address');
      if (!savedAddress) {
        // Fallback: save the address if not already saved
        await AsyncStorage.setItem('@mira_selected_address', JSON.stringify({
          id: address.id,
          tag: address.tag || 'Home',
          description: address.description || address.address,
          lat: address.latitude,
          lng: address.longitude,
        }));
      }
    } catch (e: any) {
      console.log('[AUTH_NAVIGATOR] Error in handleAddressConfirmed:', e);
      shouldNavigate = false;
    }

    // Navigate to home
    if (shouldNavigate) {
      setCurrentStep('complete');
      onComplete();
    }
  };

  const handleBackToPhoneInput = () => {
    setCurrentStep('phone-input');
  };

  const handleBackToOTP = () => {
    setCurrentStep('otp-verification');
  };

  const handleBackToLocationAccess = () => {
    setCurrentStep('location-access');
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 'splash':
        return <SplashScreen onFinish={handleSplashFinish} />;

      case 'language':
        return <LanguageScreen onNext={handleLanguageSelected} />;

      case 'onboarding':
        return <OnboardingScreen onFinish={handleOnboardingFinish} />;

      case 'phone-input':
        return (
          <PhoneInputScreen
            onNext={handlePhoneSubmitted}
            onSkip={async () => {
              await AsyncStorage.setItem(AUTH_STATUS_KEY, 'guest');
              setIsGuestMode(true);
              setCurrentStep('location-access');
            }}
            onBack={handleOnboardingFinish}
          />
        );

      case 'otp-verification':
        return (
          <OTPVerificationScreen
            phone={phoneNumber}
            isRegistered={isRegisteredUser}
            userName={userName}
            onVerified={handleOTPVerified}
            onBack={handleBackToPhoneInput}
          />
        );

      case 'complete-profile':
        return (
          <CompleteProfileScreen
            phone={phoneNumber}
            onComplete={handleProfileCompleted}
            onBack={handleBackToOTP}
          />
        );

      case 'location-access':
        return (
          <LocationAccessScreen
            onLocationGranted={handleLocationGranted}
            onManualAddress={handleManualAddressEntry}
          />
        );

      case 'add-address':
        // Use GuestAddressScreen for guest users, AddAddressScreen for registered users
        if (isGuestMode) {
          return (
            <GuestAddressScreen
              initialLocation={currentLocation}
              onConfirm={handleAddressConfirmed}
              onBack={currentLocation ? handleBackToLocationAccess : undefined}
            />
          );
        } else {
          return (
            <AddAddressScreen
              initialLocation={currentLocation}
              onConfirm={handleAddressConfirmed}
              onBack={handleBackToLocationAccess}
            />
          );
        }

      case 'complete':
        return (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF0000" />
          </View>
        );

      default:
        return <SplashScreen onFinish={handleSplashFinish} />;
    }
  };

  return <>{renderCurrentStep()}</>;
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
});

export default AuthNavigator;

