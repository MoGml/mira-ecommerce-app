import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PaymentMethod } from '../models/data';

interface PaymentMethodCardProps {
  paymentMethod: PaymentMethod;
  onChangePayment?: () => void;
  showChangeButton?: boolean;
}

const PaymentMethodCard: React.FC<PaymentMethodCardProps> = ({
  paymentMethod,
  onChangePayment,
  showChangeButton = true,
}) => {
  const getPaymentIcon = () => {
    switch (paymentMethod.type) {
      case 'visa':
      case 'mastercard':
        return 'card';
      case 'cash':
        return 'cash';
      case 'apple-pay':
        return 'logo-apple';
      case 'wallet':
        return 'wallet';
      default:
        return 'card';
    }
  };

  const getPaymentLabel = () => {
    switch (paymentMethod.type) {
      case 'visa':
        return `Visa ****${paymentMethod.lastFourDigits}`;
      case 'mastercard':
        return `Mastercard ****${paymentMethod.lastFourDigits}`;
      case 'cash':
        return 'Cash on Delivery';
      case 'apple-pay':
        return 'Apple Pay';
      case 'wallet':
        return 'Mira Wallet';
      default:
        return 'Payment Method';
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name={getPaymentIcon()} size={24} color="#333" />
        </View>
        <Text style={styles.label}>{getPaymentLabel()}</Text>
      </View>
      {showChangeButton && onChangePayment && (
        <TouchableOpacity onPress={onChangePayment}>
          <Text style={styles.changeButton}>Change</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    flex: 1,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0000',
  },
});

export default PaymentMethodCard;

