import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

interface PhoneInputScreenProps {
  onNext: (phone: string, isRegistered: boolean, userName?: string) => void;
  onBack: () => void;
  onSkip: () => void;
}

const PhoneInputScreen: React.FC<PhoneInputScreenProps> = ({ onNext, onBack, onSkip }) => {
  const { checkPhoneNumber } = useAuth();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [countryCode] = useState('+2'); // Egypt

  const handleContinue = async () => {
    if (phoneNumber.length < 10) {
      Alert.alert('Invalid Phone', 'Please enter a valid phone number');
      return;
    }

    setIsLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('0') ? phoneNumber.substring(1) : phoneNumber;
      const result = await checkPhoneNumber(fullPhone);
      
      onNext(fullPhone, result.exists, result.userName);
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'apple' | 'google') => {
    Alert.alert('Coming Soon', `${provider === 'apple' ? 'Apple' : 'Google'} login will be available soon`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="close" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('../../../assets/logo.png')} 
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, styles.progressActive]} />
        </View>

        <Text style={styles.title}>Everything you{'\n'}need always</Text>

        {/* Phone Input */}
        <View style={styles.inputContainer}>
          <View style={styles.countryCodeContainer}>
            <Text style={styles.countryCode}>{countryCode}</Text>
          </View>
          <TextInput
            style={styles.phoneInput}
            placeholder="01092389284"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            maxLength={11}
          />
          {phoneNumber.length > 0 && (
            <TouchableOpacity onPress={() => setPhoneNumber('')}>
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>

        {/* Verify Button */}
        <TouchableOpacity
          style={[styles.verifyButton, !phoneNumber && styles.verifyButtonDisabled]}
          onPress={handleContinue}
          disabled={!phoneNumber || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.verifyButtonText}>Verify</Text>
          )}
        </TouchableOpacity>

        {/* Skip as Guest */}
        <TouchableOpacity
          style={styles.skipGuestButton}
          onPress={onSkip}
          disabled={isLoading}
        >
          <Text style={styles.skipGuestText}>Skip for now</Text>
        </TouchableOpacity>

        {/* Social login disabled for now */}

        <Text style={styles.termsText}>
          By using mira, you agree to the{'\n'}
          <Text style={styles.termsLink}>Terms</Text> and <Text style={styles.termsLink}>Privacy Policy</Text>
        </Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  backButton: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 20,
  },
  logoImage: {
    width: 100,
    height: 100,
  },
  progressBar: {
    flexDirection: 'row',
    marginBottom: 32,
    gap: 4,
  },
  progressSegment: {
    height: 3,
    flex: 1,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#000',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 32,
    lineHeight: 36,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#F8F8F8',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 12,
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    marginRight: 12,
  },
  countryCode: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  phoneInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  verifyButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  verifyButtonDisabled: {
    backgroundColor: '#CCC',
  },
  verifyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  skipGuestButton: {
    alignItems: 'center',
    paddingVertical: 8,
    marginBottom: 16,
  },
  skipGuestText: {
    color: '#FF0000',
    fontSize: 14,
    fontWeight: '600',
  },
  orText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    marginBottom: 16,
  },
  // socialButton styles removed while social login is disabled
  termsText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 12,
    marginTop: 'auto',
    marginBottom: 20,
    lineHeight: 18,
  },
  termsLink: {
    color: '#FF0000',
    fontWeight: '500',
  },
});

export default PhoneInputScreen;

