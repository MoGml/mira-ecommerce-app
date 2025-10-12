import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Address } from '../models/data';

interface AddressCardProps {
  address: Address;
  onChangeAddress?: () => void;
  showChangeButton?: boolean;
}

const AddressCard: React.FC<AddressCardProps> = ({
  address,
  onChangeAddress,
  showChangeButton = true,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Ionicons name="location" size={20} color="#FF0000" />
          <Text style={styles.title}>Delivery Address</Text>
        </View>
        {showChangeButton && onChangeAddress && (
          <TouchableOpacity onPress={onChangeAddress}>
            <Text style={styles.changeButton}>Change</Text>
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.addressContent}>
        <Text style={styles.label}>{address.label}</Text>
        <Text style={styles.addressText}>
          {address.street}, {address.city}
        </Text>
        {address.building && address.floor && address.apartment && (
          <Text style={styles.addressDetails}>
            Building {address.building}, Floor {address.floor}, Apt {address.apartment}
          </Text>
        )}
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  changeButton: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF0000',
  },
  addressContent: {
    paddingLeft: 28,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  addressDetails: {
    fontSize: 13,
    color: '#999',
    marginTop: 4,
  },
});

export default AddressCard;

