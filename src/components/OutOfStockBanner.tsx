import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../models/data';

interface OutOfStockBannerProps {
  replacementProducts: Product[];
  onSelectReplacement: (product: Product) => void;
  onViewCombos?: () => void;
}

const OutOfStockBanner: React.FC<OutOfStockBannerProps> = ({
  replacementProducts,
  onSelectReplacement,
  onViewCombos,
}) => {
  return (
    <View style={styles.container}>
      {/* Error Banner */}
      <View style={styles.errorBanner}>
        <Ionicons name="alert-circle" size={20} color="#D32F2F" />
        <Text style={styles.errorText}>
          This item is out of stock. Please select replacement or remove it
        </Text>
      </View>
      
      {/* Replacement Carousel */}
      <View style={styles.carouselContainer}>
        <Text style={styles.carouselTitle}>Replace with similar items</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {replacementProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.replacementCard}
              onPress={() => onSelectReplacement(product)}
            >
              <View style={styles.imageWrapper}>
                <Image 
                  source={{ uri: product.image }} 
                  style={styles.replacementImage}
                />
                <TouchableOpacity 
                  style={styles.replaceButton}
                  onPress={() => onSelectReplacement(product)}
                >
                  <Ionicons name="repeat-outline" size={18} color="white" />
                </TouchableOpacity>
              </View>
              <View style={styles.replacementInfo}>
                <Text style={styles.replacementName} numberOfLines={2}>
                  {product.name}
                </Text>
                {product.uom && product.uomValue && (
                  <Text style={styles.replacementSize}>
                    {product.uomValue}{product.uom}
                  </Text>
                )}
                <Text style={styles.replacementPrice}>
                  LE {product.price.toFixed(2)}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Combos Button */}
      {onViewCombos && (
        <View style={styles.combosContainer}>
          <TouchableOpacity style={styles.combosButton} onPress={onViewCombos}>
            <Ionicons name="gift-outline" size={18} color="#FF0000" />
            <Text style={styles.combosText}>See More with Combos</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.viewCombosButton} onPress={onViewCombos}>
            <Text style={styles.viewCombosText}>View Combos</Text>
            <Ionicons name="chevron-forward" size={16} color="#666" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginBottom: 16,
    overflow: 'hidden',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    borderRadius: 8,
    gap: 10,
  },
  errorText: {
    flex: 1,
    color: '#D32F2F',
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  carouselContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    backgroundColor: 'white',
  },
  carouselTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
    marginBottom: 16,
  },
  scrollContent: {
    paddingRight: 12,
  },
  replacementCard: {
    width: 130,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    padding: 10,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  imageWrapper: {
    position: 'relative',
    marginBottom: 10,
  },
  replacementImage: {
    width: '100%',
    height: 110,
    borderRadius: 8,
    backgroundColor: 'white',
  },
  replaceButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#000',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 5,
  },
  replacementInfo: {
    marginBottom: 0,
  },
  replacementName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    lineHeight: 16,
  },
  replacementSize: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  replacementPrice: {
    fontSize: 15,
    fontWeight: '700',
    color: '#000',
  },
  combosContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFE0E0',
  },
  combosButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  combosText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FF0000',
    marginLeft: 6,
  },
  viewCombosButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewCombosText: {
    fontSize: 13,
    color: '#666',
    marginRight: 4,
  },
});

export default OutOfStockBanner;

