import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LANGUAGE_KEY, ONBOARDING_SEEN_KEY, AUTH_STATUS_KEY, createGuestAddress, getBaseUrl, getDefaultHeaders } from '../services/api';

// Screens
import SplashScreen from '../screens/auth/SplashScreen';
import LanguageScreen from '../screens/auth/LanguageScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import PhoneInputScreen from '../screens/auth/PhoneInputScreen';
import OTPVerificationScreen from '../screens/auth/OTPVerificationScreen';
import CompleteProfileScreen from '../screens/auth/CompleteProfileScreen';
import LocationAccessScreen from '../screens/location/LocationAccessScreen';
import AddAddressScreen from '../screens/location/AddAddressScreen';

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

  useEffect(() => {
    const init = async () => {
      const seen = await AsyncStorage.getItem(ONBOARDING_SEEN_KEY);
      const lang = (await AsyncStorage.getItem(LANGUAGE_KEY)) || 'en';
      setSelectedLanguage(lang);
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
    try {
      // Save guest address via API (guest flow only for now)
      const fcmToken = (await AsyncStorage.getItem('@mira_fcm_token')) || '';
      const payload = {
        fcmToken,
        description: address.address,
        addressTag: 'Home',
        Latitude: address.latitude,
        Longitude: address.longitude,
      };
      console.log('[GUEST_ADDRESS] Endpoint:', `${getBaseUrl()}Addresses/GuestAddress`);
      console.log('[GUEST_ADDRESS] Payload:', payload);
      console.log('[GUEST_ADDRESS] Headers:', await getDefaultHeaders());
      const response = await createGuestAddress(payload);
      console.log('[GUEST_ADDRESS] Response:', response);
      await AsyncStorage.setItem('@mira_selected_address', JSON.stringify({
        id: response?.addressId,
        tag: response?.tag || 'Home',
        description: response?.description || address.address,
        lat: address.latitude,
        lng: address.longitude,
      }));
    } catch (e: any) {
      console.log('[GUEST_ADDRESS] Error:', e);
      
      // Check if location is out of service
      if (e && e.isOutOfService) {
        // Don't navigate to home, stay on address screen to show overlay
        console.log('[GUEST_ADDRESS] Location out of service - staying on address screen');
        return;
      }
      
      // If API fails for other reasons, still persist locally so user can continue browsing
      await AsyncStorage.setItem('@mira_selected_address', JSON.stringify({
        tag: 'Home',
        description: address.address,
        lat: address.latitude,
        lng: address.longitude,
      }));
    } finally {
      // Only navigate if not out of service
      if (!(e && e.isOutOfService)) {
        setCurrentStep('complete');
        onComplete();
      }
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
        return (
          <AddAddressScreen
            initialLocation={currentLocation}
            onConfirm={handleAddressConfirmed}
            onBack={handleBackToLocationAccess}
          />
        );

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

