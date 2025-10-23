import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Address } from '../services/api';

export interface AddressContextType {
  selectedAddress: Address | null;
  isLoading: boolean;
  setSelectedAddress: (address: Address | null) => Promise<void>;
  clearSelectedAddress: () => Promise<void>;
  hasValidAddress: () => boolean;
}

const AddressContext = createContext<AddressContextType | undefined>(undefined);

const SELECTED_ADDRESS_KEY = '@mira_selected_address';

export const AddressProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedAddress, setSelectedAddressState] = useState<Address | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load selected address from storage on mount
  useEffect(() => {
    loadSelectedAddress();
  }, []);

  const loadSelectedAddress = async () => {
    try {
      const addressData = await AsyncStorage.getItem(SELECTED_ADDRESS_KEY);
      if (addressData) {
        const address = JSON.parse(addressData);
        setSelectedAddressState(address);
      }
    } catch (error) {
      console.error('Error loading selected address:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setSelectedAddress = async (address: Address | null) => {
    try {
      if (address) {
        await AsyncStorage.setItem(SELECTED_ADDRESS_KEY, JSON.stringify(address));
      } else {
        await AsyncStorage.removeItem(SELECTED_ADDRESS_KEY);
      }
      setSelectedAddressState(address);
    } catch (error) {
      console.error('Error saving selected address:', error);
    }
  };

  const clearSelectedAddress = async () => {
    try {
      await AsyncStorage.removeItem(SELECTED_ADDRESS_KEY);
      setSelectedAddressState(null);
    } catch (error) {
      console.error('Error clearing selected address:', error);
    }
  };

  const hasValidAddress = () => {
    return selectedAddress !== null && selectedAddress.id !== undefined;
  };

  return (
    <AddressContext.Provider
      value={{
        selectedAddress,
        isLoading,
        setSelectedAddress,
        clearSelectedAddress,
        hasValidAddress,
      }}
    >
      {children}
    </AddressContext.Provider>
  );
};

export const useAddress = () => {
  const context = useContext(AddressContext);
  if (context === undefined) {
    throw new Error('useAddress must be used within an AddressProvider');
  }
  return context;
};
