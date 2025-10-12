import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../models/data';

interface OrderAgainCarouselProps {
  orderAgainProducts: Product[];
  popularProducts: Product[];
  favoriteProducts: Product[];
  onProductPress: (product: Product) => void;
  onAddToCart: (product: Product) => void;
}

const OrderAgainCarousel: React.FC<OrderAgainCarouselProps> = ({
  orderAgainProducts,
  popularProducts,
  favoriteProducts,
  onProductPress,
  onAddToCart,
}) => {
  const [activeTab, setActiveTab] = useState<'orderAgain' | 'popular' | 'favorites'>('orderAgain');

  const getProducts = () => {
    switch (activeTab) {
      case 'orderAgain':
        return orderAgainProducts;
      case 'popular':
        return popularProducts;
      case 'favorites':
        return favoriteProducts;
      default:
        return orderAgainProducts;
    }
  };

  const products = getProducts();

  return (
    <View style={styles.container}>
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'orderAgain' && styles.activeTab]}
          onPress={() => setActiveTab('orderAgain')}
        >
          <Text style={[styles.tabText, activeTab === 'orderAgain' && styles.activeTabText]}>
            Order Again
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'popular' && styles.activeTab]}
          onPress={() => setActiveTab('popular')}
        >
          <Text style={[styles.tabText, activeTab === 'popular' && styles.activeTabText]}>
            Popular Picks
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.tab, activeTab === 'favorites' && styles.activeTab]}
          onPress={() => setActiveTab('favorites')}
        >
          <Text style={[styles.tabText, activeTab === 'favorites' && styles.activeTabText]}>
            Favorites
          </Text>
        </TouchableOpacity>
      </View>

      {/* Product Horizontal Scroll */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((item) => (
          <View key={item.id} style={styles.productCard}>
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: item.image }} 
                style={styles.productImage}
              />
              <TouchableOpacity style={styles.addButton} onPress={() => onAddToCart(item)}>
                <Ionicons name="bag-outline" size={16} color="white" />
              </TouchableOpacity>
            </View>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.uom && item.uomValue && (
              <Text style={styles.productSize}>
                {item.uomValue}{item.uom}
              </Text>
            )}
            <Text style={styles.productPrice}>
              LE {item.price.toFixed(2)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    marginTop: 16,
    paddingBottom: 16,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 8,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: '#FF0000',
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#FF0000',
    fontWeight: '600',
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  productCard: {
    width: 160,
    marginRight: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 12,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 8,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  addButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#000',
    borderRadius: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
    lineHeight: 18,
  },
  productSize: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default OrderAgainCarousel;

