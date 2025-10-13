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
      <View style={styles.imageContainer}>
        <Image 
          source={{ uri: product.image }} 
          style={styles.productImage} 
        />
        {isOutOfStock && (
          <View style={styles.outOfStockOverlay}>
            <View style={styles.outOfStockBadge}>
              <Text style={styles.outOfStockBadgeText}>Out of stock</Text>
            </View>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={[styles.productName, isOutOfStock && styles.outOfStockText]} numberOfLines={2}>
          {product.name}
        </Text>
        
        {product.description && (
          <Text style={[styles.supplier, isOutOfStock && styles.outOfStockText]} numberOfLines={1}>
            {product.description}
          </Text>
        )}
        
        {selectedOptions && (
          <Text style={[styles.options, isOutOfStock && styles.outOfStockText]}>{selectedOptions}</Text>
        )}
        
        {onEditOptions && !isOutOfStock && (
          <TouchableOpacity onPress={() => onEditOptions(item.id)}>
            <Text style={styles.editOptions}>Options</Text>
            <Ionicons name="chevron-forward" size={14} color="#999" />
          </TouchableOpacity>
        )}
        
        <Text style={[styles.price, isOutOfStock && styles.outOfStockText]}>
          LE {product.price.toFixed(2)}
        </Text>
      </View>
      
      {isOutOfStock ? (
        <View style={styles.outOfStockActions}>
          <View style={styles.quantityDisplay}>
            <Text style={styles.outOfStockQuantity}>{quantity}</Text>
          </View>
          <TouchableOpacity 
            style={styles.outOfStockTrashButton} 
            onPress={() => onRemove(item.id)}
          >
            <View style={styles.trashIconContainer}>
              <Ionicons 
                name="trash-bin" 
                size={24} 
                color="#FF0000" 
              />
              <View style={styles.xMark}>
                <Ionicons 
                  name="close" 
                  size={10} 
                  color="#FF0000" 
                />
              </View>
            </View>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.quantityContainer}>
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => quantity === 1 ? onRemove(item.id) : onDecrement(item.id)}
          >
            <Ionicons 
              name={quantity === 1 ? "trash" : "remove"} 
              size={18} 
              color="#FF0000" 
            />
          </TouchableOpacity>
          
          <Text style={styles.quantity}>
            {quantity}
          </Text>
          
          <TouchableOpacity 
            style={styles.quantityButton} 
            onPress={() => onIncrement(item.id)}
          >
            <Ionicons 
              name="add" 
              size={18} 
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
    padding: 12,
    marginBottom: 1,
    borderRadius: 0,
  },
  outOfStockContainer: {
    backgroundColor: '#FAFAFA',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
  },
  outOfStockOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(128, 128, 128, 0.6)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  outOfStockBadge: {
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  outOfStockBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
    textAlign: 'center',
  },
  productInfo: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  supplier: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  options: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  editOptions: {
    fontSize: 12,
    color: '#FF0000',
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  outOfStockText: {
    color: '#999',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    paddingHorizontal: 4,
    height: 36,
    minWidth: 90,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FF0000',
  },
  quantity: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 8,
  },
  outOfStockActions: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityDisplay: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  outOfStockQuantity: {
    fontSize: 20,
    fontWeight: '600',
    color: '#999',
  },
  outOfStockTrashButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFE8E8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trashIconContainer: {
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    width: 26,
    height: 26,
  },
  xMark: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -6 }, { translateY: -6 }],
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default CartItemCard;

