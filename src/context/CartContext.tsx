import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { mutateBag, MutateBagRequest } from '../services/api';
import { showErrorToast } from '../utils/toast';

export interface CartItem {
  packagingId: number;
  quantity: number;
  stockQty: number;
  name: string;
  price: number;
}

interface CartContextType {
  // Cart state
  cartItems: Map<number, CartItem>;

  // Actions
  updateItemQuantity: (packagingId: number, quantity: number, stockQty: number, name: string, price: number) => void;
  getItemQuantity: (packagingId: number) => number;
  syncFromBag: (bagItems: Array<{ packId: number; bagQty: number; maxQty: number; packName: string; priceAfterDiscount: number }>) => void;

  // Loading states
  isLoading: (packagingId: number) => boolean;
  isPending: (packagingId: number) => boolean; // Item is in debounce period

  // Error handling
  hasError: (packagingId: number) => boolean;
  clearError: (packagingId: number) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const [cartItems, setCartItems] = useState<Map<number, CartItem>>(new Map());
  const [loadingItems, setLoadingItems] = useState<Set<number>>(new Set());
  const [pendingItems, setPendingItems] = useState<Set<number>>(new Set());
  const [errorItems, setErrorItems] = useState<Set<number>>(new Set());

  // Store confirmed quantities (last successful server state)
  const confirmedQuantities = useRef<Map<number, number>>(new Map());

  // Debounce timers for each product (per-product debouncing)
  const debounceTimers = useRef<Map<number, NodeJS.Timeout>>(new Map());

  const updateItemQuantity = useCallback((
    packagingId: number, 
    quantity: number, 
    stockQty: number, 
    name: string, 
    price: number
  ) => {
    console.log(`🛒 [CART] Updating quantity for ${packagingId}: ${quantity} (stock: ${stockQty})`);

    // Validate stock quantity
    if (quantity > stockQty) {
      console.warn(`🚫 [CART] Cannot add more than ${stockQty} items (stock limit)`);
      return;
    }

    // Store confirmed quantity if this is the first change for this product
    if (!confirmedQuantities.current.has(packagingId)) {
      const currentQuantity = cartItems.get(packagingId)?.quantity || 0;
      confirmedQuantities.current.set(packagingId, currentQuantity);
      console.log(`💾 [CART] Stored confirmed quantity for ${packagingId}: ${currentQuantity}`);
    }

    // OPTIMISTIC UPDATE: Update UI immediately
    setCartItems(prev => {
      const newMap = new Map(prev);
      if (quantity === 0) {
        newMap.delete(packagingId);
        console.log(`🗑️ [CART] Removed ${packagingId} from cart`);
      } else {
        newMap.set(packagingId, {
          packagingId,
          quantity,
          stockQty,
          name,
          price,
        });
        console.log(`➕ [CART] Updated ${packagingId} quantity to ${quantity}`);
      }
      return newMap;
    });

    // Clear any existing error for this item
    setErrorItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(packagingId);
      return newSet;
    });

    // Clear existing debounce timer for this specific product
    const existingTimer = debounceTimers.current.get(packagingId);
    if (existingTimer) {
      clearTimeout(existingTimer);
      console.log(`⏰ [CART] Cleared existing timer for ${packagingId}`);
    }

    // Mark item as pending (in debounce period)
    setPendingItems(prev => new Set(prev).add(packagingId));

    // INSTANT REMOVAL: If quantity is 0 (removal), don't debounce - execute immediately
    const debounceDelay = quantity === 0 ? 0 : 2000;
    console.log(`⏳ [CART] Item ${packagingId} is now pending (debouncing for ${debounceDelay}ms)`);

