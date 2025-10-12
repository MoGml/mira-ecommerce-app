import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';

interface LocationAccessScreenProps {
  onLocationGranted: (location: Location.LocationObject) => void;
  onManualAddress: () => void;
}

const LocationAccessScreen: React.FC<LocationAccessScreenProps> = ({
  onLocationGranted,
  onManualAddress,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestLocationPermission = async () => {
    setIsLoading(true);
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      
      if (foregroundStatus !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required for delivery. Please enable it in settings.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Open Settings', onPress: () => Location.requestForegroundPermissionsAsync() },
          ]
        );
        setIsLoading(false);
        return;
      }

      // Request background permission for delivery tracking
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      
      if (backgroundStatus !== 'granted') {
        console.log('Background location not granted');
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      onLocationGranted(location);
    } catch (error) {
      console.error('Location error:', error);
      Alert.alert('Error', 'Failed to get your location. Please try again or enter address manually.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.content}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <View style={styles.logoHandle} />
          </View>
          <Text style={styles.logoText}>mira</Text>
        </View>

        {/* Location Icon */}
        <View style={styles.locationIconContainer}>
          <View style={styles.locationCircle}>
            <Ionicons name="location" size={40} color="#FF0000" />
          </View>
        </View>

        <Text style={styles.title}>Location access</Text>

        <Text style={styles.description}>
          Allow Mira to access your location for better delivery accuracy and to receive exclusive offers near you!
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="location" size={24} color="#FF0000" />
            </View>
            <Text style={styles.benefitText}>Accurate delivery address</Text>
          </View>

          <View style={styles.benefitItem}>
            <View style={styles.benefitIcon}>
              <Ionicons name="pricetag" size={24} color="#FF0000" />
            </View>
            <Text style={styles.benefitText}>Exclusive offers near you</Text>
          </View>
        </View>

        {/* How does enabling location help section */}
        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>How does enabling location access help me?</Text>
          {/* This could be expandable in the future */}
        </View>
      </View>

      {/* Bottom Buttons */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={requestLocationPermission}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text style={styles.primaryButtonText}>Current Location</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={onManualAddress}
          disabled={isLoading}
        >
          <Text style={styles.secondaryButtonText}>Select Another Location</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  logoContainer: {
    alignItems: 'flex-start',
    marginBottom: 32,
  },
  logoBox: {
    width: 48,
    height: 48,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: 6,
    marginBottom: 6,
  },
  logoHandle: {
    width: 24,
    height: 2.5,
    backgroundColor: 'white',
    borderRadius: 2,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF0000',
    letterSpacing: 1,
  },
  locationIconContainer: {
    alignItems: 'center',
    marginVertical: 32,
  },
  locationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFE5E5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    color: '#666',
    lineHeight: 22,
    marginBottom: 32,
  },
  benefitsContainer: {
    marginBottom: 32,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  benefitIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  benefitText: {
    fontSize: 15,
    color: '#333',
    fontWeight: '500',
  },
  infoSection: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
  },
  primaryButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: '#333',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default LocationAccessScreen;

