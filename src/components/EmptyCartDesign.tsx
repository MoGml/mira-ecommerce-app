import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Mira Logo Component for placeholders
const MiraLogo = ({ size = 40 }: { size?: number }) => (
  <View style={[styles.miraLogo, { width: size, height: size }]}>
    <View style={styles.shoppingBag}>
      <View style={styles.bagHandle} />
      <View style={styles.bagBody}>
        <Text style={styles.logoM}>M</Text>
      </View>
    </View>
    <Text style={[styles.logoText, { fontSize: Math.round(size * 0.3) }]}>ira</Text>
  </View>
);

// Product Card Component for placeholder items
const ProductCard = ({ 
  image, 
  title, 
  subtitle, 
  weight, 
  price 
}: { 
  image: string; 
  title: string; 
  subtitle: string; 
  weight: string; 
  price: string; 
}) => (
  <View style={styles.productCard}>
    <View style={styles.productImageContainer}>
      <Image source={{ uri: image }} style={styles.productImage} />
      <TouchableOpacity style={styles.addToCartButton}>
        <Ionicons name="bag-outline" size={16} color="#000" />
      </TouchableOpacity>
    </View>
    <View style={styles.productInfo}>
      <Text style={styles.productTitle}>{title}</Text>
      <Text style={styles.productSubtitle}>{subtitle}</Text>
      <Text style={styles.productWeight}>{weight}</Text>
      <Text style={styles.productPrice}>{price}</Text>
    </View>
  </View>
);

// Empty Cart Component
const EmptyCartDesign = () => {
  // Placeholder data for the items list
  const placeholderItems = [
    {
      id: '1',
      image: 'https://via.placeholder.com/120x120/FF6B6B/FFFFFF?text=Chick+Peas',
      title: 'Bell Pepper Nutella',
      subtitle: 'karmen lopu...',
      weight: '400grams',
      price: 'LE 180.50'
    },
    {
      id: '2',
      image: 'https://via.placeholder.com/120x120/4ECDC4/FFFFFF?text=Ghee',
      title: 'Bell Pepper Nutella',
      subtitle: 'karmen lopu...',
      weight: '400grams',
      price: 'LE 180.50'
    },
    {
      id: '3',
      image: 'https://via.placeholder.com/120x120/FFE66D/FFFFFF?text=Oil',
      title: 'Bell Pepper Nutella',
      subtitle: 'karmen lopu...',
      weight: '400grams',
      price: 'LE 180.50'
    },
    {
      id: '4',
      image: 'https://via.placeholder.com/120x120/FF8B94/FFFFFF?text=Product',
      title: 'Bell Pepper Nutella',
      subtitle: 'karmen lopu...',
      weight: '400grams',
      price: 'LE 180.50'
    },
    {
      id: '5',
      image: 'https://via.placeholder.com/120x120/95E1D3/FFFFFF?text=Item',
      title: 'Bell Pepper Nutella',
      subtitle: 'karmen lopu...',
      weight: '400grams',
      price: 'LE 180.50'
    }
  ];

  return (
    <View style={styles.emptyCartContainer}>
      {/* Empty Cart Message */}
      <View style={styles.emptyMessageContainer}>
        <View style={styles.emptyCartIcon}>
          <Ionicons name="bag-outline" size={80} color="#E0E0E0" />
        </View>
        <Text style={styles.emptyCartTitle}>Your bag is empty</Text>
        <Text style={styles.emptyCartSubtitle}>
          Add some items to get started with your order
        </Text>
        <TouchableOpacity style={styles.startShoppingButton}>
          <Text style={styles.startShoppingButtonText}>Start Shopping</Text>
        </TouchableOpacity>
      </View>

      {/* Items List Section */}
      <View style={styles.itemsListSection}>
        {/* Navigation Tabs */}
        <View style={styles.tabsContainer}>
          <TouchableOpacity style={[styles.tab, styles.activeTab]}>
            <Text style={[styles.tabText, styles.activeTabText]}>Order Again</Text>
            <View style={styles.tabUnderline} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Popular Picks</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab}>
            <Text style={styles.tabText}>Favorites</Text>
          </TouchableOpacity>
        </View>

        {/* Items List */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.itemsScrollView}
          contentContainerStyle={styles.itemsScrollContent}
        >
          {placeholderItems.map((item) => (
            <ProductCard
              key={item.id}
              image={item.image}
              title={item.title}
              subtitle={item.subtitle}
              weight={item.weight}
              price={item.price}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyCartContainer: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  emptyMessageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyCartIcon: {
    marginBottom: 24,
  },
  emptyCartTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
    textAlign: 'center',
  },
  emptyCartSubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  startShoppingButton: {
    backgroundColor: '#000',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  startShoppingButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  itemsListSection: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 24,
    paddingBottom: 20,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    position: 'relative',
  },
  activeTab: {
    // Active tab styling
  },
  tabText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#666',
  },
  activeTabText: {
    color: '#000',
    fontWeight: '600',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: '50%',
    marginLeft: -20,
    width: 40,
    height: 2,
    backgroundColor: '#000',
  },
  itemsScrollView: {
    paddingLeft: 20,
  },
  itemsScrollContent: {
    paddingRight: 20,
  },
  productCard: {
    width: 160,
    marginRight: 16,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImageContainer: {
    position: 'relative',
    marginBottom: 12,
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 8,
    backgroundColor: '#F0F0F0',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  productInfo: {
    // Product info styling
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productSubtitle: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  productWeight: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  // Mira Logo styles
  miraLogo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoppingBag: {
    position: 'relative',
    width: 24,
    height: 30,
  },
  bagHandle: {
    position: 'absolute',
    top: -2,
    left: 6,
    width: 8,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#000',
  },
  bagBody: {
    width: 24,
    height: 24,
    borderRadius: 4,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoM: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoText: {
    color: '#000',
    fontWeight: 'bold',
    marginLeft: 2,
  },
});

export default EmptyCartDesign;
