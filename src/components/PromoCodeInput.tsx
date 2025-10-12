import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface PromoCodeInputProps {
  appliedPromoCode?: string;
  discount?: number;
  onApplyPromo: (code: string) => void;
  onRemovePromo: () => void;
}

const PromoCodeInput: React.FC<PromoCodeInputProps> = ({
  appliedPromoCode,
  discount,
  onApplyPromo,
  onRemovePromo,
}) => {
  const [promoCode, setPromoCode] = useState('');

  const handleApply = () => {
    if (promoCode.trim()) {
      onApplyPromo(promoCode.trim());
      setPromoCode('');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Promo Code</Text>
      
      {appliedPromoCode ? (
        <View style={styles.appliedContainer}>
          <View style={styles.appliedPromo}>
            <Ionicons name="pricetag" size={16} color="#4CAF50" />
            <Text style={styles.appliedText}>{appliedPromoCode}</Text>
            {discount && (
              <Text style={styles.discountText}>-EGP {discount.toFixed(2)}</Text>
            )}
          </View>
          <TouchableOpacity onPress={onRemovePromo}>
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Enter promo code"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity 
            style={[styles.applyButton, !promoCode.trim() && styles.applyButtonDisabled]}
            onPress={handleApply}
            disabled={!promoCode.trim()}
          >
            <Text style={[styles.applyButtonText, !promoCode.trim() && styles.applyButtonTextDisabled]}>
              Apply
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    height: 44,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    color: '#333',
    marginRight: 8,
  },
  applyButton: {
    backgroundColor: '#FF0000',
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  applyButtonDisabled: {
    backgroundColor: '#E0E0E0',
  },
  applyButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  applyButtonTextDisabled: {
    color: '#999',
  },
  appliedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F8F4',
    borderRadius: 8,
    padding: 12,
  },
  appliedPromo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  appliedText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginLeft: 8,
    marginRight: 12,
  },
  discountText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
});

export default PromoCodeInput;

