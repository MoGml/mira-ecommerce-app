import React, { useState, useMemo } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import CartItemCard from '../components/CartItemCard';
import OutOfStockBanner from '../components/OutOfStockBanner';
import OrderAgainCarousel from '../components/OrderAgainCarousel';
import { 
  sampleCartItems, 
  sampleProducts, 
  sampleAddresses,
  CartItem,
  Product,
} from '../models/data';

export default function CartScreen({ navigation }: any) {
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>(sampleCartItems);
  const [selectedAddress, setSelectedAddress] = useState(sampleAddresses[0]);
  const [deliverySlot, setDeliverySlot] = useState('8:00 PM – 10:00 PM');
  const [expressCollapsed, setExpressCollapsed] = useState(false);
  const [scheduledCollapsed, setScheduledCollapsed] = useState(false);

  // Group cart items by shipment type
  const { expressItems, scheduledItems } = useMemo(() => {
    const express = cartItems.filter(item => item.shipmentType === 'express');
    const scheduled = cartItems.filter(item => item.shipmentType === 'scheduled');
    return { expressItems: express, scheduledItems: scheduled };
  }, [cartItems]);

  const hasMultipleShipments = expressItems.length > 0 && scheduledItems.length > 0;

  // Calculate subtotals
  const calculateSubtotal = (items: CartItem[]) => {
    return items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  };

  const expressSubtotal = calculateSubtotal(expressItems);
  const scheduledSubtotal = calculateSubtotal(scheduledItems);
  const totalSubtotal = expressSubtotal + scheduledSubtotal;

  // Get out of stock items
  const outOfStockItems = cartItems.filter(item => !item.product.inStock);

  // Cart item handlers
  const handleIncrement = (id: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )
    );
  };

  const handleDecrement = (id: string) => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )
    );
  };

  const handleRemove = (id: string) => {
    Alert.alert(
      'Remove Item',
      'Are you sure you want to remove this item from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setCartItems(prev => prev.filter(item => item.id !== id)),
        },
      ]
    );
  };

  const handleClearCart = () => {
    Alert.alert(
      'Clear Cart',
      'Are you sure you want to remove all items from cart?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setCartItems([]),
        },
      ]
    );
  };

  const handleSelectReplacement = (product: Product) => {
    // Replace out of stock item with selected product
    const outOfStockItem = outOfStockItems[0];
    if (outOfStockItem) {
      setCartItems(prev =>
        prev.map(item =>
          item.id === outOfStockItem.id
            ? { ...item, product, productId: product.id }
            : item
        )
      );
    }
  };

  const handleCheckout = (shipmentType?: 'express' | 'scheduled') => {
    // Check if user is authenticated
    if (!isAuthenticated || !user) {
      Alert.alert(
        'Sign In Required',
        'Please sign in to proceed with checkout',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Sign In',
            onPress: () => {
              // User will be redirected to auth flow automatically
              // You can also navigate to a specific auth screen if needed
            },
          },
        ]
      );
      return;
    }

    const items = shipmentType 
      ? (shipmentType === 'express' ? expressItems : scheduledItems)
      : cartItems;
    
    // Check if there are any out-of-stock items
    const outOfStockInItems = items.filter(item => !item.product.inStock);
    
    if (outOfStockInItems.length > 0) {
      Alert.alert(
        'Out of Stock Items',
        `${outOfStockInItems.length} item(s) in your cart are out of stock and will be removed to proceed with checkout.`,
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Remove & Continue',
            style: 'destructive',
            onPress: () => {
              // Remove out-of-stock items from cart
              const updatedCartItems = cartItems.filter(item => item.product.inStock);
              setCartItems(updatedCartItems);
              
              // Filter items for checkout (only in-stock)
              const checkoutItems = items.filter(item => item.product.inStock);
              
              if (checkoutItems.length > 0) {
                navigation.navigate('Checkout', { cartItems: checkoutItems, shipmentType });
              }
              // No alert if cart becomes empty - user will see empty state
            },
          },
        ]
      );
    } else {
      navigation.navigate('Checkout', { cartItems: items, shipmentType });
    }
  };

  const totalItemCount = cartItems.length;

  // Replacement products (in stock items from same category)
  const replacementProducts = sampleProducts
    .filter(p => p.inStock && p.categoryId === outOfStockItems[0]?.product.categoryId)
    .slice(0, 5);

  const renderShipmentSection = (
    title: string,
    badge: string,
    items: CartItem[],
    subtotal: number,
    shipmentType: 'express' | 'scheduled',
    showDeliverySlot = false
  ) => {
    if (items.length === 0) return null;
    
    const collapsed = shipmentType === 'express' ? expressCollapsed : scheduledCollapsed;
    const setCollapsed = shipmentType === 'express' ? setExpressCollapsed : setScheduledCollapsed;

    return (
      <View style={styles.shipmentSection}>
        {/* Section Header */}
        <TouchableOpacity 
          style={[
            styles.sectionHeader,
            shipmentType === 'express' ? styles.expressHeader : styles.scheduledHeader
          ]}
          onPress={() => setCollapsed(!collapsed)}
        >
          <View style={styles.sectionHeaderLeft}>
            <Ionicons 
              name={shipmentType === 'express' ? 'flash' : 'calendar'} 
              size={18} 
              color="white" 
              style={styles.sectionIcon}
            />
            <Text style={styles.sectionTitle}>{title}</Text>
            <View style={[
              styles.itemCountBadge,
              shipmentType === 'express' ? styles.expressCountBadge : styles.scheduledCountBadge
            ]}>
              <Text style={[
                styles.itemCountText,
                shipmentType === 'scheduled' && styles.scheduledCountText
              ]}>
                {items.length} items
              </Text>
            </View>
          </View>
          <Ionicons 
            name={collapsed ? 'chevron-down' : 'chevron-up'} 
            size={20} 
            color="white" 
          />
        </TouchableOpacity>

        {/* Collapsed View - Horizontal Product Scroll */}
        {collapsed && (
          <View style={styles.collapsedContent}>
            <View style={styles.collapsedProductsContainer}>
              <Text style={styles.collapsedLabel}>Get it</Text>
              <View style={styles.collapsedBadge}>
                <Text style={styles.collapsedBadgeText}>{badge}</Text>
              </View>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.collapsedProducts}
            >
              {items.map((item) => (
                <View key={item.id} style={styles.collapsedProductCard}>
                  <Image 
                    source={{ uri: item.product.image }} 
                    style={styles.collapsedProductImage}
                  />
                  <Text style={styles.collapsedProductName} numberOfLines={1}>
                    {item.product.name}
                  </Text>
                  <Text style={styles.collapsedProductPrice}>
                    LE {item.product.price.toFixed(2)}
                  </Text>
                  <Text style={styles.collapsedProductQty}>
                    Qty: {item.quantity}
                  </Text>
                </View>
              ))}
            </ScrollView>

            <View style={styles.collapsedFooter}>
              <View style={styles.collapsedSubtotalInline}>
                <Text style={styles.collapsedSubtotalLabel}>Subtotal:</Text>
                <Text style={styles.collapsedSubtotalValue}>EGP {subtotal.toFixed(0)}</Text>
              </View>
              <TouchableOpacity
                style={styles.collapsedCheckoutButton}
                onPress={() => handleCheckout(shipmentType)}
              >
                <Text style={styles.collapsedCheckoutButtonText}>Checkout</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Get it Badge */}
        {!collapsed && (
          <View style={styles.getItBadgeContainer}>
            <Text style={styles.getItLabel}>Get it</Text>
            <View style={styles.getItBadge}>
              <Text style={styles.getItBadgeText}>{badge}</Text>
            </View>
          </View>
        )}

        {/* Delivery Slot Selector (for scheduled) */}
        {!collapsed && showDeliverySlot && (
          <TouchableOpacity style={styles.deliverySlotSelector}>
            <Text style={styles.deliverySlotLabel}>Delivery Slot</Text>
            <View style={styles.deliverySlotValue}>
              <Text style={styles.deliverySlotText}>{deliverySlot}</Text>
              <Ionicons name="chevron-down" size={18} color="#666" />
            </View>
          </TouchableOpacity>
        )}

        {/* Items */}
        {!collapsed && (
          <>
            <View style={styles.itemsContainer}>
              {items.map(item => (
                <CartItemCard
                  key={item.id}
                  item={item}
                  onIncrement={handleIncrement}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                  onEditOptions={(id) => console.log('Edit options:', id)}
                />
              ))}
            </View>

            {/* Out of Stock Banner */}
            {(() => {
              const outOfStockInSection = items.filter(item => !item.product.inStock);
              return outOfStockInSection.length > 0 ? (
                <OutOfStockBanner
                  replacementProducts={replacementProducts}
                  onSelectReplacement={handleSelectReplacement}
                  onRemoveItem={() => handleRemove(outOfStockInSection[0].id)}
                  onViewCombos={() => console.log('View combos')}
                />
              ) : null;
            })()}

            {/* Subtotal and Checkout - Single Row */}
            <View style={styles.shipmentFooter}>
              <View style={styles.subtotalInline}>
                <Text style={styles.subtotalInlineLabel}>Subtotal:</Text>
                <Text style={styles.subtotalInlineValue}>EGP {subtotal.toFixed(0)}</Text>
              </View>

              {/* Checkout Button (for multi-shipment) */}
              {hasMultipleShipments && (
                <TouchableOpacity
                  style={styles.sectionCheckoutButton}
                  onPress={() => handleCheckout(shipmentType)}
                >
                  <Text style={styles.sectionCheckoutButtonText}>Checkout</Text>
                </TouchableOpacity>
              )}
            </View>
          </>
        )}
      </View>
    );
  };

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.emptyContainer}>
          <Ionicons name="bag-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add items to get started</Text>
          <TouchableOpacity
            style={styles.shopNowButton}
            onPress={() => navigation.navigate('Categories')}
          >
            <Text style={styles.shopNowButtonText}>Shop Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Bag ({totalItemCount} items)</Text>
          <TouchableOpacity onPress={handleClearCart}>
            <Text style={styles.clearButton}>Clear Cart</Text>
          </TouchableOpacity>
        </View>

        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Address Section */}
          <TouchableOpacity style={styles.addressSection}>
            <Text style={styles.addressLabel}>Deliver to</Text>
            <View style={styles.addressValue}>
              <Text style={styles.addressText} numberOfLines={1}>
                {selectedAddress.label} - {selectedAddress.street}
              </Text>
              <Ionicons name="chevron-down" size={20} color="#666" />
            </View>
          </TouchableOpacity>

          {/* Shipment Sections */}
          {renderShipmentSection(
            'Express',
            'Get it Today',
            expressItems,
            expressSubtotal,
            'express'
          )}

          {renderShipmentSection(
            'Schedule Tomorrow',
            `${scheduledItems.length} items`,
            scheduledItems,
            scheduledSubtotal,
            'scheduled',
            true
          )}

          {/* Order Again Carousel */}
          <OrderAgainCarousel
            orderAgainProducts={sampleProducts.slice(0, 6)}
            popularProducts={sampleProducts.slice(6, 12)}
            favoriteProducts={sampleProducts.slice(0, 6)}
            onProductPress={(product) => console.log('Product:', product.id)}
            onAddToCart={(product) => console.log('Add to cart:', product.id)}
          />
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerTotalValue}>EGP {totalSubtotal.toFixed(2)}</Text>
            <Text style={styles.footerSubtotalLabel}>Subtotal</Text>
          </View>
          <TouchableOpacity
            style={styles.checkoutButton}
            onPress={() => handleCheckout()}
          >
            <Text style={styles.checkoutButtonText}>
              {hasMultipleShipments ? 'Checkout all' : 'Checkout'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  container: {
    flex: 1,
    maxWidth: 768, // Container max width for larger screens
    width: '100%',
    alignSelf: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  clearButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0000',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  addressSection: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  addressValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 8,
  },
  shipmentSection: {
    backgroundColor: 'white',
    marginBottom: 8,
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  expressHeader: {
    backgroundColor: '#000',
  },
  scheduledHeader: {
    backgroundColor: '#FF3B58',
  },
  sectionHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  sectionIcon: {
    marginRight: 8,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
    marginRight: 12,
  },
  itemCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  expressCountBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  scheduledCountBadge: {
    backgroundColor: 'white',
  },
  itemCountText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  scheduledCountText: {
    color: '#FF3B58',
  },
  getItBadgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
  },
  getItLabel: {
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  getItBadge: {
    backgroundColor: '#FF3B58',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  getItBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  deliverySlotSelector: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  deliverySlotLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  deliverySlotValue: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deliverySlotText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  itemsContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  shipmentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  subtotalInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  subtotalInlineLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  subtotalInlineValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  sectionCheckoutButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  sectionCheckoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerLeft: {
    alignItems: 'flex-start',
  },
  footerTotalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  footerSubtotalLabel: {
    fontSize: 13,
    color: '#666',
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 24,
    alignItems: 'center',
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
  },
  shopNowButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 32,
    paddingVertical: 12,
    borderRadius: 8,
  },
  shopNowButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  // Collapsed View Styles
  collapsedContent: {
    backgroundColor: 'white',
  },
  collapsedProductsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  collapsedLabel: {
    fontSize: 14,
    fontStyle: 'italic',
    color: '#333',
    marginRight: 8,
  },
  collapsedBadge: {
    backgroundColor: '#FF3B58',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 4,
  },
  collapsedBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  collapsedProducts: {
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  collapsedProductCard: {
    width: 100,
    marginHorizontal: 4,
    backgroundColor: '#FAFAFA',
    borderRadius: 8,
    padding: 8,
    alignItems: 'center',
  },
  collapsedProductImage: {
    width: 60,
    height: 60,
    borderRadius: 6,
    marginBottom: 6,
  },
  collapsedProductName: {
    fontSize: 11,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  collapsedProductPrice: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 2,
  },
  collapsedProductQty: {
    fontSize: 10,
    color: '#666',
  },
  collapsedFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  collapsedSubtotalInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  collapsedSubtotalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  collapsedSubtotalValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  collapsedCheckoutButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignItems: 'center',
  },
  collapsedCheckoutButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});

