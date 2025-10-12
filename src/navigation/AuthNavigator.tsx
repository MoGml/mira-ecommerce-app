import React, { useState, useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Location from 'expo-location';

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

  const handleSplashFinish = () => {
    setCurrentStep('language');
  };

  const handleLanguageSelected = (language: string) => {
    setSelectedLanguage(language);
    setCurrentStep('onboarding');
  };

  const handleOnboardingFinish = () => {
    setCurrentStep('phone-input');
  };

  const handlePhoneSubmitted = (phone: string, isRegistered: boolean, name?: string) => {
    setPhoneNumber(phone);
    setIsRegisteredUser(isRegistered);
    setUserName(name);
    setCurrentStep('otp-verification');
  };

  const handleOTPVerified = (isNewUser: boolean) => {
    if (isNewUser) {
      setCurrentStep('complete-profile');
    } else {
      setCurrentStep('location-access');
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

  const handleAddressConfirmed = (address: any) => {
    console.log('Address confirmed:', address);
    // Save address to user profile
    setCurrentStep('complete');
    onComplete();
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

