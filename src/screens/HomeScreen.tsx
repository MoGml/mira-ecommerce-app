import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../context/AuthContext';
import { useAddress } from '../context/AddressContext';

export default function HomeScreen() {
  const { user, needsAddressSetup } = useAuth();
  const { selectedAddress, isLoading: addressLoading } = useAddress();
  const navigation = useNavigation();

  // Handle address setup redirect for logged-in users
  useEffect(() => {
    if (user?.isRegistered && !addressLoading) {
      // Check if user needs address setup
      if (needsAddressSetup || (!user.selectedAddress && !selectedAddress)) {
        // Only redirect if we're not already on the AddAddress screen
        const currentRoute = navigation.getState()?.routes[navigation.getState()?.index || 0];
        if (currentRoute?.name !== 'AddAddress') {
          navigation.navigate('AddAddress' as never);
        }
      }
    }
  }, [user, needsAddressSetup, selectedAddress, addressLoading, navigation]);

  const handleAddressPress = () => {
    // Navigate to AddAddress screen - it handles both guest and logged-in users
    navigation.navigate('AddAddress' as never);
  };

  // Get address display text
  const getAddressText = () => {
    console.log('[HOME_SCREEN] User:', user?.isRegistered, 'SelectedAddress:', selectedAddress, 'UserAddress:', user?.selectedAddress);
    
    if (!user || !user.isRegistered) {
      // Guest user - check AddressContext for selected address
      if (selectedAddress) {
        const { addressTag, description } = selectedAddress;
        if (addressTag && description) {
          return `${addressTag} - ${description}`;
        }
        return description || addressTag || 'Set location';
      }
      return 'Set location';
    }

    // Logged-in user - prioritize AddressContext, fallback to user object
    const address = selectedAddress || user.selectedAddress;
    if (address) {
      const { addressTag, description } = address;
      if (addressTag && description) {
        return `${addressTag} - ${description}`;
      }
      return description || addressTag || 'Set location';
    }

    return 'Add address';
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Main Content */}
      <View style={styles.content}>
        {/* Logo and Search Bar Row */}
        <View style={styles.topRow}>
          <Image source={require('../../assets/mira_bag.png')} style={styles.bagIcon} />
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9A9A9A" style={styles.searchIcon} />
            <Text style={styles.searchPlaceholder}>Need anything? Freshly , Snacks</Text>
          </View>
        </View>

        {/* Address Row */}
        <TouchableOpacity style={styles.addressRow} onPress={handleAddressPress}>
          <Ionicons name="location" size={16} color="#FF0000" />
          <Text style={styles.addressPrefix}>Deliver to </Text>
          <Text style={styles.addressValue} numberOfLines={1}>
            {getAddressText()}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#9A9A9A" style={styles.chevronIcon} />
        </TouchableOpacity>
      </View>

      {/* Main Content Area */}
      <View style={styles.mainContent}>
        <Text style={styles.title}>Welcome to Mira!</Text>
        <Text style={styles.subtitle}>Your shopping companion</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  bagIcon: {
    width: 24,
    height: 32,
    resizeMode: 'contain',
    marginRight: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F6F6F6',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    flex: 1,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchPlaceholder: {
    color: '#9A9A9A',
    fontSize: 16,
    flex: 1,
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  addressPrefix: {
    color: '#9A9A9A',
    fontSize: 16,
    marginLeft: 4,
  },
  addressValue: {
    color: '#2D2D2D',
    fontSize: 16,
    fontWeight: 'normal',
    flex: 1,
    marginLeft: 4,
  },
  chevronIcon: {
    marginLeft: 8,
  },
  mainContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
