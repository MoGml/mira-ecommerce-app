import React, { useState, useRef } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet, ScrollView, Keyboard, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PlacePrediction {
  place_id: string;
  description: string;
  structured_formatting: {
    main_text: string;
    secondary_text?: string;
  };
}

interface PlacesAutocompleteProps {
  apiKey: string;
  onPlaceSelected: (placeId: string, description: string) => void;
  placeholder?: string;
  containerStyle?: any;
  inputStyle?: any;
}

const PlacesAutocomplete: React.FC<PlacesAutocompleteProps> = ({
  apiKey,
  onPlaceSelected,
  placeholder = 'Search for your address',
  containerStyle,
  inputStyle,
}) => {
  const [searchText, setSearchText] = useState('');
  const [predictions, setPredictions] = useState<PlacePrediction[]>([]);
  const [showPredictions, setShowPredictions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const searchPlaces = async (text: string) => {
    if (text.trim().length < 2) {
      setPredictions([]);
      setShowPredictions(false);
      return;
    }

    setIsLoading(true);
    try {
      // Use a CORS proxy or backend endpoint for Google Places API
      // Note: Direct calls from mobile apps require proper API key setup
      // Alternative: Use expo-location's geocoding with search terms

      // For now, we'll use a mock implementation that uses common Egyptian locations
      // In production, this should call your backend API that proxies to Google Places

      const mockResults = getMockPredictions(text);

      if (mockResults.length > 0) {
        setPredictions(mockResults);
        setShowPredictions(true);
      } else {
        setPredictions([]);
        setShowPredictions(false);
      }
    } catch (error) {
      console.error('[PlacesAutocomplete] Search error:', error);
      setPredictions([]);
      setShowPredictions(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Mock predictions for common Egyptian locations
  // TODO: Replace this with actual backend API call
  const getMockPredictions = (text: string): PlacePrediction[] => {
    const lowerText = text.toLowerCase();
    const locations = [
      {
        place_id: 'cairo_1',
        description: 'Cairo, Egypt',
        structured_formatting: {
          main_text: 'Cairo',
          secondary_text: 'Capital, Egypt',
        },
        coords: { lat: 30.0444, lng: 31.2357 },
      },
      {
        place_id: 'cairo_festival_city',
        description: 'Cairo Festival City, New Cairo, Egypt',
        structured_formatting: {
          main_text: 'Cairo Festival City',
          secondary_text: 'New Cairo, Cairo Governorate, Egypt',
        },
        coords: { lat: 30.0276, lng: 31.4087 },
      },
      {
        place_id: 'nasr_city',
        description: 'Nasr City, Cairo, Egypt',
        structured_formatting: {
          main_text: 'Nasr City',
          secondary_text: 'Cairo, Egypt',
        },
        coords: { lat: 30.0626, lng: 31.3462 },
      },
      {
        place_id: 'maadi',
        description: 'Maadi, Cairo, Egypt',
        structured_formatting: {
          main_text: 'Maadi',
          secondary_text: 'Cairo, Egypt',
        },
        coords: { lat: 29.9602, lng: 31.2569 },
      },
      {
        place_id: 'heliopolis',
        description: 'Heliopolis, Cairo, Egypt',
        structured_formatting: {
          main_text: 'Heliopolis',
          secondary_text: 'Cairo, Egypt',
        },
        coords: { lat: 30.0875, lng: 31.3241 },
      },
      {
        place_id: 'zamalek',
        description: 'Zamalek, Cairo, Egypt',
        structured_formatting: {
          main_text: 'Zamalek',
          secondary_text: 'Cairo, Egypt',
        },
        coords: { lat: 30.0626, lng: 31.2197 },
      },
      {
        place_id: 'new_cairo',
        description: 'New Cairo, Egypt',
        structured_formatting: {
          main_text: 'New Cairo',
          secondary_text: 'Cairo Governorate, Egypt',
        },
        coords: { lat: 30.0131, lng: 31.4396 },
      },
      {
        place_id: 'sixth_october',
        description: '6th of October City, Giza, Egypt',
        structured_formatting: {
          main_text: '6th of October City',
          secondary_text: 'Giza, Egypt',
        },
        coords: { lat: 29.9347, lng: 30.9337 },
      },
      {
        place_id: 'sheikh_zayed',
        description: 'Sheikh Zayed City, Giza, Egypt',
        structured_formatting: {
          main_text: 'Sheikh Zayed City',
          secondary_text: 'Giza, Egypt',
        },
        coords: { lat: 30.0181, lng: 30.9714 },
      },
      {
        place_id: 'giza',
        description: 'Giza, Egypt',
        structured_formatting: {
          main_text: 'Giza',
          secondary_text: 'Giza Governorate, Egypt',
        },
        coords: { lat: 30.0131, lng: 31.2089 },
      },
    ];

    return locations
      .filter(
        (loc) =>
          loc.structured_formatting.main_text.toLowerCase().includes(lowerText) ||
          loc.structured_formatting.secondary_text?.toLowerCase().includes(lowerText)
      )
      .map((loc) => ({
        place_id: loc.place_id,
        description: loc.description,
        structured_formatting: loc.structured_formatting,
      }));
  };

  const handleTextChange = (text: string) => {
    setSearchText(text);

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      searchPlaces(text);
    }, 300);
  };

  const handlePredictionPress = (prediction: PlacePrediction) => {
    setSearchText('');
    setPredictions([]);
    setShowPredictions(false);
    Keyboard.dismiss();
    onPlaceSelected(prediction.place_id, prediction.description);
  };

  const handleClear = () => {
    setSearchText('');
    setPredictions([]);
    setShowPredictions(false);
    Keyboard.dismiss();
  };

  return (
    <View style={[styles.container, containerStyle]}>
      {/* Search Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={[styles.input, inputStyle]}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={searchText}
          onChangeText={handleTextChange}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {isLoading && (
          <ActivityIndicator size="small" color="#999" style={styles.loadingIcon} />
        )}
        {searchText.length > 0 && !isLoading && (
          <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Predictions List */}
      {showPredictions && predictions.length > 0 && (
        <ScrollView
          style={styles.predictionsContainer}
          keyboardShouldPersistTaps="handled"
          nestedScrollEnabled={true}
        >
          {predictions.map((prediction, index) => (
            <TouchableOpacity
              key={prediction.place_id}
              style={[
                styles.predictionItem,
                index === predictions.length - 1 && styles.predictionItemLast,
              ]}
              onPress={() => handlePredictionPress(prediction)}
            >
              <Ionicons name="location-outline" size={20} color="#666" style={styles.predictionIcon} />
              <View style={styles.predictionTextContainer}>
                <Text style={styles.predictionMainText}>
                  {prediction.structured_formatting.main_text}
                </Text>
                {prediction.structured_formatting.secondary_text && (
                  <Text style={styles.predictionSecondaryText}>
                    {prediction.structured_formatting.secondary_text}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    zIndex: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#000',
    paddingVertical: 0,
  },
  loadingIcon: {
    marginLeft: 8,
  },
  clearButton: {
    padding: 4,
  },
  predictionsContainer: {
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 8,
    maxHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  predictionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  predictionItemLast: {
    borderBottomWidth: 0,
  },
  predictionIcon: {
    marginRight: 12,
  },
  predictionTextContainer: {
    flex: 1,
  },
  predictionMainText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000',
    marginBottom: 2,
  },
  predictionSecondaryText: {
    fontSize: 12,
    color: '#666',
  },
});

export default PlacesAutocomplete;
