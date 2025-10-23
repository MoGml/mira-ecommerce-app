import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import CartItemCard from '../components/CartItemCard';
import OutOfStockBanner from '../components/OutOfStockBanner';
import OrderAgainCarousel from '../components/OrderAgainCarousel';
import EmptyCartDesign from '../components/EmptyCartDesign';
import { getBag, BagItem, BagResponse } from '../services/api';
import {
  sampleProducts,
  sampleAddresses,
  Product,
} from '../models/data';

// Convert BagItem to CartItem format for compatibility with existing UI
interface CartItem {
  id: string;
  packId: number;
  name: string;
  image: string;
  price: number;
  originalPrice: number;
  quantity: number;
  uom: string;
  uomValue: number;
  inStock: boolean;
  maxQty: number;
  shipmentType: 'express' | 'scheduled';
}

function convertBagItemToCartItem(bagItem: BagItem, shipmentType: 'express' | 'scheduled'): CartItem {
  // Ensure all required properties have valid values
  const cartItem: CartItem = {
    id: bagItem.packId?.toString() || '0',
    packId: bagItem.packId || 0,
    name: bagItem.packName || 'Unknown Product',
    image: bagItem.pictureUrl || '',
    price: bagItem.priceAfterDiscount || 0,
    originalPrice: bagItem.price || 0,
    quantity: Math.floor(bagItem.bagQty || 0),
    uom: bagItem.unitOfMeasureName || '',
    uomValue: bagItem.unitOfMeasureValue || 1,
    inStock: !bagItem.itemOutOfStock,
    maxQty: Math.floor(bagItem.maxQty || 0),
    shipmentType,
  };

  // Log warning if critical data is missing
  if (!bagItem.packId || !bagItem.packName) {
    console.warn('⚠️ [BAG] Cart item missing critical data:', bagItem);
  }

  return cartItem;
}

