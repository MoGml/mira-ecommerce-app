import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AUTH_STATUS_KEY } from '../../services/api';
import { useAddress } from '../../context/AddressContext';
import GuestAddressScreen from './GuestAddressScreen';
import AddAddressScreenWithPlaces from './AddAddressScreenWithPlaces';

/**
 * Wrapper component that determines which address screen to show
 * based on whether the user is in guest mode or registered
 */
const AddressScreenWrapper: React.FC = () => {
  const [isGuestMode, setIsGuestMode] = useState<boolean | null>(null);
  const navigation = useNavigation();
  const { setSelectedAddress } = useAddress();

  useEffect(() => {
    const checkAuthStatus = async () => {
      const authStatus = await AsyncStorage.getItem(AUTH_STATUS_KEY);
      setIsGuestMode(authStatus === 'guest');
    };
    checkAuthStatus();
  }, []);

  const handleConfirm = async (address: any) => {
    // Save address to local storage and update context
    const addressData = {
      id: address.id,
      tag: address.tag || 'Home',
      addressTag: address.tag || 'Home',
      description: address.address || address.description,
      lat: address.latitude,
      lng: address.longitude,
      latitude: address.latitude,
      longitude: address.longitude,
    };

    await AsyncStorage.setItem('@mira_selected_address', JSON.stringify(addressData));
    await setSelectedAddress(addressData as any);

    // Navigate back to home
    navigation.goBack();
  };

  const handleBack = () => {
    navigation.goBack();
  };

  if (isGuestMode === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF0000" />
      </View>
    );
  }

  if (isGuestMode) {
    return (
      <GuestAddressScreen
        onConfirm={handleConfirm}
        onBack={handleBack}
        isChangingAddress={true}
      />
    );
  }

  return (
    <AddAddressScreenWithPlaces
      onConfirm={handleConfirm}
      onBack={handleBack}
    />
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default AddressScreenWrapper;
