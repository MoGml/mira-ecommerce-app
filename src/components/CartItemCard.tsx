import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItem } from '../models/data';

interface CartItemCardProps {
  item: CartItem;
  onIncrement: (id: string) => void;
  onDecrement: (id: string) => void;
  onRemove: (id: string) => void;
  onEditOptions?: (id: string) => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
  item,
  onIncrement,
  onDecrement,
  onRemove,
  onEditOptions,
}) => {
  const { product, quantity, selectedOptions } = item;
  const isOutOfStock = !product.inStock;

  return (
    <View style={[styles.container, isOutOfStock && styles.outOfStockContainer]}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.productImage} 
          resizeMode="cover"
        />
        {/* UOM Badge */}
        {product.uom && product.uomValue && !isOutOfStock && (
          <View style={styles.uomBadge}>
            <Text style={styles.uomText}>
              {product.uomValue} {product.uom}
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
            {product.name}
          </Text>
          
          {product.description && (
            <Text style={[styles.supplier, isOutOfStock && styles.greyedText]} numberOfLines={1}>
              {product.description}
            </Text>
          )}
          
          <Text style={[styles.price, isOutOfStock && styles.greyedText]}>
            LE {product.price.toFixed(2)}
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
        <View style={styles.outOfStockActions}>
          <Text style={styles.outOfStockQuantity}>{quantity}</Text>
          <TouchableOpacity 
            style={styles.outOfStockTrashButton} 
            onPress={() => onRemove(item.id)}
          >
            <View style={styles.trashIconContainer}>
              <Ionicons 
                name="trash-bin" 
                size={26} 
                color="#FF0000" 
              />
              <View style={styles.xMark}>
                <Ionicons 
                  name="close" 
                  size={12} 
                  color="#FF0000" 
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.quantityControls}>
          <TouchableOpacity 
            style={[styles.controlButton, styles.leftButton]} 
            onPress={() => quantity === 1 ? onRemove(item.id) : onDecrement(item.id)}
          >
            <Ionicons 
              name={quantity === 1 ? "trash" : "remove"} 
              size={20} 
              color="#FF0000" 
            />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{quantity}</Text>
          
          <TouchableOpacity 
            style={[styles.controlButton, styles.rightButton]} 
            onPress={() => onIncrement(item.id)}
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
    width: 100,
    height: 100,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  uomBadge: {
    position: 'absolute',
    bottom: 6,
    left: 6,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  uomText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '600',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 128, 128, 0.6)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  outOfStockBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  
  // Product Info
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productDetails: {
    flex: 1,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 6,
    lineHeight: 20,
  },
  supplier: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  price: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
  },
  greyedText: {
    color: '#999',
  },
  optionsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  optionsText: {
    fontSize: 14,
    color: '#007AFF',
    marginRight: 2,
  },
  
  // In-Stock Quantity Controls
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 22,
    paddingHorizontal: 6,
    paddingVertical: 4,
    height: 44,
  },
  controlButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  leftButton: {
    marginRight: 0,
  },
  rightButton: {
    marginLeft: 0,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginHorizontal: 16,
    minWidth: 20,
    textAlign: 'center',
  },
  
  // Out of Stock Actions
  outOfStockActions: {
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  outOfStockQuantity: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
    marginBottom: 8,
  },
  outOfStockTrashButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 28,
    height: 28,
  },
  xMark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -6 }, { translateY: -6 }],
  },
});

export default CartItemCard;
