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
          style={[styles.productImage, isOutOfStock && styles.outOfStockImage]} 
        />
        {isOutOfStock && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockBadgeText}>Out of stock</Text>
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
            <Text style={styles.editOptions}>Edit Options</Text>
          </TouchableOpacity>
        )}
        
        <Text style={[styles.price, isOutOfStock && styles.outOfStockText]}>
          LE {product.price.toFixed(2)}
        </Text>
      </View>
      
      <View style={styles.quantityContainer}>
        {isOutOfStock ? (
          <TouchableOpacity 
            style={[styles.quantityButton, styles.trashButton]} 
            onPress={() => onRemove(item.id)}
          >
            <Ionicons 
              name="trash" 
              size={18} 
              color="#FF0000" 
            />
          </TouchableOpacity>
        ) : (
          <>
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
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: 'white',
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
  },
  outOfStockContainer: {
    backgroundColor: '#FFF5F5',
    borderLeftWidth: 3,
    borderLeftColor: '#FF0000',
  },
  imageContainer: {
    position: 'relative',
    marginRight: 12,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  outOfStockImage: {
    opacity: 0.4,
  },
  outOfStockBadge: {
    position: 'absolute',
    bottom: 4,
    left: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingVertical: 2,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  outOfStockBadgeText: {
    fontSize: 9,
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
});

export default CartItemCard;

