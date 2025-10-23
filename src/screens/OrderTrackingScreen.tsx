import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

interface OrderTrackingScreenProps {
  navigation: any;
  route: {
    params: {
      orderId: string;
      orderDetails?: any;
    };
  };
}

export default function OrderTrackingScreen({ navigation, route }: OrderTrackingScreenProps) {
  const { orderId, orderDetails } = route.params || {};

  const handleDismiss = () => {
    navigation.navigate('Home');
  };

  const handleCancelOrder = () => {
    // TODO: Implement cancel order functionality
    console.log('Cancel order:', orderId);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleDismiss} style={styles.closeButton}>
          <Ionicons name="close" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tracking Order</Text>
        <TouchableOpacity onPress={handleCancelOrder} style={styles.cancelButton}>
          <Text style={styles.cancelButtonText}>Cancel Order</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Status */}
        <View style={styles.statusSection}>
          <View style={styles.statusIcon}>
            <Ionicons name="bag" size={60} color="#FF0000" />
          </View>
          <Text style={styles.statusText}>Order Placed</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressSegment, styles.progressActive]} />
            <View style={styles.progressSegment} />
            <View style={styles.progressSegment} />
          </View>
        </View>

        {/* Delivering to */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Delivering to</Text>
            <TouchableOpacity>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.addressContainer}>
            <Ionicons name="location" size={16} color="#FF0000" />
            <Text style={styles.addressText}>Home - 7 El Batrawy Street, Before Boutique Al Sagheer</Text>
          </View>
        </View>

        {/* Receiver Details */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Receiver Details</Text>
            <TouchableOpacity>
              <Text style={styles.changeButton}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.receiverContainer}>
            <Ionicons name="call" size={16} color="#FF0000" />
            <Text style={styles.receiverText}>Hanzada Zada - 010023450567</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Order Summary (16 items)</Text>
            <Ionicons name="chevron-forward" size={20} color="#666" />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.itemsScroll}>
            <View style={styles.itemImage}>
              <Text style={styles.itemQuantity}>x1</Text>
            </View>
            <View style={styles.itemImage}>
              <Text style={styles.itemQuantity}>x1</Text>
            </View>
            <View style={styles.itemImage}>
              <Text style={styles.itemQuantity}>x1</Text>
            </View>
            <View style={styles.itemImage}>
              <Text style={styles.itemQuantity}>x1</Text>
            </View>
            <View style={styles.itemImage}>
              <Text style={styles.itemQuantity}>x1</Text>
            </View>
          </ScrollView>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payments methods</Text>
          <Text style={styles.paymentText}>VISA **** 1344</Text>
        </View>

        {/* Receipt */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Receipt</Text>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Subtotal (20 Items)</Text>
            <Text style={styles.receiptValue}>EGP380.05</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Total Delivery fees</Text>
            <Text style={styles.receiptValue}>EGP30.05</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Driver Tips</Text>
            <Text style={styles.receiptValue}>EGP15.00</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Promotional Code</Text>
            <Text style={[styles.receiptValue, styles.discountValue]}>-EGP30.05</Text>
          </View>
          <View style={styles.receiptRow}>
            <Text style={styles.receiptLabel}>Wallet Balance</Text>
            <Text style={[styles.receiptValue, styles.discountValue]}>-EGP30.05</Text>
          </View>
          <View style={styles.receiptDivider} />
          <View style={styles.receiptRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>EGP380.05</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
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
  closeButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  cancelButton: {
    padding: 4,
  },
  cancelButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  content: {
    flex: 1,
  },
  statusSection: {
    alignItems: 'center',
    paddingVertical: 40,
    backgroundColor: 'white',
    marginBottom: 12,
  },
  statusIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#FFF5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  progressBar: {
    flexDirection: 'row',
    gap: 4,
  },
  progressSegment: {
    width: 60,
    height: 3,
    backgroundColor: '#E0E0E0',
    borderRadius: 2,
  },
  progressActive: {
    backgroundColor: '#FF0000',
  },
  section: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addressText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  receiverContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  receiverText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  itemsScroll: {
    marginTop: 8,
  },
  itemImage: {
    width: 60,
    height: 60,
    backgroundColor: '#F0F0F0',
    borderRadius: 8,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  itemQuantity: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF0000',
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 8,
    minWidth: 16,
    textAlign: 'center',
  },
  paymentText: {
    fontSize: 14,
    color: '#333',
    marginTop: 8,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  receiptLabel: {
    fontSize: 14,
    color: '#666',
  },
  receiptValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  discountValue: {
    color: '#4CAF50',
  },
  receiptDivider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
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
});
