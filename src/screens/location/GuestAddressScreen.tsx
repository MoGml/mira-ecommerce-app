import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Animated, Dimensions, Image, Keyboard, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Region, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import PlacesAutocomplete from '../../components/PlacesAutocomplete';
import { getAreaCoverage, bringToMyArea, createGuestAddress } from '../../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

// Google Places API Key
const GOOGLE_PLACES_API_KEY = Platform.select({
  ios: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || 'YOUR_IOS_GOOGLE_PLACES_API_KEY',
  android: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || 'YOUR_ANDROID_GOOGLE_PLACES_API_KEY',
  default: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || 'YOUR_GOOGLE_PLACES_API_KEY',
});

interface GuestAddressScreenProps {
  initialLocation?: Location.LocationObject;
  onConfirm: (address: any) => void;
  onBack?: () => void;
  isChangingAddress?: boolean;
}

type AddressTag = 'Home' | 'Work' | 'Hangout' | 'Other';

const GuestAddressScreen: React.FC<GuestAddressScreenProps> = ({
  initialLocation,
  onConfirm,
  onBack,
  isChangingAddress = false,
}) => {
  const [region, setRegion] = useState<Region>({
    latitude: initialLocation?.coords.latitude || 30.0444,
    longitude: initialLocation?.coords.longitude || 31.2357,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [currentCenter, setCurrentCenter] = useState({
    latitude: initialLocation?.coords.latitude || 30.0444,
    longitude: initialLocation?.coords.longitude || 31.2357,
  });
  const [description, setDescription] = useState('');
  const [selectedTag, setSelectedTag] = useState<AddressTag>('Home');
  const [customTag, setCustomTag] = useState('');
  const [isInDeliveryZone, setIsInDeliveryZone] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingArea, setIsCheckingArea] = useState(false);

  const mapRef = useRef<MapView>(null);
  const checkAreaTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const pinAnimValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (initialLocation) {
      reverseGeocode(initialLocation.coords.latitude, initialLocation.coords.longitude);
      checkAreaCoverage(initialLocation.coords.latitude, initialLocation.coords.longitude);
    }
  }, [initialLocation]);

  // Animate pin when map moves
  const animatePin = () => {
    Animated.sequence([
      Animated.timing(pinAnimValue, {
        toValue: -20,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(pinAnimValue, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      // Use Google Geocoding API for better results
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${GOOGLE_PLACES_API_KEY}`
      );
      const data = await response.json();

      if (data.results && data.results.length > 0) {
        setDescription(data.results[0].formatted_address);
      } else {
        // Fallback to expo-location
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result && result.length > 0) {
          const location = result[0];
          const parts = [
            location.streetNumber,
            location.street,
            location.city,
            location.region,
            location.country
          ].filter(Boolean);
          setDescription(parts.join(', ') || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
        }
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      setDescription(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  };

  const checkAreaCoverage = async (latitude: number, longitude: number) => {
    setIsCheckingArea(true);
    try {
      const coverage = await getAreaCoverage(latitude, longitude);
      setIsInDeliveryZone(coverage !== null);
      console.log('[GUEST_ADDRESS] Area coverage:', coverage);
    } catch (error) {
      console.error('[GUEST_ADDRESS] Error checking area:', error);
      setIsInDeliveryZone(false);
    } finally {
      setIsCheckingArea(false);
    }
  };

  const handleRegionChangeComplete = (newRegion: Region) => {
    const { latitude, longitude } = newRegion;
    setCurrentCenter({ latitude, longitude });
    animatePin();

    // Clear existing timeout
    if (checkAreaTimeoutRef.current) {
      clearTimeout(checkAreaTimeoutRef.current);
    }

    // Set new timeout for 1 second after user stops moving
    checkAreaTimeoutRef.current = setTimeout(() => {
      reverseGeocode(latitude, longitude);
      checkAreaCoverage(latitude, longitude);
    }, 1000);
  };

  // Handle place selection from Places Autocomplete
  const handlePlaceSelect = async (placeId: string, placeDescription: string) => {
    try {
      // Mock coordinates mapping for common locations
      // TODO: Replace with actual Google Places Details API call via backend
      const locationCoords: Record<string, { lat: number; lng: number }> = {
        cairo_1: { lat: 30.0444, lng: 31.2357 },
        cairo_festival_city: { lat: 30.0276, lng: 31.4087 },
        nasr_city: { lat: 30.0626, lng: 31.3462 },
        maadi: { lat: 29.9602, lng: 31.2569 },
        heliopolis: { lat: 30.0875, lng: 31.3241 },
        zamalek: { lat: 30.0626, lng: 31.2197 },
        new_cairo: { lat: 30.0131, lng: 31.4396 },
        sixth_october: { lat: 29.9347, lng: 30.9337 },
        sheikh_zayed: { lat: 30.0181, lng: 30.9714 },
        giza: { lat: 30.0131, lng: 31.2089 },
      };

      const coords = locationCoords[placeId];

      if (coords) {
        const { lat, lng } = coords;
        const newRegion = {
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setCurrentCenter({ latitude: lat, longitude: lng });

        // Get full address from coordinates using reverse geocoding
        await reverseGeocode(lat, lng);

        // Animate map to new location
        mapRef.current?.animateToRegion(newRegion, 300);

        // Check coverage
        await checkAreaCoverage(lat, lng);
      } else {
        Alert.alert('Error', 'Location not found');
      }
    } catch (error) {
      console.error('[GUEST_ADDRESS] Place selection error:', error);
      Alert.alert('Error', 'Failed to get location details');
    }
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
      setRegion(newRegion);
      setCurrentCenter({ latitude, longitude });
      mapRef.current?.animateToRegion(newRegion, 300);
      await reverseGeocode(latitude, longitude);
      await checkAreaCoverage(latitude, longitude);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = async () => {
    if (isInDeliveryZone === false) {
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

    if (!description.trim()) {
      Alert.alert('Error', 'Please wait for the address to load');
      return;
    }

    const finalTag = selectedTag === 'Other' ? customTag || 'Other' : selectedTag;

    try {
      setIsLoading(true);

      // Create guest address via API
      const fcmToken = (await AsyncStorage.getItem('@mira_fcm_token')) || '';
      const payload = {
        fcmToken,
        description: description.trim(),
        addressTag: finalTag,
        Latitude: currentCenter.latitude,
        Longitude: currentCenter.longitude,
      };

      console.log('[GUEST_ADDRESS] Creating/Updating address:', payload);
      const response = await createGuestAddress(payload);
      console.log('[GUEST_ADDRESS] Response:', response);

      // Save to local storage
      await AsyncStorage.setItem('@mira_selected_address', JSON.stringify({
        id: response?.addressId,
        tag: finalTag,
        description: description.trim(),
        lat: currentCenter.latitude,
        lng: currentCenter.longitude,
      }));

      // Call onConfirm with complete address data including id
      onConfirm({
        id: response?.addressId,
        address: description.trim(),
        description: description.trim(),
        tag: finalTag,
        latitude: currentCenter.latitude,
        longitude: currentCenter.longitude,
      });
    } catch (error: any) {
      console.error('[GUEST_ADDRESS] Error saving address:', error);
      Alert.alert('Error', error.message || 'Failed to save address. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBringMiraToArea = async () => {
    try {
      setIsLoading(true);
      await bringToMyArea({
        latittude: currentCenter.latitude.toString(),
        longitude: currentCenter.longitude.toString(),
        description: description || 'User requested coverage',
      });
      Alert.alert(
        'Thank you!',
        "We've received your request! We're working on expanding to more areas. We'll notify you when Mira is available in your location!"
      );
    } catch (error: any) {
      console.error('[GUEST_ADDRESS] Error submitting bring to area request:', error);
      Alert.alert(
        'Request Submitted',
        "Thank you for your interest! We'll work on bringing Mira to your area."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const addressTags: AddressTag[] = ['Home', 'Work', 'Hangout', 'Other'];

  const renderAddressTagButton = (tag: AddressTag) => {
    const isSelected = selectedTag === tag;
    const icons: Record<AddressTag, string> = {
      Home: 'home',
      Work: 'briefcase',
      Hangout: 'cafe',
      Other: 'location',
    };

    return (
      <TouchableOpacity
        key={tag}
        style={[styles.tagButton, isSelected && styles.tagButtonSelected]}
        onPress={() => setSelectedTag(tag)}
      >
        <Ionicons
          name={icons[tag] as any}
          size={18}
          color={isSelected ? '#E91E63' : '#666'}
        />
        <Text style={[styles.tagButtonText, isSelected && styles.tagButtonTextSelected]}>
          {tag}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      {onBack && (
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Selected address</Text>
          <View style={{ width: 40 }} />
        </View>
      )}

      {/* Address Description (Top of page, above map) */}
      {isInDeliveryZone !== false && (
        <View style={styles.topAddressContainer}>
          <Text style={styles.topAddressText} numberOfLines={2}>
            {description || 'Loading address...'}
          </Text>
        </View>
      )}

      {/* Map */}
      <View style={[styles.mapContainer, isInDeliveryZone === false && styles.mapContainerExpanded]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_GOOGLE}
          initialRegion={region}
          onRegionChangeComplete={handleRegionChangeComplete}
          showsUserLocation
          showsMyLocationButton={false}
        />

        {/* Center Pin Indicator */}
        <Animated.View
          style={[
            styles.centerMarker,
            {
              transform: [{ translateY: pinAnimValue }],
            },
          ]}
        >
          <Image
            source={require('../../../assets/pinLocation.png')}
            style={styles.pinImage}
            resizeMode="contain"
          />
        </Animated.View>

        {/* Google Places Search */}
        <View style={styles.searchWrapper}>
          <PlacesAutocomplete
            apiKey={GOOGLE_PLACES_API_KEY}
            onPlaceSelected={handlePlaceSelect}
            placeholder="Search for your address"
          />
        </View>

        {/* Current Location Button */}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleCurrentLocation}
          disabled={isLoading}
        >
          <Ionicons name="locate" size={24} color="#000" />
        </TouchableOpacity>

        {isCheckingArea && (
          <View style={styles.checkingOverlay}>
            <Text style={styles.checkingText}>Checking coverage...</Text>
          </View>
        )}
      </View>

      {/* Address Details Section or Out of Service Message */}
      {isInDeliveryZone === false ? (
        <View style={styles.outOfServiceContainer}>
          <Text style={styles.outOfServiceTitle}>We're Coming here Soon!</Text>
          <Text style={styles.outOfServiceMessage}>
            Mira doesn't deliver here yet, but we're working on it!
          </Text>
          <TouchableOpacity
            style={styles.bringMiraButton}
            onPress={handleBringMiraToArea}
            disabled={isLoading}
          >
            <Text style={styles.bringMiraButtonText}>
              {isLoading ? 'Submitting...' : 'Bring Mira to my area !'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : isInDeliveryZone === true ? (
        <View style={styles.detailsContainer}>
          {/* Address Tags */}
          <View style={styles.tagsContainer}>
            {addressTags.map(renderAddressTagButton)}
          </View>

          {/* Custom Tag Input (if Other is selected) */}
          {selectedTag === 'Other' && (
            <TextInput
              style={styles.nameInput}
              placeholder="Name"
              placeholderTextColor="#C0C0C0"
              value={customTag}
              onChangeText={setCustomTag}
            />
          )}

          {/* Description Input */}
          <TextInput
            style={styles.descriptionInput}
            placeholder="Description"
            placeholderTextColor="#C0C0C0"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={3}
          />

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, (isLoading || !description.trim()) && styles.saveButtonDisabled]}
            onPress={handleConfirm}
            disabled={isLoading || !description.trim()}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? 'Saving...' : 'Save & Continue'}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#000',
  },
  topAddressContainer: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  topAddressText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  mapContainer: {
    height: SCREEN_HEIGHT * 0.40,
    position: 'relative',
  },
  mapContainerExpanded: {
    height: SCREEN_HEIGHT * 0.55,
  },
  map: {
    flex: 1,
  },
  centerMarker: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -40,
    zIndex: 1,
  },
  pinImage: {
    width: 40,
    height: 40,
  },
  searchWrapper: {
    position: 'absolute',
    top: 16,
    left: 16,
    right: 16,
    zIndex: 10,
  },
  currentLocationButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 30,
    width: 56,
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  checkingOverlay: {
    position: 'absolute',
    top: 70,
    left: '50%',
    marginLeft: -75,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
  },
  checkingText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
  detailsContainer: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 10,
  },
  tagButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#fff',
    gap: 6,
  },
  tagButtonSelected: {
    borderColor: '#E91E63',
    backgroundColor: '#FCE4EC',
  },
  tagButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '400',
  },
  tagButtonTextSelected: {
    color: '#E91E63',
    fontWeight: '500',
  },
  nameInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    marginBottom: 12,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#000',
    backgroundColor: '#fff',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 16,
  },
  saveButton: {
    backgroundColor: '#000',
    borderRadius: 30,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  outOfServiceContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
    backgroundColor: '#fff',
  },
  outOfServiceTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#000',
    marginBottom: 10,
    textAlign: 'center',
  },
  outOfServiceMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
    lineHeight: 22,
  },
  bringMiraButton: {
    backgroundColor: '#000',
    borderRadius: 30,
    paddingHorizontal: 30,
    paddingVertical: 16,
  },
  bringMiraButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
});

export default GuestAddressScreen;
