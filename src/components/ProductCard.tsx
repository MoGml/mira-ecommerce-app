import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ProductCardProps {
  id: string;
  name: string;
  image: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  rating?: number;
  reviews?: number;
  weight?: string;
  badge?: 'best-seller' | 'combo' | 'lowest-price';
  badgeText?: string;
  schedule?: string;
  soldCount?: number;
  inStock?: boolean;
  uom?: string; // Unit of measure (KG, Piece, Pack, etc.)
  uomValue?: number; // Value (1, 2, 500, etc.)
  promotionalMessages?: string[]; // Array of promotional messages
  onPress?: () => void;
  onAddToCart?: () => void;
  onNotify?: () => void;
  variant?: 'grid' | 'list' | 'featured';
}

const ProductCard: React.FC<ProductCardProps> = ({
  id,
  name,
  image,
  price,
  originalPrice,
  discount,
  rating,
  reviews,
  weight,
  badge,
  badgeText,
  schedule,
  soldCount,
  inStock = true,
  uom,
  uomValue,
  promotionalMessages = [],
  onPress,
  onAddToCart,
  onNotify,
  variant = 'grid',
}) => {
  const [quantity, setQuantity] = useState(1);
  const [isInCart, setIsInCart] = useState(false);
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);
  
  // Cycle through promotional messages every 3 seconds
  React.useEffect(() => {
    if (promotionalMessages && promotionalMessages.length > 1) {
      const interval = setInterval(() => {
        setCurrentPromoIndex((prev) => 
          (prev + 1) % promotionalMessages.length
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [promotionalMessages]);

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart();
    }
    setIsInCart(true);
  };

  const incrementQuantity = () => {
    setQuantity(prev => prev + 1);
  };

  const decrementQuantity = () => {
    if (quantity > 1) {
      setQuantity(prev => prev - 1);
    } else {
      // If quantity is 1, remove from cart
      setIsInCart(false);
      setQuantity(1);
    }
  };

  const renderBadge = () => {
    if (badge === 'best-seller') {
      return (
        <View style={styles.bestSellerBadge}>
          <Text style={styles.badgeText}>Best Seller</Text>
        </View>
      );
    }
    if (badge === 'combo') {
      return (
        <View style={styles.comboBadge}>
          <Ionicons name="gift" size={12} color="#FF9800" />
          <Text style={styles.comboBadgeText}>Combo</Text>
        </View>
      );
    }
    if (badge === 'lowest-price' || badgeText) {
      return (
        <View style={styles.lowestPriceBadge}>
          <Ionicons name="trending-down" size={12} color="#FF0000" />
          <Text style={styles.lowestPriceText}>
            {badgeText || 'Lowest price in 7 days'}
          </Text>
        </View>
      );
    }
    return null;
  };

  const renderQuantityControl = () => {
    // If out of stock, show notify button
    if (!inStock) {
      return (
        <TouchableOpacity style={styles.notifyButton} onPress={onNotify}>
          <Ionicons name="notifications-outline" size={20} color="#333" />
        </TouchableOpacity>
      );
    }

    if (!isInCart) {
      return (
        <TouchableOpacity style={styles.addToCartButton} onPress={handleAddToCart}>
          <Ionicons name="bag" size={16} color="white" />
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.quantityControl}>
        <TouchableOpacity style={styles.quantityButton} onPress={decrementQuantity}>
          <Ionicons name={quantity === 1 ? "trash" : "remove"} size={16} color="white" />
        </TouchableOpacity>
        <View style={styles.quantityDisplay}>
          <Text style={styles.quantityText}>{quantity}</Text>
        </View>
        <TouchableOpacity style={styles.quantityButton} onPress={incrementQuantity}>
          <Ionicons name="add" size={16} color="white" />
        </TouchableOpacity>
      </View>
    );
  };
  
  // Render promotional messages
  const renderPromotionalMessage = () => {
    if (!promotionalMessages || promotionalMessages.length === 0) return null;
    
    const currentMessage = promotionalMessages[currentPromoIndex];
    const isSchedule = currentMessage.toLowerCase().includes('schedule');
    const isExpress = currentMessage.toLowerCase().includes('express');
    const isLowest = currentMessage.toLowerCase().includes('lowest');
    
    return (
      <View style={styles.promotionalMessage}>
        <Ionicons 
          name={isSchedule ? "calendar-outline" : isExpress ? "flash" : isLowest ? "trending-down" : "information-circle-outline"} 
          size={12} 
          color={isLowest ? "#FF0000" : "#666"} 
        />
        <Text style={[styles.promoText, isLowest && styles.lowestPricePromoText]} numberOfLines={1}>
          {currentMessage}
        </Text>
      </View>
    );
  };

  if (variant === 'list') {
    return (
      <TouchableOpacity style={styles.listCard} onPress={onPress} activeOpacity={0.8}>
        <View style={styles.listContent}>
          {/* Badge */}
          {renderBadge()}

          {/* Image */}
          <View style={styles.listImageContainer}>
            <Image source={{ uri: image }} style={styles.listImage} resizeMode="contain" />
            {discount && (
              <View style={styles.discountTag}>
                <Text style={styles.discountText}>{discount}% off</Text>
              </View>
            )}
            {onNotify && (
              <TouchableOpacity style={styles.notifyButton} onPress={onNotify}>
                <Ionicons name="notifications-outline" size={20} color="#333" />
              </TouchableOpacity>
            )}
          </View>

          {/* Product Info */}
          <View style={styles.listInfo}>
            <Text style={styles.listProductName} numberOfLines={2}>
              {name}
            </Text>
            {weight && <Text style={styles.productWeight}>{weight}</Text>}

            {/* Price */}
            <View style={styles.priceRow}>
              <Text style={styles.currentPrice}>LE {price.toFixed(2)}</Text>
              {originalPrice && (
                <Text style={styles.originalPrice}>
                  LE{originalPrice.toFixed(2)}
                </Text>
              )}
              {discount && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountBadgeText}>{discount}%</Text>
                </View>
              )}
            </View>

            {/* Schedule */}
            {schedule && (
              <View style={styles.scheduleContainer}>
                <Ionicons name="calendar-outline" size={14} color="#666" />
                <Text style={styles.scheduleText}>schedule {schedule}</Text>
              </View>
            )}

            {/* Sold Count */}
            {soldCount && (
              <View style={styles.soldContainer}>
                <Ionicons name="fire" size={14} color="#FF6B00" />
                <Text style={styles.soldText}>{soldCount}+ Sold recent</Text>
              </View>
            )}
          </View>

          {/* Quantity Control */}
          {renderQuantityControl()}
        </View>
      </TouchableOpacity>
    );
  }

  // Grid variant (default)
  return (
    <TouchableOpacity style={styles.gridCard} onPress={onPress} activeOpacity={0.8}>
      {/* Badge at top */}
      {badge && (
        <View style={styles.gridBadgeContainer}>
          {badge === 'best-seller' && (
            <View style={styles.gridBestSellerBadge}>
              <Text style={styles.gridBadgeText}>Best Seller</Text>
            </View>
          )}
          {badge === 'combo' && (
            <View style={styles.gridComboBadge}>
              <Ionicons name="gift" size={10} color="#FF9800" />
              <Text style={styles.gridComboBadgeText}>Combo</Text>
            </View>
          )}
        </View>
      )}

      {/* Image Container */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: image }} style={styles.productImage} resizeMode="contain" />
        {discount && (
          <View style={styles.discountTag}>
            <Text style={styles.discountText}>{discount}% off</Text>
          </View>
        )}
        {renderQuantityControl()}
      </View>

      {/* Product Info */}
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {name}
        </Text>
        
        {/* UOM Display */}
        {uom && uomValue && (
          <Text style={styles.uomText}>{uomValue}{uom}</Text>
        )}
        
        <View style={styles.priceContainer}>
          <Text style={styles.currentPrice}>LE {price.toFixed(2)}</Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>{originalPrice.toFixed(2)}</Text>
          )}
          {discount && (
            <View style={styles.discountPercentBadge}>
              <Text style={styles.discountPercentText}>{discount}%</Text>
            </View>
          )}
        </View>
        
        {/* Promotional Messages */}
        {renderPromotionalMessage()}
        
        {/* Sold Count for out of stock */}
        {!inStock && soldCount && (
          <View style={styles.soldCountContainer}>
            <Ionicons name="fire" size={12} color="#FF6B00" />
            <Text style={styles.soldCountText}>{soldCount}+ Sold recent</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // Grid Card Styles
  gridCard: {
    flex: 1,
    maxWidth: '48%',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    marginHorizontal: '1%',
    marginVertical: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  imageContainer: {
    position: 'relative',
    marginBottom: 8,
    backgroundColor: '#FAFAFA',
    borderRadius: 6,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
  },
  discountTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#FF0000',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 4,
  },
  discountText: {
    fontSize: 10,
    color: 'white',
    fontWeight: 'bold',
  },
  addToCartButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: '#FF0000',
    borderRadius: 16,
    width: 28,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  quantityControl: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  quantityButton: {
    backgroundColor: '#FF0000',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityDisplay: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#333',
    marginBottom: 6,
    lineHeight: 17,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  currentPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#333',
    marginRight: 6,
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
  },

  // List Card Styles
  listCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  listContent: {
    flexDirection: 'column',
  },
  bestSellerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#5C5C5C',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 12,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  lowestPriceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFE5E5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  lowestPriceText: {
    color: '#FF0000',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  listImageContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 12,
  },
  listImage: {
    width: 200,
    height: 200,
  },
  notifyButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  listInfo: {
    marginBottom: 12,
  },
  listProductName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    lineHeight: 24,
  },
  productWeight: {
    fontSize: 14,
    color: '#999',
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
  },
  discountBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginLeft: 8,
  },
  discountBadgeText: {
    color: '#4CAF50',
    fontSize: 12,
    fontWeight: 'bold',
  },
  scheduleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  scheduleText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  soldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  soldText: {
    fontSize: 13,
    color: '#666',
    marginLeft: 6,
  },
  // New styles for enhanced features
  gridBadgeContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  gridBestSellerBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#5C5C5C',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  gridBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold',
  },
  gridComboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderTopLeftRadius: 8,
    borderBottomRightRadius: 8,
  },
  gridComboBadgeText: {
    color: '#FF9800',
    fontSize: 9,
    fontWeight: 'bold',
    marginLeft: 3,
  },
  comboBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFF3E0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 12,
  },
  comboBadgeText: {
    color: '#FF9800',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  uomText: {
    fontSize: 11,
    color: '#999',
    marginBottom: 4,
  },
  discountPercentBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 3,
    marginLeft: 4,
  },
  discountPercentText: {
    color: '#4CAF50',
    fontSize: 10,
    fontWeight: 'bold',
  },
  promotionalMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  promoText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
    flex: 1,
  },
  lowestPricePromoText: {
    color: '#FF0000',
    fontWeight: '600',
  },
  soldCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  soldCountText: {
    fontSize: 10,
    color: '#666',
    marginLeft: 4,
  },
  notifyButton: {
    position: 'absolute',
    bottom: 6,
    right: 6,
    backgroundColor: 'white',
    borderRadius: 20,
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
});

export default ProductCard;

