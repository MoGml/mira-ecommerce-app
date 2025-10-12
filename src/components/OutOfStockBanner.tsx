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
            <Ionicons name="close" size={20} color="white" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Replacement Carousel */}
      <View style={styles.carouselContainer}>
        <Text style={styles.carouselTitle}>Suggested Replacements</Text>
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
    backgroundColor: '#FFF5F5',
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FF0000',
    padding: 12,
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
    marginLeft: 8,
  },
  removeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  carouselContainer: {
    padding: 12,
    paddingBottom: 0,
  },
  carouselTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  scrollContent: {
    paddingRight: 12,
  },
  replacementCard: {
    width: 140,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  replacementImage: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    marginBottom: 8,
  },
  replacementInfo: {
    marginBottom: 8,
  },
  replacementName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  replacementSize: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  replacementPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  addButton: {
    backgroundColor: '#FF0000',
    borderRadius: 16,
    width: 32,
    height: 32,
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

