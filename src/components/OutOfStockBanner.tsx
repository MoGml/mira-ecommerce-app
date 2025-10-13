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
  onRemoveItem?: () => void;
  onViewCombos?: () => void;
}

const OutOfStockBanner: React.FC<OutOfStockBannerProps> = ({
  replacementProducts,
  onSelectReplacement,
  onRemoveItem,
  onViewCombos,
}) => {
  return (
    <View style={styles.container}>
      {/* Error Banner */}
      <View style={styles.errorBanner}>
        <View style={styles.errorContent}>
          <Ionicons name="alert-circle" size={20} color="white" />
          <Text style={styles.errorText}>
            This item is out of stock. Please select replacement or remove it.
          </Text>
        </View>
        {onRemoveItem && (
          <TouchableOpacity style={styles.removeButton} onPress={onRemoveItem}>
            <Ionicons name="close-circle" size={24} color="white" />
          </TouchableOpacity>
        )}
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
              <Image 
                source={{ uri: product.image }} 
                style={styles.replacementImage}
              />
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
              <TouchableOpacity 
                style={styles.addButton}
                onPress={() => onSelectReplacement(product)}
              >
                <Ionicons name="add" size={18} color="white" />
              </TouchableOpacity>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF3B30',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  errorText: {
    flex: 1,
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
    marginLeft: 10,
    lineHeight: 18,
  },
  removeButton: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    padding: 4,
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
  replacementImage: {
    width: '100%',
    height: 110,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: 'white',
  },
  replacementInfo: {
    marginBottom: 10,
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
  addButton: {
    backgroundColor: '#000',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
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