export default function CartScreen({ navigation }: any) {
  const { isAuthenticated, user, logout } = useAuth();
  const {
    updateItemQuantity,
    getItemQuantity,
    isLoading: isItemLoading,
    isPending: isItemPending,
    cartItems: contextCartItems,
    syncFromBag
  } = useCart();

  const [bagData, setBagData] = useState<BagResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedAddress, setSelectedAddress] = useState(sampleAddresses[0]);
  const [deliverySlot, setDeliverySlot] = useState('8:00 PM – 10:00 PM');
  const [expressCollapsed, setExpressCollapsed] = useState(false);
  const [scheduledCollapsed, setScheduledCollapsed] = useState(false);

  // Fetch bag data from server
  const fetchBag = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🛒 [BAG] Fetching bag data from server...', isRefresh ? '(refresh)' : '(initial)');
      console.log('🛒 [BAG] User authentication state:', {
        isAuthenticated,
        isRegistered: user?.isRegistered,
        userId: user?.id,
        userName: user?.name
      });

      // Check if user is authenticated before making API call
      // Only block if truly not authenticated (isAuthenticated = false)
      // The API will handle guest vs registered users appropriately
      if (!isAuthenticated) {
        console.log('🛒 [BAG] User not authenticated - showing empty state');
        setBagData({
          customerId: 0,
          addressId: 0,
          bagId: 0,
          expressBagItems: [],
          tomorrowBagItems: [],
          expressBagSubTotal: 0,
          tomorrowsBagSubTotal: 0,
          bagSubTotal: 0,
        });
        setError(null);
        return;
      }
      
      const data = await getBag();
      console.log('✅ [BAG] Bag data received:', data);

      setBagData(data);

      // Sync cart context with bag data from server
      const allBagItems = [...data.expressBagItems, ...data.tomorrowBagItems];
      syncFromBag(allBagItems);
    } catch (err: any) {
      // Real errors only (empty bag is handled at API level)
      console.error('❌ [BAG] Error fetching bag:', {
        message: err.message,
        status: err.status,
        body: err.body,
        url: err.url
      });
      setError(err.message || 'Failed to load cart');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [isAuthenticated, user, syncFromBag]);

  // Fetch bag on mount
  useEffect(() => {
    fetchBag();
  }, [fetchBag]);

  // Refresh bag when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 [BAG] Screen focused, refreshing bag data');
      fetchBag();
    }, [fetchBag])
  );

  // Convert bag data to cart items with live quantities from CartContext
  const cartItems = useMemo(() => {
    if (!bagData) return [];

    console.log('🔄 [BAG UI] Converting bag data to cart items');
    console.log('🔄 [BAG UI] Express bag items:', bagData.expressBagItems.length);
    console.log('🔄 [BAG UI] Tomorrow bag items:', bagData.tomorrowBagItems.length);
    console.log('🔄 [BAG UI] Context cart items:', contextCartItems.size);

    const expressItems = bagData.expressBagItems.map(item => {
      const cartItem = convertBagItemToCartItem(item, 'express');
      // Override with live quantity from CartContext (for optimistic updates)
      const contextItem = contextCartItems.get(item.packId);
      if (contextItem) {
        console.log(`🔄 [BAG UI] Overriding ${item.packId} qty: ${item.bagQty} -> ${contextItem.quantity}`);
        cartItem.quantity = contextItem.quantity;
      } else {
        console.log(`🔄 [BAG UI] No context override for ${item.packId}, using bagQty: ${item.bagQty}`);
      }
      return cartItem;
    });

    const scheduledItems = bagData.tomorrowBagItems.map(item => {
      const cartItem = convertBagItemToCartItem(item, 'scheduled');
      // Override with live quantity from CartContext (for optimistic updates)
      const contextItem = contextCartItems.get(item.packId);
      if (contextItem) {
        console.log(`🔄 [BAG UI] Overriding ${item.packId} qty: ${item.bagQty} -> ${contextItem.quantity}`);
        cartItem.quantity = contextItem.quantity;
      } else {
        console.log(`🔄 [BAG UI] No context override for ${item.packId}, using bagQty: ${item.bagQty}`);
      }
      return cartItem;
    });

    // Filter out items with 0 quantity (removed items)
    const allItems = [...expressItems, ...scheduledItems];
    console.log('🔄 [BAG UI] Total items before filter:', allItems.length);
    allItems.forEach(item => console.log(`  - ${item.packId}: qty=${item.quantity}, name=${item.name}`));

    const filteredItems = allItems.filter(item => {
      // Use the item's current quantity (which may be overridden from context)
      // Filter out items with 0 quantity
      const keep = item.quantity > 0;
      if (!keep) {
        console.log(`🚫 [BAG UI] Filtering out ${item.packId} (qty=${item.quantity})`);
      }
      return keep;
    });

    console.log('✅ [BAG UI] Final cart items count:', filteredItems.length);
    return filteredItems;
  }, [bagData, contextCartItems]);

  // Group cart items by shipment type
  const { expressItems, scheduledItems } = useMemo(() => {
    const express = cartItems.filter(item => item.shipmentType === 'express');
    const scheduled = cartItems.filter(item => item.shipmentType === 'scheduled');
    return { expressItems: express, scheduledItems: scheduled };
  }, [cartItems]);

  const hasMultipleShipments = expressItems.length > 0 && scheduledItems.length > 0;

  // Use server-provided subtotals or calculate from items
  const expressSubtotal = bagData?.expressBagSubTotal || 0;
  const scheduledSubtotal = bagData?.tomorrowsBagSubTotal || 0;
  const totalSubtotal = bagData?.bagSubTotal || 0;

  // Get out of stock items
  const outOfStockItems = cartItems.filter(item => !item.inStock);

  // Check if any items are pending or loading (prevent checkout during mutations)
  const hasAnyPendingOrLoading = useMemo(() => {
    return cartItems.some(item =>
      isItemLoading(item.packId) || isItemPending(item.packId)
    );
  }, [cartItems, isItemLoading, isItemPending]);

  // Cart item handlers using CartContext
  const handleIncrement = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) {
      console.error('❌ [BAG] Item not found for increment:', id);
      return;
    }

    // Validate required properties
    if (!item.name || item.price === undefined || !item.packId) {
      console.error('❌ [BAG] Item missing required properties:', item);
      return;
    }

    const newQuantity = item.quantity + 1;

    // Check stock limit
    if (newQuantity > item.maxQty) {
      Alert.alert('Stock Limit', `Maximum quantity available is ${item.maxQty}`);
      return;
    }

    updateItemQuantity(item.packId, newQuantity, item.maxQty, item.name, item.price);
  };

  const handleDecrement = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) {
      console.error('❌ [BAG] Item not found for decrement:', id);
      return;
    }

    // Validate required properties
    if (!item.name || item.price === undefined || !item.packId) {
      console.error('❌ [BAG] Item missing required properties:', item);
      return;
    }

    const newQuantity = item.quantity - 1;
    updateItemQuantity(item.packId, newQuantity, item.maxQty, item.name, item.price);

    // Refresh bag after removing item to get updated data
    if (newQuantity === 0) {
      // Removals are instant (no debounce), just wait for API call
      setTimeout(() => {
        console.log('🔄 [BAG] Auto-refreshing after item removal');
        // Check if item is still loading/pending
        if (isItemLoading(item.packId) || isItemPending(item.packId)) {
          console.log('⏳ [BAG] Item still processing, waiting longer...');
          setTimeout(() => fetchBag(), 1000);
        } else {
          fetchBag();
        }
      }, 1000);
    }
  };

  const handleRemove = (id: string) => {
    const item = cartItems.find(i => i.id === id);
    if (!item) {
      console.error('❌ [BAG] Item not found for remove:', id);
      return;
    }

    // Validate required properties
    if (!item.name || item.price === undefined || !item.packId) {
      console.error('❌ [BAG] Item missing required properties:', item);
      return;
    }

    // Remove immediately without confirmation
    updateItemQuantity(item.packId, 0, item.maxQty, item.name, item.price);
    // Removals are instant (no debounce), just wait for API call
    setTimeout(() => {
      console.log('🔄 [BAG] Auto-refreshing after item removal');
      // Check if item is still loading/pending
      if (isItemLoading(item.packId) || isItemPending(item.packId)) {
        console.log('⏳ [BAG] Item still processing, waiting longer...');
        setTimeout(() => fetchBag(), 1000);
      } else {
        fetchBag();
      }
    }, 1000);
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
          onPress: async () => {
            // Remove all items using mutate
            for (const item of cartItems) {
              updateItemQuantity(item.packId, 0, item.maxQty, item.name, item.price);
            }
            // Wait for debounce (2s) + API call time for all items
            setTimeout(() => {
              console.log('🔄 [BAG] Auto-refreshing after clearing cart');
              fetchBag();
            }, 3000);
          },
        },
      ]
    );
  };

  const handleSelectReplacement = (product: Product) => {
    // TODO: Implement replacement logic with server
    console.log('Replace with:', product);
  };

  const handleCheckout = (shipmentType?: 'express' | 'scheduled') => {
    // Prevent checkout if any items are pending or loading
    if (hasAnyPendingOrLoading) {
      Alert.alert(
        'Please Wait',
        'Some items are being updated. Please wait for all changes to complete before checking out.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if user is guest (not registered)
    if (!user || !user.isRegistered) {
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
            onPress: async () => {
              // Logout will clear user data and trigger navigation to AuthNavigator
              // After successful login, user will automatically return to the app
              // and can navigate back to cart to complete checkout
              await logout();
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
    const outOfStockInItems = items.filter(item => !item.inStock);

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
            onPress: async () => {
              // Remove out-of-stock items from server
              for (const item of outOfStockInItems) {
                updateItemQuantity(item.packId, 0, item.maxQty, item.name, item.price);
              }

              // Filter items for checkout (only in-stock)
              const checkoutItems = items.filter(item => item.inStock);

              if (checkoutItems.length > 0) {
                navigation.navigate('Checkout', { cartItems: checkoutItems, shipmentType, bagData });
              }

              // Refresh bag data after removal
              setTimeout(() => {
                console.log('🔄 [BAG] Auto-refreshing after removing out-of-stock items');
                fetchBag();
              }, 2500);
            },
          },
        ]
      );
    } else {
      navigation.navigate('Checkout', { cartItems: items, shipmentType, bagData });
    }
  };

  const totalItemCount = cartItems.length;

  // Replacement products (in stock items from same category)
  const replacementProducts = sampleProducts
    .filter(p => p.inStock)
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
                    source={{ uri: item.image }}
                    style={styles.collapsedProductImage}
                  />
                  <Text style={styles.collapsedProductName} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.collapsedProductPrice}>
                    LE {item.price.toFixed(2)}
                  </Text>
                  <Text style={styles.collapsedProductQty}>
                    Qty: {item.quantity}
                  </Text>
                </View>
              ))}
            </ScrollView>

            {/* Collapsed Footer - Only show for multi-shipment */}
            {hasMultipleShipments && (
              <View style={styles.collapsedFooter}>
                <View style={styles.collapsedSubtotalInline}>
                  <Text style={styles.collapsedSubtotalLabel}>Subtotal:</Text>
                  <Text style={styles.collapsedSubtotalValue}>EGP {subtotal.toFixed(0)}</Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.collapsedCheckoutButton,
                    hasAnyPendingOrLoading && styles.disabledButton
                  ]}
                  onPress={() => handleCheckout(shipmentType)}
                  disabled={hasAnyPendingOrLoading}
                >
                  <Text style={styles.collapsedCheckoutButtonText}>
                    {hasAnyPendingOrLoading ? 'Updating...' : 'Checkout'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
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
                  isLoading={isItemLoading(item.packId)}
                  isPending={isItemPending(item.packId)}
                />
              ))}
            </View>

            {/* Out of Stock Banner */}
            {(() => {
              const outOfStockInSection = items.filter(item => !item.inStock);
              return outOfStockInSection.length > 0 ? (
                <OutOfStockBanner
                  replacementProducts={replacementProducts}
                  onSelectReplacement={handleSelectReplacement}
                  onViewCombos={() => console.log('View combos')}
                />
              ) : null;
            })()}

            {/* Subtotal and Checkout - Only show for multi-shipment */}
            {hasMultipleShipments && (
              <View style={styles.shipmentFooter}>
                <View style={styles.subtotalInline}>
                  <Text style={styles.subtotalInlineLabel}>Subtotal:</Text>
                  <Text style={styles.subtotalInlineValue}>EGP {subtotal.toFixed(0)}</Text>
                </View>

                {/* Checkout Button (for multi-shipment) */}
                <TouchableOpacity
                  style={[
                    styles.sectionCheckoutButton,
                    hasAnyPendingOrLoading && styles.disabledButton
                  ]}
                  onPress={() => handleCheckout(shipmentType)}
                  disabled={hasAnyPendingOrLoading}
                >
                  <Text style={styles.sectionCheckoutButtonText}>
                    {hasAnyPendingOrLoading ? 'Updating...' : 'Checkout'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </View>
    );
  };

  // Loading state
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF0000" />
          <Text style={styles.loadingText}>Loading your cart...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={80} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Failed to Load Cart</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => fetchBag()}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Empty cart state
  if (cartItems.length === 0) {
    console.log('🛒 [BAG UI] Showing empty state - cartItems.length:', cartItems.length);
    console.log('🛒 [BAG UI] bagData:', {
      expressCount: bagData?.expressBagItems?.length || 0,
      tomorrowCount: bagData?.tomorrowBagItems?.length || 0,
      contextItemsCount: contextCartItems.size
    });
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

        {/* Empty Cart State */}
        {!loading && !error && bagData && totalItemCount === 0 && (
          <EmptyCartDesign />
        )}

        {/* Loading State */}
        {loading && !bagData && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#FF0000" />
            <Text style={styles.loadingText}>Loading your bag...</Text>
          </View>
        )}

        {/* Error State */}
        {error && !bagData && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
            <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
            <Text style={styles.errorMessage}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={() => fetchBag()}>
              <Text style={styles.retryButtonText}>Try Again</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cart Content */}
        {!loading && !error && bagData && totalItemCount > 0 && (
          <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => fetchBag(true)}
              tintColor="#FF0000"
              colors={['#FF0000']}
            />
          }
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
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <Text style={styles.footerTotalValue}>EGP {totalSubtotal.toFixed(2)}</Text>
            <Text style={styles.footerSubtotalLabel}>Subtotal</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.checkoutButton,
              hasAnyPendingOrLoading && styles.disabledButton
            ]}
            onPress={() => handleCheckout()}
            disabled={hasAnyPendingOrLoading}
          >
            <Text style={styles.checkoutButtonText}>
              {hasAnyPendingOrLoading
                ? 'Updating cart...'
                : hasMultipleShipments
                ? 'Checkout all'
                : 'Checkout'}
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
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
  disabledButton: {
    backgroundColor: '#CCCCCC',
    opacity: 0.6,
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