    // Set up new debounce timer (per-product, 2 seconds for updates, instant for removals)
    const timer = setTimeout(async () => {
      console.log(`🚀 [CART] Debounce complete for ${packagingId}, starting API call with quantity ${quantity}`);

      // Clear pending state
      setPendingItems(prev => {
        const newSet = new Set(prev);
        newSet.delete(packagingId);
        return newSet;
      });

      // ALWAYS SEND API CALL FOR REMOVALS: Even if confirmed quantity is 0,
      // we need to inform the server to ensure cart state is synchronized
      const confirmedQuantity = confirmedQuantities.current.get(packagingId) || 0;
      console.log(`📤 [CART] Preparing API call for ${packagingId}: confirmed=${confirmedQuantity}, new=${quantity}`);

      // LOCKING DURING REQUEST: Set loading state for this specific product
      // This locks controls while the actual API request is in progress
      setLoadingItems(prev => new Set(prev).add(packagingId));

      try {
        const payload: MutateBagRequest = {
          packgingId: packagingId,
          quantity: quantity,
          comment: '', // Will be implemented later
        };

        console.log(`📤 [CART] Sending MutateBag request:`, payload);
        const response = await mutateBag(payload);
        console.log(`✅ [CART] MutateBag success for ${packagingId}:`, response);

        // SUCCESS: Update confirmed quantity
        confirmedQuantities.current.set(packagingId, quantity);

        // Clear loading state
        setLoadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(packagingId);
          return newSet;
        });

        // No success toast - optimistic UI already showed the change
        // Only show errors to avoid noise

        console.log(`🎉 [CART] Successfully confirmed quantity ${quantity} for ${packagingId}`);

      } catch (error: any) {
        console.error(`❌ [CART] MutateBag failed for ${packagingId}:`, error);

        // FAILURE: Rollback to confirmed quantity
        const confirmedQuantity = confirmedQuantities.current.get(packagingId) || 0;

        console.log(`🔄 [CART] Rolling back ${packagingId} to confirmed quantity: ${confirmedQuantity}`);

        setCartItems(prev => {
          const newMap = new Map(prev);
          if (confirmedQuantity === 0) {
            newMap.delete(packagingId);
          } else {
            newMap.set(packagingId, {
              packagingId,
              quantity: confirmedQuantity,
              stockQty,
              name,
              price,
            });
          }
          return newMap;
        });

        // Set error state for this specific product
        setErrorItems(prev => new Set(prev).add(packagingId));

        // Clear loading state
        setLoadingItems(prev => {
          const newSet = new Set(prev);
          newSet.delete(packagingId);
          return newSet;
        });

        // Clear confirmed quantity since we rolled back
        confirmedQuantities.current.delete(packagingId);

        // Show error toast with rollback message
        const errorMessage = error.message || 'Failed to update cart';
        showErrorToast(
          `${errorMessage}. Quantity reverted to previous value.`,
          'Cart Update Failed'
        );

        console.log(`⚠️ [CART] Error state set for ${packagingId}, user can retry`);
      }

      // Clear the timer reference
      debounceTimers.current.delete(packagingId);
    }, debounceDelay); // 2 second debounce for updates, instant for removals

    debounceTimers.current.set(packagingId, timer);
    console.log(`⏰ [CART] Set ${debounceDelay}ms timer for ${packagingId}`);
  }, [cartItems]);

  const getItemQuantity = useCallback((packagingId: number): number => {
    return cartItems.get(packagingId)?.quantity || 0;
  }, [cartItems]);

  const isLoading = useCallback((packagingId: number): boolean => {
    return loadingItems.has(packagingId);
  }, [loadingItems]);

  const isPending = useCallback((packagingId: number): boolean => {
    return pendingItems.has(packagingId);
  }, [pendingItems]);

  const hasError = useCallback((packagingId: number): boolean => {
    return errorItems.has(packagingId);
  }, [errorItems]);

  const clearError = useCallback((packagingId: number): void => {
    setErrorItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(packagingId);
      return newSet;
    });
  }, []);

  const syncFromBag = useCallback((bagItems: Array<{ packId: number; bagQty: number; maxQty: number; packName: string; priceAfterDiscount: number }>) => {
    console.log('🔄 [CART] Syncing cart from bag data:', bagItems.length, 'items');
    console.log('🔄 [CART] Bag items:', bagItems.map(i => `${i.packId}:${i.bagQty}`).join(', '));

    const newCartItems = new Map<number, CartItem>();
    const newConfirmedQuantities = new Map<number, number>();

    bagItems.forEach(item => {
      console.log(`🔍 [CART] Processing item ${item.packId}: bagQty=${item.bagQty}, name=${item.packName}`);
      if (item.bagQty > 0) {
        newCartItems.set(item.packId, {
          packagingId: item.packId,
          quantity: Math.floor(item.bagQty),
          stockQty: Math.floor(item.maxQty),
          name: item.packName,
          price: item.priceAfterDiscount,
        });
        newConfirmedQuantities.set(item.packId, Math.floor(item.bagQty));
        console.log(`✅ [CART] Added item ${item.packId} to cart with qty ${Math.floor(item.bagQty)}`);
      } else {
        console.log(`⏭️ [CART] Skipped item ${item.packId} (bagQty=${item.bagQty})`);
      }
    });

    setCartItems(newCartItems);
    confirmedQuantities.current = newConfirmedQuantities;

    console.log('✅ [CART] Cart synced:', newCartItems.size, 'items in cart');
    console.log('✅ [CART] Cart items:', Array.from(newCartItems.keys()).join(', '));
  }, []);

  const value: CartContextType = {
    cartItems,
    updateItemQuantity,
    getItemQuantity,
    syncFromBag,
    isLoading,
    isPending,
    hasError,
    clearError,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
