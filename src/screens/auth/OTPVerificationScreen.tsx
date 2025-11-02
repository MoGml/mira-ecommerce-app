import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';

interface OTPVerificationScreenProps {
  phone: string;
  isRegistered: boolean;
  userName?: string;
  onVerified: (isNewUser: boolean, needsAddressSetup?: boolean) => void;
  onBack: () => void;
}

const OTPVerificationScreen: React.FC<OTPVerificationScreenProps> = ({
  phone,
  isRegistered,
  userName,
  onVerified,
  onBack,
}) => {
  const { login } = useAuth();
  const [otp, setOtp] = useState(['', '', '', '']);
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = [
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
    useRef<TextInput>(null),
  ];

  useEffect(() => {
    // Focus first input on mount
    inputRefs[0].current?.focus();

    // Start resend timer
    const timer = setInterval(() => {
      setResendTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.slice(0, 4).split('');
      const newOtp = [...otp];
      digits.forEach((digit, i) => {
        if (index + i < 4) {
          newOtp[index + i] = digit;
        }
      });
      setOtp(newOtp);
      
      const nextIndex = Math.min(index + digits.length, 3);
      inputRefs[nextIndex].current?.focus();
      
      if (newOtp.every(d => d !== '')) {
        handleVerify(newOtp.join(''));
      }
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs[index + 1].current?.focus();
    }

    // Auto-submit when all digits are entered
    if (value && index === 3 && newOtp.every(d => d !== '')) {
      handleVerify(newOtp.join(''));
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs[index - 1].current?.focus();
    }
  };

  const handleVerify = async (otpCode?: string) => {
    const code = otpCode || otp.join('');

    if (code.length !== 4) {
      Alert.alert('Invalid OTP', 'Please enter a 4-digit code');
      return;
    }

    setIsLoading(true);
    try {
      if (isRegistered) {
        // Existing user - call login API
        console.log('📱 [OTP] Existing user - calling login API');
        const result = await login(phone, code);

        if (result.success) {
          onVerified(false, result.needsAddressSetup);
        } else {
          Alert.alert('Invalid Code', result.error || 'The code you entered is incorrect');
          setOtp(['', '', '', '']);
          inputRefs[0].current?.focus();
        }
      } else {
        // New user - just verify OTP and proceed to registration
        console.log('📱 [OTP] New user - OTP verified, proceeding to registration');

        // TODO: In a real app, you would verify the OTP with Firebase or your SMS service here
        // For now, we'll accept any 4-digit code and proceed to registration

        // Proceed to complete profile (registration form)
        onVerified(true, undefined);
      }
    } catch (error) {
      Alert.alert('Error', 'Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = () => {
    Alert.alert('Code Sent', 'A new verification code has been sent to your phone');
    setResendTimer(30);
    setOtp(['', '', '', '']);
    inputRefs[0].current?.focus();
  };

  const formatPhone = (phoneNumber: string) => {
    return `+20${phoneNumber}`;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <TouchableOpacity style={styles.backButton} onPress={onBack}>
        <Ionicons name="chevron-back" size={24} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <View style={styles.logoHandle} />
          </View>
          <Text style={styles.logoText}>mira</Text>
        </View>

        <View style={styles.progressBar}>
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={[styles.progressSegment, styles.progressActive]} />
          <View style={[styles.progressSegment, styles.progressActive]} />
        </View>

        <Text style={styles.title}>
          {isRegistered && userName 
            ? `Welcome back ${userName}!`
            : "We Just texted you, what's{'\n'}the code?"}
        </Text>

        {!isRegistered && (
          <Text style={styles.subtitle}>
            Please enter the code you{'\n'}
            <Text style={styles.subtitleBold}>received</Text>
          </Text>
        )}

        <Text style={styles.phoneText}>
          Enter the SMS code sent to: <Text style={styles.phoneNumber}>{formatPhone(phone)}</Text>
        </Text>

        {/* OTP Input */}
        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={inputRefs[index]}
              style={styles.otpInput}
              value={digit}
              onChangeText={(value) => handleOtpChange(value, index)}
              onKeyPress={(e) => handleKeyPress(e, index)}
              keyboardType="number-pad"
              maxLength={1}
              selectTextOnFocus
            />
          ))}
        </View>

        {/* Resend Code */}
        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleResend}
          disabled={resendTimer > 0}
        >
          <Ionicons name="refresh" size={16} color={resendTimer > 0 ? '#CCC' : '#FF0000'} />
          <Text style={[styles.resendText, resendTimer > 0 && styles.resendTextDisabled]}>
            {resendTimer > 0 ? `Resend Code ${resendTimer}s` : 'Resend code'}
          </Text>
        </TouchableOpacity>

        {/* Continue Button (for manual submission) */}
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.continueButton, otp.some(d => !d) && styles.continueButtonDisabled]}
            onPress={() => handleVerify()}
            disabled={otp.some(d => !d) || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Ionicons name="arrow-forward" size={24} color="white" />
            )}
          </TouchableOpacity>
        </View>
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
  logoBox: {
    width: 60,
    height: 60,
    backgroundColor: '#FF0000',
    borderRadius: 12,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 8,
    marginBottom: 8,
  },
  logoHandle: {
    width: 30,
    height: 3,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF0000',
    letterSpacing: 1,
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
    marginBottom: 12,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    lineHeight: 24,
  },
  subtitleBold: {
    fontWeight: '600',
    color: '#333',
  },
  phoneText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 32,
  },
  phoneNumber: {
    color: '#FF0000',
    fontWeight: '600',
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  otpInput: {
    flex: 1,
    height: 64,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    backgroundColor: '#F8F8F8',
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    marginBottom: 32,
  },
  resendText: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: '500',
    marginLeft: 8,
  },
  resendTextDisabled: {
    color: '#CCC',
  },
  footer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 20,
  },
  continueButton: {
    backgroundColor: '#000',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
  },
  continueButtonDisabled: {
    backgroundColor: '#CCC',
  },
});

export default OTPVerificationScreen;

