import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Keyboard, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAreaCoverage, createGuestAddress, createAddress, getBaseUrl, getDefaultHeaders } from '../../services/api';
import { useNavigation } from '@react-navigation/native';
import { useAuth } from '../../context/AuthContext';
import { useAddress } from '../../context/AddressContext';

interface AddAddressScreenProps {
  initialLocation?: Location.LocationObject;
  onConfirm?: (address: any) => void;
  onBack?: () => void;
}

// IMPORTANT: Replace with your actual Google Places API key
// For production, use environment variables
const GOOGLE_PLACES_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || 'YOUR_IOS_GOOGLE_PLACES_API_KEY',
  android: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || 'YOUR_ANDROID_GOOGLE_PLACES_API_KEY',
  default: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || 'YOUR_GOOGLE_PLACES_API_KEY',
});

const AddAddressScreenWithPlaces: React.FC<AddAddressScreenProps> = ({
  initialLocation,
  onConfirm,
  onBack,
}) => {
  const navigation = useNavigation();
  const { user, updateSelectedAddress, markAddressSetupComplete } = useAuth();
  const { setSelectedAddress } = useAddress();
  const mapRef = useRef<MapView>(null);
  const [region, setRegion] = useState({
    latitude: initialLocation?.coords.latitude || 30.0444,
    longitude: initialLocation?.coords.longitude || 31.2357,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [markerPosition, setMarkerPosition] = useState({
    latitude: initialLocation?.coords.latitude || 30.0444,
    longitude: initialLocation?.coords.longitude || 31.2357,
  });
  const [address, setAddress] = useState('28 El Nasr Road, Nasr city, Cairo, Egypt');
  const [addressTag, setAddressTag] = useState<'Home' | 'Work' | 'Hangout' | 'Other'>('Home');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isDefault, setIsDefault] = useState(true);
  const [isInDeliveryZone, setIsInDeliveryZone] = useState(true);
  const [coverageName, setCoverageName] = useState<string | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const geocodeDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      reverseGeocode(initialLocation.coords.latitude, initialLocation.coords.longitude);
    }
  }, [initialLocation]);

  // Try to auto-center to user's current location on mount if permission already granted
  useEffect(() => {
    const centerToCurrentIfPermitted = async () => {
      try {
        let perm = await Location.getForegroundPermissionsAsync();
        if (perm.status !== 'granted') {
          perm = await Location.requestForegroundPermissionsAsync();
        }
        if (perm.status !== 'granted') return;

        // Fast path: last known location
        const last = await Location.getLastKnownPositionAsync();
        let coords = last?.coords;
        if (!coords) {
          const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
          coords = loc.coords;
        }
        if (!coords) return;

        const { latitude, longitude } = coords;
        setMarkerPosition({ latitude, longitude });
        const newRegion = { latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 };
        setRegion(newRegion);
        if (mapRef.current) {
          mapRef.current.animateToRegion(newRegion, 500);
        }
        await reverseGeocode(latitude, longitude);
        debouncedCheckCoverage(latitude, longitude);
      } catch (e) {
        // ignore
      }
    };
    centerToCurrentIfPermitted();
  }, []);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    // Debounce reverse geocoding to avoid rate limits
    if (geocodeDebounceRef.current) clearTimeout(geocodeDebounceRef.current);
    
    geocodeDebounceRef.current = setTimeout(async () => {
      try {
        // Use Google Geocoding API for more accurate results
        const response = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`
        );
        const data = await response.json();
        
        if (data.results && data.results.length > 0) {
          const formattedAddress = data.results[0].formatted_address;
          setAddress(formattedAddress);
        } else {
          // Fallback to Expo Location with rate limiting
          try {
            const result = await Location.reverseGeocodeAsync({ latitude, longitude });
            if (result && result.length > 0) {
              const location = result[0];
              const formattedAddress = `${location.street || ''}, ${location.city || ''}, ${location.region || ''}, ${location.country || ''}`.replace(/,\s*,/g, ',').trim();
              setAddress(formattedAddress);
            }
          } catch (fallbackError) {
            console.log('Fallback geocode skipped due to rate limit');
            // Don't set address if rate limited
          }
        }
      } catch (error) {
        console.log('Reverse geocode skipped due to rate limit');
        // Don't update address if there's an error
      }
    }, 1000); // 1 second debounce
  };

  const handlePlaceSelect = (data: any, details: any) => {
    if (details && details.geometry) {
      const { lat, lng } = details.geometry.location;
      const newRegion = {
        latitude: lat,
        longitude: lng,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setMarkerPosition({ latitude: lat, longitude: lng });
      setRegion(newRegion);
      setAddress(details.formatted_address || data.description);
      
      // Animate map to new location
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
      
      // Check delivery zone
      checkDeliveryZone(lat, lng);
      
      // Dismiss keyboard
      Keyboard.dismiss();
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setMarkerPosition({ latitude, longitude });
    setRegion({ ...region, latitude, longitude });
    reverseGeocode(latitude, longitude);
    debouncedCheckCoverage(latitude, longitude);
  };

  const debouncedCheckCoverage = (latitude: number, longitude: number) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await getAreaCoverage(latitude, longitude);
        if (res) {
          setIsInDeliveryZone(true);
          setCoverageName(res.nameEn || res.nameAr || null);
        } else {
          setIsInDeliveryZone(false);
          setCoverageName(null);
        }
      } catch (e) {
        setIsInDeliveryZone(false);
        setCoverageName(null);
      }
    }, 400);
  };

  const handleCurrentLocation = async () => {
    setIsLoading(true);
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const { latitude, longitude } = location.coords;
      const newRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      
      setMarkerPosition({ latitude, longitude });
      setRegion(newRegion);
      
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
      
      await reverseGeocode(latitude, longitude);
      debouncedCheckCoverage(latitude, longitude);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (!isInDeliveryZone) {
      Alert.alert(
        'Out of Delivery Zone',
        "We don't deliver to this location yet. Please choose another address or help us expand!",
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Bring Mira to my area!', onPress: handleBringMiraToArea },
        ]
      );
      return;
    }

    const addressData = {
      address,
      latitude: markerPosition.latitude,
      longitude: markerPosition.longitude,
      tag: addressTag,
      name,
      description,
      isDefault,
    };

    // Determine if user is logged in or guest
    const isLoggedInUser = user && user.isRegistered;

    if (isLoggedInUser) {
      // Logged-in user - use the logged-in endpoint
      try {
        setIsLoading(true);
        const payload = {
          addressTag: addressTag,
          description: address,
          latitude: markerPosition.latitude,
          longitude: markerPosition.longitude,
        };

        console.log('[LOGGED_IN_ADDRESS_CREATE] Payload:', payload);

        const response = await createAddress(payload);
        console.log('[LOGGED_IN_ADDRESS_CREATE] Response:', response);

        if (response && response.data && response.data.length > 0) {
          const address = response.data[0];
          // Update user's selected address in AuthContext
          if (updateSelectedAddress) {
            await updateSelectedAddress(address);
          }

          // Update AddressContext with the new address
          await setSelectedAddress(address);

          // Mark address setup as complete
          markAddressSetupComplete();

          // Small delay to ensure contexts are updated
          setTimeout(() => {
            console.log('[ADDRESS_CREATE] Navigating back to home...');
            console.log('[ADDRESS_CREATE] Navigation can go back:', navigation.canGoBack());
            console.log('[ADDRESS_CREATE] Navigation state:', navigation.getState());
            
            // Navigate back to home on success
            if (navigation.canGoBack()) {
              console.log('[ADDRESS_CREATE] Using goBack()');
              navigation.goBack();
            } else {
              console.log('[ADDRESS_CREATE] Using parent navigator');
              // If we can't go back (e.g., came from auth flow), navigate to Home tab
              const parentNavigator = navigation.getParent();
              if (parentNavigator) {
                console.log('[ADDRESS_CREATE] Parent navigator found, navigating to Home');
                parentNavigator.navigate('Home' as never);
              } else {
                console.log('[ADDRESS_CREATE] No parent navigator, using direct navigation');
                navigation.navigate('Home' as never);
              }
            }
          }, 100);
        }
      } catch (e: any) {
        console.error('[LOGGED_IN_ADDRESS_CREATE] Error:', e);

        if (e && e.isOutOfService) {
          Alert.alert('Location Not Covered', 'This location is not in our delivery area yet.');
        } else {
          Alert.alert('Error', e.message || 'Failed to create address. Please try again.');
        }
        // Don't navigate on error - stay on screen
      } finally {
        setIsLoading(false);
      }
    } else if (navigation.canGoBack()) {
      // Guest user - create guest address and navigate back
      try {
        setIsLoading(true);
        const fcmToken = (await AsyncStorage.getItem('@mira_fcm_token')) || '';
        const payload = {
          fcmToken,
          description: address,
          addressTag: addressTag,
          Latitude: markerPosition.latitude,
          Longitude: markerPosition.longitude,
        };

        console.log('[GUEST_ADDRESS_UPDATE] Endpoint:', `${getBaseUrl()}Addresses/GuestAddress`);
        console.log('[GUEST_ADDRESS_UPDATE] Payload:', payload);
        console.log('[GUEST_ADDRESS_UPDATE] Headers:', await getDefaultHeaders());

        const response = await createGuestAddress(payload);
        console.log('[GUEST_ADDRESS_UPDATE] Response:', response);

        await AsyncStorage.setItem('@mira_selected_address', JSON.stringify({
          id: response?.addressId,
          tag: response?.tag || addressTag,
          description: response?.description || address,
          lat: markerPosition.latitude,
          lng: markerPosition.longitude,
        }));

        navigation.goBack();
      } catch (e: any) {
        console.log('[GUEST_ADDRESS_UPDATE] Error:', e);

        if (e && e.isOutOfService) {
          Alert.alert('Location Not Covered', 'This location is not in our delivery area yet.');
          return;
        }

        // Still save locally and navigate back
        await AsyncStorage.setItem('@mira_selected_address', JSON.stringify({
          tag: addressTag,
          description: address,
          lat: markerPosition.latitude,
          lng: markerPosition.longitude,
        }));

        navigation.goBack();
      } finally {
        setIsLoading(false);
      }
    } else if (onConfirm) {
      // If called from auth flow, use the callback
      onConfirm(addressData);
    }
  };

  const handleBringMiraToArea = () => {
    Alert.alert('Thank you!', "We're working on expanding to more areas. We'll notify you when Mira is available in your location!");
  };

  const handleSetManually = () => {
    Alert.alert('Set Manually', 'Manual address entry will be available in the next update');
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => {
          if (navigation.canGoBack()) {
            navigation.goBack();
          } else if (onBack) {
            onBack();
          }
        }}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Address</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Google Places Autocomplete Search */}
      <View style={styles.searchContainer}>
        {/* Temporarily disabled GooglePlacesAutocomplete to fix filter error */}
        <View style={styles.textInputContainer}>
          <Text style={styles.textInput}>Search for your address (Coming soon)</Text>
        </View>
      </View>

      {/* Map */}
      <View style={styles.mapContainer}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          region={region}
          onPress={handleMapPress}
          showsUserLocation
          showsMyLocationButton={false}
          onRegionChangeComplete={(r) => {
            setRegion(r);
            setMarkerPosition({ latitude: r.latitude, longitude: r.longitude });
            reverseGeocode(r.latitude, r.longitude);
            debouncedCheckCoverage(r.latitude, r.longitude);
          }}
        >
          <Marker coordinate={markerPosition} />
        </MapView>

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleCurrentLocation}
          disabled={isLoading}
        >
          <Ionicons name="locate" size={24} color="#FF0000" />
        </TouchableOpacity>

        {/* Delivery Zone Indicator */}
        {!isInDeliveryZone && (
          <View style={styles.warningBanner}>
            <Ionicons name="alert-circle" size={20} color="#FF9800" />
            <Text style={styles.warningText}>We are coming here soon!</Text>
          </View>
        )}

        {/* Delivery Confirmation */}
        {isInDeliveryZone && (
          <View style={styles.deliveryConfirmation}>
            <Text style={styles.deliveryText}>Your order will deliver here{coverageName ? ` • ${coverageName}` : ''}</Text>
          </View>
        )}
      </View>

      {/* Address Details & Form */}
      <View style={styles.addressContainer}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressLabel}>Delivery Address</Text>
        </View>
        <Text style={styles.addressText}>{address}</Text>

        {/* Tag Chips */}
        <View style={styles.tagRow}>
          {(['Home','Work','Hangout','Other'] as const).map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagChip, addressTag === tag && styles.tagChipActive]}
              onPress={() => setAddressTag(tag)}
            >
              <Text style={[styles.tagChipText, addressTag === tag && styles.tagChipTextActive]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Name & Description */}
        <TextInput
          style={styles.input}
          placeholder="Name"
          placeholderTextColor="#999"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[styles.input, styles.inputDescription]}
          placeholder="Description"
          placeholderTextColor="#999"
          value={description}
          onChangeText={setDescription}
        />

        {/* Default toggle */}
        <View style={styles.defaultRow}>
          <Text style={styles.defaultLabel}>Set as a default address</Text>
          <TouchableOpacity
            onPress={() => setIsDefault(v => !v)}
            style={[styles.toggle, isDefault ? styles.toggleOn : styles.toggleOff]}
          >
            <View style={[styles.toggleKnob, isDefault ? styles.toggleKnobOn : styles.toggleKnobOff]} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Not-covered overlay (Figma style) */}
      {!isInDeliveryZone && (
        <View style={styles.overlay} pointerEvents="box-none">
          <View style={styles.overlayCard}>
            <Text style={styles.overlayTitle}>We’re Coming here Soon!</Text>
            <Text style={styles.overlaySubtitle}>Mira doesn’t deliver here yet, but we’re working on it!</Text>
            <View style={styles.overlayMapStub} />
            <TouchableOpacity style={styles.overlayButton} onPress={handleBringMiraToArea}>
              <Text style={styles.overlayButtonText}>Bring Mira to my area !</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Save & Continue */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, !isInDeliveryZone && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Save & Continue</Text>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    position: 'relative',
    zIndex: 1000,
    elevation: 1000,
    backgroundColor: 'white',
  },
  autocompleteContainer: {
    flex: 0,
    backgroundColor: 'transparent',
  },
  textInputContainer: {
    backgroundColor: 'transparent',
    borderTopWidth: 0,
    borderBottomWidth: 0,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  textInput: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15,
    color: '#333',
    paddingLeft: 44,
    height: 48,
  },
  listView: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  row: {
    backgroundColor: 'white',
    padding: 13,
    minHeight: 44,
    flexDirection: 'row',
  },
  separator: {
    height: 1,
    backgroundColor: '#F0F0F0',
    marginHorizontal: 12,
  },
  description: {
    fontSize: 14,
    color: '#333',
  },
  poweredContainer: {
    display: 'none',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  currentLocationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  warningBanner: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 80,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  warningText: {
    marginLeft: 8,
    fontSize: 13,
    fontWeight: '600',
    color: '#F57C00',
    flex: 1,
  },
  deliveryConfirmation: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  deliveryText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  addressContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  addressHeader: {
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  addressText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 12,
    lineHeight: 22,
  },
  setManuallyButton: {
    paddingVertical: 8,
  },
  setManuallyText: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: '500',
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tagChip: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'white',
  },
  tagChipActive: {
    backgroundColor: '#FFF5F5',
    borderColor: '#FF0000',
  },
  tagChipText: {
    color: '#333',
    fontSize: 13,
    fontWeight: '500',
  },
  tagChipTextActive: {
    color: '#FF0000',
  },
  input: {
    backgroundColor: '#F8F8F8',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 15,
    color: '#333',
    height: 48,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  inputDescription: {
    height: 48,
  },
  defaultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  defaultLabel: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  toggle: {
    width: 48,
    height: 28,
    borderRadius: 16,
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  toggleOn: {
    backgroundColor: '#FF0000',
  },
  toggleOff: {
    backgroundColor: '#E0E0E0',
  },
  toggleKnob: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'white',
  },
  toggleKnobOn: {
    alignSelf: 'flex-end',
  },
  toggleKnobOff: {
    alignSelf: 'flex-start',
  },
  footer: {
    paddingHorizontal: 24,
    paddingBottom: 20,
    paddingTop: 12,
    backgroundColor: 'white',
  },
  confirmButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonDisabled: {
    backgroundColor: '#CCC',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255,255,255,0.96)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  overlayCard: {
    width: '100%',
    borderRadius: 24,
    padding: 16,
  },
  overlayTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#2D2D2D',
    marginBottom: 8,
  },
  overlaySubtitle: {
    fontSize: 16,
    color: '#7A7A7A',
    marginBottom: 16,
  },
  overlayMapStub: {
    height: 320,
    borderRadius: 24,
    backgroundColor: '#EFEFEF',
    marginBottom: 16,
  },
  overlayButton: {
    backgroundColor: '#000',
    borderRadius: 12,
    alignItems: 'center',
    paddingVertical: 16,
  },
  overlayButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});

export default AddAddressScreenWithPlaces;

