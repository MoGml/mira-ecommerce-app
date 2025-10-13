import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform, Keyboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

interface AddAddressScreenProps {
  initialLocation?: Location.LocationObject;
  onConfirm: (address: any) => void;
  onBack: () => void;
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
  const [isInDeliveryZone, setIsInDeliveryZone] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialLocation) {
      reverseGeocode(initialLocation.coords.latitude, initialLocation.coords.longitude);
    }
  }, [initialLocation]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
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
        // Fallback to Expo Location
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result && result.length > 0) {
          const location = result[0];
          const formattedAddress = `${location.street || ''}, ${location.city || ''}, ${location.region || ''}, ${location.country || ''}`.replace(/,\s*,/g, ',').trim();
          setAddress(formattedAddress);
        }
      }
    } catch (error) {
      console.error('Reverse geocode error:', error);
      // Fallback to basic expo location
      try {
        const result = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (result && result.length > 0) {
          const location = result[0];
          const formattedAddress = `${location.street || ''}, ${location.city || ''}, ${location.region || ''}, ${location.country || ''}`.replace(/,\s*,/g, ',').trim();
          setAddress(formattedAddress);
        }
      } catch (fallbackError) {
        console.error('Fallback geocode error:', fallbackError);
      }
    }
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
    checkDeliveryZone(latitude, longitude);
  };

  const checkDeliveryZone = (latitude: number, longitude: number) => {
    // Simple delivery zone check (mock - replace with actual logic)
    // For demo: allow all locations within Cairo area
    const cairoLat = 30.0444;
    const cairoLng = 31.2357;
    const distance = Math.sqrt(
      Math.pow(latitude - cairoLat, 2) + Math.pow(longitude - cairoLng, 2)
    );
    setIsInDeliveryZone(distance < 0.5); // ~55km radius
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
      checkDeliveryZone(latitude, longitude);
    } catch (error) {
      Alert.alert('Error', 'Failed to get current location');
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirm = () => {
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

    onConfirm({
      address,
      latitude: markerPosition.latitude,
      longitude: markerPosition.longitude,
    });
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
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Ionicons name="chevron-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Add New Address</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Google Places Autocomplete Search */}
      <View style={styles.searchContainer}>
        <GooglePlacesAutocomplete
          placeholder="Search for your address"
          fetchDetails={true}
          onPress={handlePlaceSelect}
          query={{
            key: GOOGLE_PLACES_API_KEY,
            language: 'en',
            components: 'country:eg', // Restrict to Egypt, change as needed
          }}
          styles={{
            container: styles.autocompleteContainer,
            textInputContainer: styles.textInputContainer,
            textInput: styles.textInput,
            listView: styles.listView,
            row: styles.row,
            separator: styles.separator,
            description: styles.description,
            poweredContainer: styles.poweredContainer,
          }}
          enablePoweredByContainer={false}
          debounce={300}
          nearbyPlacesAPI="GooglePlacesSearch"
          GooglePlacesSearchQuery={{
            rankby: 'distance',
          }}
          textInputProps={{
            leftIcon: { type: 'font-awesome', name: 'search' },
            errorStyle: { color: 'red' },
            placeholderTextColor: '#999',
          }}
        />
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
            <Text style={styles.warningText}>Out Of Delivery Zone, Adjust The Pin</Text>
          </View>
        )}

        {/* Delivery Confirmation */}
        {isInDeliveryZone && (
          <View style={styles.deliveryConfirmation}>
            <Text style={styles.deliveryText}>Your Order Will Deliver Here</Text>
          </View>
        )}
      </View>

      {/* Address Details */}
      <View style={styles.addressContainer}>
        <View style={styles.addressHeader}>
          <Text style={styles.addressLabel}>Delivery Address</Text>
        </View>
        <Text style={styles.addressText}>{address}</Text>
        
        <TouchableOpacity
          style={styles.setManuallyButton}
          onPress={handleSetManually}
        >
          <Text style={styles.setManuallyText}>Set it Manually</Text>
        </TouchableOpacity>
      </View>

      {/* Confirm Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.confirmButton, !isInDeliveryZone && styles.confirmButtonDisabled]}
          onPress={handleConfirm}
        >
          <Text style={styles.confirmButtonText}>Confirm Location</Text>
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
});

export default AddAddressScreenWithPlaces;

