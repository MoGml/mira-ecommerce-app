import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// Generic cart item interface that works with both old and new structures
interface GenericCartItem {
  id: string;
  name?: string;
  image?: string;
  price?: number;
  originalPrice?: number;
  quantity: number;
  uom?: string;
  uomValue?: number;
  inStock?: boolean;
  product?: {
    name: string;
    image: string;
    price: number;
    description?: string;
    inStock?: boolean;
    uom?: string;
    uomValue?: number;
  };
}

interface CartItemCardProps {
  item: GenericCartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onEditOptions?: (id: string) => void;
  isLoading?: boolean;
  isPending?: boolean;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onEditOptions,
  isLoading = false,
  isPending = false,
}) => {
  // Support both old structure (item.product) and new structure (item properties directly)
  const name = item.name || item.product?.name || 'Unknown Product';
  const image = item.image || item.product?.image || '';
  const price = item.price || item.product?.price || 0;
  const description = item.product?.description;
  const uom = item.uom || item.product?.uom;
  const uomValue = item.uomValue || item.product?.uomValue;
  const quantity = item.quantity;
  const isOutOfStock = item.inStock !== undefined ? !item.inStock : (item.product?.inStock !== undefined ? !item.product.inStock : false);

  return (
    <View style={[styles.container, isOutOfStock && styles.outOfStockContainer]}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: image }}
          style={styles.productImage}
          resizeMode="cover"
        />
        {/* UOM Badge */}
        {uom && uomValue && !isOutOfStock && (
          <View style={styles.uomBadge}>
            <Text style={styles.uomText}>
              {uomValue} {uom}
            </Text>
          </View>
        )}
        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeText}>Out of stock</Text>
            </View>
          </View>
        )}
      </View>
      
      {/* Product Info */}
      <View style={styles.productInfo}>
        <View style={styles.productDetails}>
          <Text style={[styles.productName, isOutOfStock && styles.greyedText]} numberOfLines={2}>
            {name}
          </Text>

          {description && (
            <Text style={[styles.supplier, isOutOfStock && styles.greyedText]} numberOfLines={1}>
              {description}
            </Text>
          )}

          <Text style={[styles.price, isOutOfStock && styles.greyedText]}>
            LE {price.toFixed(2)}
          </Text>
        </View>
        
        {/* Options Link */}
        {onEditOptions && !isOutOfStock && (
          <TouchableOpacity 
            style={styles.optionsButton}
            onPress={() => onEditOptions(item.id)}
          >
            <Text style={styles.optionsText}>Options</Text>
            <Ionicons name="chevron-forward" size={14} color="#007AFF" />
          </TouchableOpacity>
        )}
        
        {isOutOfStock && (
          <TouchableOpacity 
            style={styles.optionsButton}
            onPress={() => onEditOptions?.(item.id)}
          >
            <Text style={[styles.optionsText, styles.greyedText]}>Options</Text>
            <Ionicons name="chevron-forward" size={14} color="#999" />
          </TouchableOpacity>
        )}
      </View>
      
      {/* Quantity Controls or Out of Stock Actions */}
      {isOutOfStock ? (
        <View style={styles.outOfStockActionsRow}>
          <TouchableOpacity
            style={styles.outOfStockTrashButton}
            onPress={() => onRemove(item.id)}
          >
            <View style={styles.trashIconContainer}>
              <Ionicons
                name="trash-bin"
                size={18}
                color="#FF0000"
              />
            </View>
          </TouchableOpacity>
          <Text style={styles.outOfStockQuantity}>{quantity}</Text>
        </View>
      ) : (
        <View style={[styles.quantityControls, isPending && styles.quantityControlsPending]}>
          <TouchableOpacity
            style={[styles.controlButton, styles.leftButton]}
            onPress={() => quantity === 1 ? onRemove(item.id) : onDecrement(item.id)}
            disabled={isLoading}
          >
            <Ionicons
              name={quantity === 1 ? "trash" : "remove"}
              size={20}
              color="#FF0000"
            />
          </TouchableOpacity>

          <View style={styles.quantityTextContainer}>
            {isLoading ? (
              <ActivityIndicator size="small" color="#FF0000" />
            ) : (
              <>
                <Text style={styles.quantityText}>{quantity}</Text>
                {isPending && (
                  <View style={styles.pendingIndicator} />
                )}
              </>
            )}
          </View>

          <TouchableOpacity
            style={[styles.controlButton, styles.rightButton]}
            onPress={() => onIncrement(item.id)}
            disabled={isLoading}
          >
            <Ionicons
              name="add"
              size={20}
              color="#FF0000"
            />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  outOfStockContainer: {
    backgroundColor: '#FAFAFA',
  },
  
  // Image Container
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  uomBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  uomText: {
    color: 'white',
    fontSize: 9,
    fontWeight: '600',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 128, 128, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  outOfStockBadgeText: {
    fontSize: 9,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  
  // Product Info
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    lineHeight: 18,
  },
  supplier: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
    lineHeight: 14,
  },
  price: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  greyedText: {
    color: '#999',
  },
  optionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  optionsText: {
    fontSize: 12,
    color: '#007AFF',
    marginRight: 2,
  },
  
  // In-Stock Quantity Controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    height: 36,
    alignSelf: 'flex-end',
  },
  controlButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  leftButton: {
    marginRight: 0,
  },
  rightButton: {
    marginLeft: 0,
  },
  quantityTextContainer: {
    marginHorizontal: 12,
    minWidth: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  quantityControlsPending: {
    opacity: 0.8,
  },
  pendingIndicator: {
    position: 'absolute',
    bottom: -6,
    left: '50%',
    marginLeft: -2,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#FFA500',
  },

  // Out of Stock Actions
  outOfStockActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 16,
    gap: 8,
  },
  outOfStockTrashButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 18,
    height: 18,
  },
  outOfStockQuantity: {
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
});

export default CartItemCard;
