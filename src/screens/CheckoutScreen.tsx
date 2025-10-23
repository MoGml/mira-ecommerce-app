import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Switch,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AddressCard from '../components/AddressCard';
import PaymentMethodCard from '../components/PaymentMethodCard';
import PromoCodeInput from '../components/PromoCodeInput';
import { getCheckoutDetails, CheckoutDetailsResponse, placeOrder, PlaceOrderRequest } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  sampleAddresses,
  samplePaymentMethods,
  sampleUser,
  CartItem,
} from '../models/data';

export default function CheckoutScreen({ route, navigation }: any) {
  const { cartItems = [] } = route.params || {};
  const { user } = useAuth();

  // Server checkout data
  const [checkoutData, setCheckoutData] = useState<CheckoutDetailsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  const [selectedAddress, setSelectedAddress] = useState(sampleAddresses[0]);
  const [receiverName, setReceiverName] = useState(user?.name || sampleUser.name);
  const [receiverPhone, setReceiverPhone] = useState(user?.phone || sampleUser.phone || '');
  const [selectedPayment, setSelectedPayment] = useState(samplePaymentMethods[0]);
  const [useWallet, setUseWallet] = useState(false);
  const [promoCode, setPromoCode] = useState<string | undefined>();
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [deliveryTip, setDeliveryTip] = useState(0);
  const [customTip, setCustomTip] = useState('');

  // Fetch checkout details from server
  const fetchCheckoutDetails = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      console.log('🛒 [CHECKOUT] Fetching checkout details from server...');
      const data = await getCheckoutDetails();
      console.log('✅ [CHECKOUT] Checkout details received:', data);

      setCheckoutData(data);
    } catch (err: any) {
      console.error('❌ [CHECKOUT] Error fetching checkout details:', err);
      setError(err.message || 'Failed to load checkout details');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Fetch checkout details on mount
  useEffect(() => {
    fetchCheckoutDetails();
  }, [fetchCheckoutDetails]);

  // Use server shipments if available, otherwise fall back to client-side grouping
  const shipmentGroups = useMemo(() => {
    // If we have server data, use it
    if (checkoutData?.value?.shipments) {
      return checkoutData.value.shipments.map((shipment) => ({
        id: shipment.shipmentId.toString(),
        type: shipment.shipmentName.toLowerCase() === 'express' ? 'express' as const : 'scheduled' as const,
        label: shipment.shipmentName === 'Express' ? 'Get it Today' : 'Get it Tomorrow',
        items: shipment.items.map((item) => ({
          id: item.packagingId.toString(),
          packId: item.packagingId,
          name: item.name,
          quantity: Math.floor(item.quantity),
          price: item.pricePerUnitAfterDiscount,
          originalPrice: item.pricePerUnit,
        })),
        deliveryFee: shipment.deliveryCost,
        subtotal: shipment.subtotal,
        total: shipment.total,
        outletName: shipment.outletName,
      }));
    }

    // Fallback to client-side grouping (from passed cartItems)
    const expressItems = cartItems.filter((item: CartItem) => item.shipmentType === 'express');
    const scheduledItems = cartItems.filter((item: CartItem) => item.shipmentType === 'scheduled');

    const groups = [];
    if (expressItems.length > 0) {
      groups.push({
        id: 'express',
        type: 'express' as const,
        label: 'Get it Today',
        items: expressItems,
        deliveryFee: 35.00,
      });
    }
    if (scheduledItems.length > 0) {
      groups.push({
        id: 'scheduled',
        type: 'scheduled' as const,
        label: 'Get it Tomorrow',
        items: scheduledItems,
        deliveryFee: 20.00,
      });
    }
    return groups;
  }, [checkoutData, cartItems]);

  const hasMultipleShipments = shipmentGroups.length > 1;

  // Calculate totals - use server data if available
  const subtotal = checkoutData?.value?.subtotal || cartItems.reduce(
    (sum: number, item: CartItem) => {
      const price = item.price || item.product?.price || 0;
      return sum + price * item.quantity;
    },
    0
  );
  const totalDeliveryFees = checkoutData?.value?.delivery || shipmentGroups.reduce((sum, group) => sum + group.deliveryFee, 0);
  const walletDeduction = useWallet ? Math.min(sampleUser.walletBalance || 0, subtotal) : 0;
  const total = checkoutData?.value?.total || (subtotal + totalDeliveryFees - promoDiscount - walletDeduction + deliveryTip);

  const handleApplyPromo = (code: string) => {
    // Mock promo code validation
    if (code === 'MIRA25') {
      setPromoCode(code);
      setPromoDiscount(25.00);
      Alert.alert('Success', 'Promo code applied successfully!');
    } else {
      Alert.alert('Invalid', 'This promo code is not valid.');
    }
  };

  const handleRemovePromo = () => {
    setPromoCode(undefined);
    setPromoDiscount(0);
  };

  const handleSelectTip = (amount: number) => {
    // If the same tip is selected, remove it
    if (deliveryTip === amount) {
      setDeliveryTip(0);
    } else {
      setDeliveryTip(amount);
      setCustomTip('');
    }
  };

  const handleCustomTip = (value: string) => {
    setCustomTip(value);
    const amount = parseFloat(value);
    setDeliveryTip(isNaN(amount) ? 0 : amount);
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      Alert.alert('Error', 'User not found. Please login again.');
      return;
    }

    setPlacingOrder(true);
    try {
      const payload: PlaceOrderRequest = {
        contactPerson: receiverName,
        contactPersonPhoneNumber: receiverPhone,
        deliveryTips: deliveryTip,
        promoCode: promoCode || '',
      };

      console.log('🛒 [PLACE_ORDER] Placing order with payload:', payload);
      
      const response = await placeOrder(payload);
      console.log('✅ [PLACE_ORDER] Order placed successfully:', response);

      // Navigate to order tracking screen
      navigation.navigate('OrderTracking', {
        orderId: response.orderId,
        orderDetails: {
          total,
          deliveryTip,
          promoCode,
          receiverName,
          receiverPhone,
        },
      });
    } catch (error: any) {
      console.error('❌ [PLACE_ORDER] Error placing order:', error);
      Alert.alert(
        'Order Failed',
        error.message || 'Failed to place order. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const renderShipmentCard = (group: any, index: number) => {
    const [expanded, setExpanded] = useState(index === 0);

    return (
      <View key={group.id} style={styles.shipmentCard}>
        <TouchableOpacity
          style={styles.shipmentHeader}
          onPress={() => setExpanded(!expanded)}
        >
          <View style={styles.shipmentHeaderLeft}>
            {hasMultipleShipments && (
              <Text style={styles.shipmentNumber}>
                Shipment {index + 1} of {shipmentGroups.length}
              </Text>
            )}
            <Text style={styles.shipmentLabel}>
              {group.label} (+{group.deliveryFee.toFixed(2)} EGP)
            </Text>
          </View>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#666"
          />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.shipmentContent}>
            {/* Product Previews */}
            <View style={styles.productPreviews}>
              {group.items.slice(0, 3).map((item: CartItem) => {
                const image = item.image || item.product?.image || '';
                return (
                  <View key={item.id} style={styles.productPreview}>
                    <Image
                      source={{ uri: image }}
                      style={styles.previewImage}
                    />
                    {item.quantity > 1 && (
                      <View style={styles.quantityBadge}>
                        <Text style={styles.quantityBadgeText}>{item.quantity}</Text>
                      </View>
                    )}
                  </View>
                );
              })}
              {group.items.length > 3 && (
                <View style={styles.moreProductsBadge}>
                  <Text style={styles.moreProductsText}>
                    +{group.items.length - 3}
                  </Text>
                </View>
              )}
            </View>

            {/* Items List */}
            <View style={styles.itemsList}>
              {group.items.map((item: CartItem) => {
                const name = item.name || item.product?.name || 'Unknown Product';
                const price = item.price || item.product?.price || 0;
                return (
                  <View key={item.id} style={styles.checkoutItem}>
                    <Text style={styles.checkoutItemName} numberOfLines={1}>
                      {item.quantity}x {name}
                    </Text>
                    <Text style={styles.checkoutItemPrice}>
                      LE {(price * item.quantity).toFixed(2)}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Delivery Address */}
          <AddressCard
            address={selectedAddress}
            onChangeAddress={() => console.log('Change address')}
          />

          {/* Receiver Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={styles.sectionTitleContainer}>
                <Ionicons name="person" size={20} color="#FF0000" />
                <Text style={styles.sectionTitle}>Receiver Details</Text>
              </View>
              <TouchableOpacity>
                <Text style={styles.changeButton}>Change</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.receiverDetails}>
              <Text style={styles.receiverName}>{receiverName}</Text>
              <Text style={styles.receiverPhone}>{receiverPhone}</Text>
            </View>
          </View>

          {/* Shipment Summary */}
          <View style={styles.section}>
            <Text style={styles.sectionHeaderText}>
              {hasMultipleShipments ? 'Shipments' : 'Shipment Summary'}
            </Text>
            {shipmentGroups.map((group, index) => renderShipmentCard(group, index))}
          </View>

          {/* Promo Codes */}
          <PromoCodeInput
            appliedPromoCode={promoCode}
            discount={promoDiscount}
            onApplyPromo={handleApplyPromo}
            onRemovePromo={handleRemovePromo}
          />

          {/* Delivery Tips */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Tips</Text>
            <Text style={styles.tipsSubtitle}>
              Your kindness means a lot! Your driver will appreciate that.
            </Text>
            <View style={styles.tipsContainer}>
              {[5, 10, 15, 20].map((amount) => (
                <TouchableOpacity
                  key={amount}
                  style={[
                    styles.tipButton,
                    deliveryTip === amount && styles.tipButtonActive,
                  ]}
                  onPress={() => handleSelectTip(amount)}
                >
                  <Text
                    style={[
                      styles.tipButtonText,
                      deliveryTip === amount && styles.tipButtonTextActive,
                    ]}
                  >
                    LE {amount}
                  </Text>
                </TouchableOpacity>
              ))}
              <TextInput
                style={[
                  styles.customTipInput,
                  customTip && styles.customTipInputActive,
                ]}
                placeholder="Custom"
                keyboardType="numeric"
                value={customTip}
                onChangeText={handleCustomTip}
              />
            </View>
          </View>

          {/* Payment Methods */}
          <View style={styles.section}>
            <Text style={styles.sectionHeaderText}>Payment Method</Text>

            {/* Wallet Toggle */}
            <View style={styles.walletToggle}>
              <View style={styles.walletInfo}>
                <Ionicons name="wallet" size={20} color="#FF0000" />
                <Text style={styles.walletText}>
                  Use Mira Wallet (EGP {sampleUser.walletBalance?.toFixed(2)})
                </Text>
              </View>
              <Switch
                value={useWallet}
                onValueChange={setUseWallet}
                trackColor={{ false: '#E0E0E0', true: '#FFB3B3' }}
                thumbColor={useWallet ? '#FF0000' : '#f4f3f4'}
              />
            </View>

            {/* Payment Method */}
            <PaymentMethodCard
              paymentMethod={selectedPayment}
              onChangePayment={() => console.log('Change payment')}
            />

            {/* Additional Options */}
            <TouchableOpacity style={styles.paymentOption}>
              <Ionicons name="logo-apple" size={24} color="#000" />
              <Text style={styles.paymentOptionText}>Apple Pay</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.paymentOption}>
              <Ionicons name="cash" size={24} color="#4CAF50" />
              <Text style={styles.paymentOptionText}>Cash on Delivery</Text>
            </TouchableOpacity>
          </View>

          {/* Payment Summary */}
          <View style={styles.summarySection}>
            <Text style={styles.sectionHeaderText}>Payment Summary</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>EGP {subtotal.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery Fees</Text>
              <Text style={styles.summaryValue}>EGP {totalDeliveryFees.toFixed(2)}</Text>
            </View>
            {promoDiscount > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Promotional Code</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -EGP {promoDiscount.toFixed(2)}
                </Text>
              </View>
            )}
            {walletDeduction > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Wallet Balance</Text>
                <Text style={[styles.summaryValue, styles.discountValue]}>
                  -EGP {walletDeduction.toFixed(2)}
                </Text>
              </View>
            )}
            {deliveryTip > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery Tip</Text>
                <Text style={styles.summaryValue}>EGP {deliveryTip.toFixed(2)}</Text>
              </View>
            )}
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>EGP {total.toFixed(2)}</Text>
            </View>
          </View>
        </ScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <TouchableOpacity 
            style={[styles.placeOrderButton, placingOrder && styles.placeOrderButtonDisabled]} 
            onPress={handlePlaceOrder}
            disabled={placingOrder}
          >
            {placingOrder ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.placeOrderButtonText}>Place Order</Text>
            )}
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingVertical: 12,
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  sectionHeaderText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0000',
  },
  receiverDetails: {
    paddingLeft: 28,
  },
  receiverName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  receiverPhone: {
    fontSize: 14,
    color: '#666',
  },
  shipmentCard: {
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  shipmentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  shipmentHeaderLeft: {
    flex: 1,
  },
  shipmentNumber: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  shipmentLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  shipmentContent: {
    padding: 12,
    paddingTop: 0,
  },
  productPreviews: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  productPreview: {
    position: 'relative',
    marginRight: 8,
  },
  previewImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  quantityBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF0000',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: 'white',
  },
  moreProductsBadge: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreProductsText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  itemsList: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 8,
  },
  checkoutItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  checkoutItemName: {
    fontSize: 13,
    color: '#666',
    flex: 1,
    marginRight: 12,
  },
  checkoutItemPrice: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },
  tipsSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
    lineHeight: 18,
  },
  tipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tipButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 8,
    marginBottom: 8,
  },
  tipButtonActive: {
    backgroundColor: '#FF0000',
    borderColor: '#FF0000',
  },
  tipButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  tipButtonTextActive: {
    color: 'white',
  },
  customTipInput: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    fontSize: 14,
    color: '#333',
    minWidth: 80,
  },
  customTipInputActive: {
    borderColor: '#FF0000',
  },
  walletToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 12,
  },
  walletInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  walletText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 8,
  },
  paymentOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  paymentOptionText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginLeft: 12,
  },
  summarySection: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  discountValue: {
    color: '#4CAF50',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    marginTop: 8,
    paddingTop: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  footer: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  placeOrderButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  placeOrderButtonDisabled: {
    backgroundColor: '#666',
  },
  placeOrderButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
});

