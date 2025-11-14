import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  TextInput,
  ActivityIndicator,
  Modal,
  Animated,
  Alert,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { getCatalog, CatalogResponse, Product, SubCategory, getBag } from '../services/api';
import ProductCard from '../components/ProductCard';
import { useCart } from '../context/CartContext';

// SubCategory Image Component with fallback
const SubCategoryImage = ({ uri, size = 30 }: { uri: string | null; size?: number }) => {
  const [imageError, setImageError] = useState(false);

  if (!uri || imageError) {
    return <MiraLogo size={size} />;
  }

  return (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: 6 }}
      onError={() => setImageError(true)}
      resizeMode="cover"
    />
  );
};

// Mira Logo Component for placeholders
const MiraLogo = ({ size = 40 }: { size?: number }) => (
  <View style={[styles.miraLogo, { width: size, height: size }]}>
    <View style={styles.shoppingBag}>
      <View style={styles.bagHandle} />
      <View style={styles.bagBody}>
        <Text style={styles.logoM}>M</Text>
      </View>
    </View>
    <Text style={[styles.logoText, { fontSize: Math.round(size * 0.3) }]}>ira</Text>
  </View>
);

// Loading Skeleton Component
const ProductSkeleton = () => (
  <View style={styles.skeletonProduct}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonText} />
    <View style={styles.skeletonPrice} />
  </View>
);

export default function SubCategoriesScreen({ route, navigation }: any) {
  const { categoryId, categoryName, selectedSubCategoryId: initialSubCategoryId } = route.params;
  const { syncFromBag } = useCart();

  // Ref for subcategories ScrollView
  const subCategoriesScrollRef = useRef<ScrollView>(null);
  
  // Flag to prevent animation during manual scroll
  const isScrollingRef = useRef(false);
  
  // Initialize selectedSubCategory based on passed parameter
  const getInitialSubCategory = () => {
    if (initialSubCategoryId) {
      return initialSubCategoryId.toString(); // Will be updated when subcategories load
    }
    return 'All';
  };
  
  const [selectedSubCategory, setSelectedSubCategory] = useState(getInitialSubCategory());
  const [selectedSubCategoryId, setSelectedSubCategoryIdState] = useState<number | null>(initialSubCategoryId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [lastRefreshTime, setLastRefreshTime] = useState<number>(0);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  // Sync bag data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 [SUBCATEGORIES] Screen focused, syncing bag data');
      const syncBagData = async () => {
        try {
          const bagData = await getBag();
          const allBagItems = [...bagData.expressBagItems, ...bagData.tomorrowBagItems];
          syncFromBag(allBagItems);
        } catch (error) {
          console.log('⚠️ [SUBCATEGORIES] Could not sync bag data:', error);
          // Silent fail - don't disrupt user experience
        }
      };
      syncBagData();
    }, [syncFromBag])
  );

  // Load catalog data when category changes
  useEffect(() => {
    // Reset subcategory selection when category changes
    if (initialSubCategoryId) {
      setSelectedSubCategoryIdState(initialSubCategoryId);
      // Will update the name once subcategories load
    } else {
      setSelectedSubCategory('All');
      setSelectedSubCategoryIdState(null);
    }

    // Reset other states
    setProducts([]);
    setPage(1);
    setHasMore(true);
    setError(null);
    setHasLoaded(false);

    loadCatalog();
  }, [categoryId, initialSubCategoryId]);

  const loadCatalog = async (resetPage: boolean = true, subCategoryIdOverride?: number | null) => {
    // Prevent multiple simultaneous requests (but allow initial load)
    if (isLoadingProducts && !isRetrying && hasLoaded) {
      console.log('🚫 [CATALOG] Request already in progress, skipping duplicate request');
      return;
    }

    try {
      setIsLoadingProducts(true);
      setError(null);
      setIsRetrying(false);

      const currentPage = resetPage ? 1 : page;
      // Use override if provided, otherwise use state
      const currentSubCategoryId = subCategoryIdOverride !== undefined ? subCategoryIdOverride : selectedSubCategoryId;

      console.log('🌐 [CATALOG] Loading catalog for category:', categoryId, 'subCategory:', currentSubCategoryId, 'page:', currentPage);
      const data = await getCatalog(categoryId, currentPage, 20, currentSubCategoryId || undefined);
      console.log('✅ [CATALOG] API response received:', data);

      // Transform packs into products (API returns packs directly, but we need Product objects)
      const transformedProducts: Product[] = (data.packs || data.products || []).map((pack: any, index: number) => {
        // If it's already a Product with packs, return as-is
        if (pack.packs && Array.isArray(pack.packs)) {
          return pack as Product;
        }

        // Otherwise, transform Pack into Product
        return {
          productId: pack.packagingId || index,
          subCategoryId: currentSubCategoryId || 0,
          title: pack.name || '',
          packs: [pack]
        } as Product;
      });

      console.log('🔄 [CATALOG] Transformed products:', transformedProducts.length, 'items');

      if (resetPage) {
        setProducts(transformedProducts);
        setPage(1);
        setRetryCount(0); // Reset retry count on successful load
        setHasLoaded(true); // Mark as loaded to enable duplicate request prevention
      } else {
        setProducts(prev => [...prev, ...transformedProducts]);
      }

      // Only set subcategories on first load
      if (resetPage) {
        setSubCategories(data.subCategories || []);

        // Update selectedSubCategory name if we have a selectedSubCategoryId
        if (currentSubCategoryId && data.subCategories) {
          const subCategory = data.subCategories.find(sub => sub.id === currentSubCategoryId);
          if (subCategory) {
            setSelectedSubCategory(subCategory.name || '');
          }
        } else if (!currentSubCategoryId) {
          // Ensure "All" is selected if no subcategory ID
          setSelectedSubCategory('All');
        }
      }

      setHasMore((data.packs || data.products || []).length >= 20);
    } catch (err: any) {
      console.error('❌ [CATALOG] Error loading catalog:', err);
      
      // Set error state but don't show alert immediately - let user retry
      setError(`Failed to load products. ${err.message || 'Please try again.'}`);
      
      // Only show alert if this is not a retry attempt
      if (!isRetrying) {
        Alert.alert(
          'Connection Error', 
          'Unable to load products. Please check your internet connection and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => handleRetry() }
          ]
        );
      }
    } finally {
      setIsLoadingProducts(false);
    }
  };

  // Handle retry logic
  const handleRetry = async () => {
    if (isLoadingProducts) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await loadCatalog(true);
    } catch (err) {
      console.error('❌ [CATALOG] Retry failed:', err);
    }
  };

  // Animate when subcategory changes
  useEffect(() => {
    // Don't animate if user is manually scrolling
    if (isScrollingRef.current) return;
    
    // Calculate the index of the selected subcategory
    let selectedIndex = 0; // Default to "All" (index 0)
    
    if (selectedSubCategory !== 'All') {
      selectedIndex = subCategories.findIndex(sub => sub.name === selectedSubCategory) + 1; // +1 because "All" is at index 0
    }
    
    const targetPosition = selectedIndex * 82; // 82px per item
    const totalItems = subCategories.length + 1; // +1 for "All" option
    const maxPosition = (totalItems - 1) * 82;
    const constrainedPosition = Math.max(0, Math.min(targetPosition, maxPosition));
    
    // Animate the indicator to the new position
    Animated.spring(indicatorAnim, {
      toValue: constrainedPosition, // Use constrained position
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    
    // Fade out and slide right
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 20,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset and fade in with slide from left
      slideAnim.setValue(-20);
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    });
  }, [selectedSubCategory]);

  // Handle subcategory selection - make network call
  const handleSubCategorySelect = (subCategoryName: string) => {
    // Prevent selection if already loading
    if (isLoadingProducts) {
      console.log('🚫 [SUBCATEGORY] Request in progress, ignoring selection');
      return;
    }

    console.log('📂 [SUBCATEGORY] Selecting subcategory:', subCategoryName);

    setSelectedSubCategory(subCategoryName);

    let newSubCategoryId: number | null = null;
    if (subCategoryName === 'All') {
      newSubCategoryId = null;
    } else {
      const subCategory = subCategories.find(sub => sub.name === subCategoryName);
      newSubCategoryId = subCategory?.id || null;
    }

    console.log('📂 [SUBCATEGORY] New subcategory ID:', newSubCategoryId);

    // Update state
    setSelectedSubCategoryIdState(newSubCategoryId);

    // Reset page and load new products with the new subcategory ID
    setPage(1);
    setError(null);

    // Pass the new subcategory ID directly to loadCatalog to avoid stale state
    loadCatalog(true, newSubCategoryId);
  };

  // Filter products based on search only (subcategory filtering is done via API)
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title?.toLowerCase().includes(searchQuery?.toLowerCase() || '') || false;
    return matchesSearch;
  });

  const loadMoreProducts = async () => {
    if (loading || !hasMore || isLoadingProducts) {
      console.log('🚫 [LOAD_MORE] Skipping load more - loading:', loading, 'hasMore:', hasMore, 'isLoadingProducts:', isLoadingProducts);
      return;
    }

    setLoading(true);
    try {
      const nextPage = page + 1;
      console.log('🌐 [LOAD_MORE] Loading page:', nextPage);
      const data = await getCatalog(categoryId, nextPage, 20, selectedSubCategoryId || undefined);

      // Transform packs into products (same as loadCatalog)
      const transformedProducts: Product[] = (data.packs || data.products || []).map((pack: any, index: number) => {
        // If it's already a Product with packs, return as-is
        if (pack.packs && Array.isArray(pack.packs)) {
          return pack as Product;
        }

        // Otherwise, transform Pack into Product
        return {
          productId: pack.packagingId || index,
          subCategoryId: selectedSubCategoryId || 0,
          title: pack.name || '',
          packs: [pack]
        } as Product;
      });

      console.log('✅ [LOAD_MORE] Loaded', transformedProducts.length, 'more products');

      setProducts(prev => [...prev, ...transformedProducts]);
      setPage(nextPage);
      setHasMore((data.packs || data.products || []).length >= 20);
    } catch (err: any) {
      console.error('❌ [LOAD_MORE] Error loading more products:', err);
      // Don't show alert for pagination errors, just log them
      // The user can still see the existing products
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }: { item: Product }) => {
    // Get the first pack for display
    const firstPack = item.packs && item.packs.length > 0 ? item.packs[0] : null;
    
    return (
      <ProductCard
        id={(firstPack?.packagingId || item.productId).toString()}
        name={firstPack?.name || item.title || 'Unknown Product'}
        image={firstPack?.pictureUrl && firstPack.pictureUrl.trim() !== '' ? firstPack.pictureUrl : undefined}
        price={firstPack?.priceAfterDiscount || 0}
        originalPrice={firstPack?.price || 0}
        discount={firstPack?.discountPercentage || 0}
        rating={0}
        reviews={0}
        inStock={(firstPack?.stockQty || 0) > 0}
        uom={firstPack?.uomName || ''}
        uomValue={firstPack?.convertRatio || 1}
        promotionalMessages={[]}
        weight={undefined}
        schedule={undefined}
        badge={firstPack?.discountPercentage && firstPack.discountPercentage > 0 ? 'lowest-price' : undefined}
        badgeText={firstPack?.discountPercentage && firstPack.discountPercentage > 0 ? `${firstPack.discountPercentage.toString()}% off` : undefined}
        soldCount={0}
        packagingId={firstPack?.packagingId}
        stockQty={firstPack?.stockQty || 0}
        variant="grid"
        onPress={() => {
          console.log('Product pressed:', (firstPack?.packagingId || item.productId).toString());
        }}
        onAddToCart={() => {
          console.log('Added to cart:', (firstPack?.packagingId || item.productId).toString());
        }}
        onNotify={() => {
          console.log('Notify me when available:', (firstPack?.packagingId || item.productId).toString());
        }}
      />
    );
  };

  const renderSubCategory = (subCategory: SubCategory) => {
    const categoryName = subCategory.name || '';
    return (
      <TouchableOpacity
        key={subCategory.id}
        style={[
          styles.subCategoryItem,
          selectedSubCategory === categoryName && styles.selectedSubCategory
        ]}
        onPress={() => handleSubCategorySelect(categoryName)}
      >
        <View style={[
          styles.subCategoryIcon,
          selectedSubCategory === categoryName && styles.selectedSubCategoryIcon
        ]}>
          <SubCategoryImage uri={subCategory.pictureUrl} size={30} />
        </View>
        <Text style={[
          styles.subCategoryText,
          selectedSubCategory === categoryName && styles.selectedSubCategoryText
        ]}>
          {categoryName}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.container}>
        {/* Header with Custom Back Button and Search */}
        <View style={styles.header}>
        <TouchableOpacity 
          style={styles.customBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={16} color="#333" />
        </TouchableOpacity>
        
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Need anything? Freshly, Snacks"
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor="#999"
          />
        </View>
      </View>

      {/* Category Selector Dropdown */}
      <TouchableOpacity 
        style={styles.categoryDropdown}
        onPress={() => setShowCategoryDropdown(true)}
      >
        <Text style={styles.categoryDropdownText}>{categoryName}</Text>
        <Ionicons name="chevron-down" size={20} color="#333" />
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Left Sidebar - Subcategories */}
        <View style={styles.sidebar}>
          {/* Animated Selection Indicator */}
          <Animated.View 
            style={[
              styles.selectionIndicator,
              {
                transform: [{ translateY: indicatorAnim }]
              }
            ]} 
          />
          <ScrollView 
            ref={subCategoriesScrollRef}
            showsVerticalScrollIndicator={false}
            onScrollBeginDrag={() => {
              isScrollingRef.current = true;
            }}
            onScrollEndDrag={() => {
              isScrollingRef.current = false;
            }}
            onScroll={(event) => {
              // Only update indicator if user is actively scrolling
              if (!isScrollingRef.current) return;
              
              const scrollY = event.nativeEvent.contentOffset.y;
              const itemHeight = 82; // Height of each subcategory item
              const totalItems = subCategories.length + 1; // +1 for "All" option
              const maxScrollPosition = (totalItems - 1) * itemHeight;
              
              // Constrain scroll position to stay within bounds
              const constrainedScrollY = Math.max(0, Math.min(scrollY, maxScrollPosition));
              
              // Update the indicator position to follow scroll exactly (smooth following)
              Animated.timing(indicatorAnim, {
                toValue: constrainedScrollY, // Follow scroll position directly, constrained to bounds
                duration: 0, // No animation, immediate update
                useNativeDriver: true,
              }).start();
            }}
            scrollEventThrottle={16}
          >
            {/* Add "All" option */}
            <TouchableOpacity
              style={[
                styles.subCategoryItem,
                selectedSubCategory === 'All' && styles.selectedSubCategory
              ]}
              onPress={() => handleSubCategorySelect('All')}
            >
              <View style={[
                styles.subCategoryIcon,
                selectedSubCategory === 'All' && styles.selectedSubCategoryIcon
              ]}>
                <MiraLogo size={30} />
              </View>
              <Text style={[
                styles.subCategoryText,
                selectedSubCategory === 'All' && styles.selectedSubCategoryText
              ]}>
                All
              </Text>
            </TouchableOpacity>
            {subCategories.map(renderSubCategory)}
          </ScrollView>
        </View>

        {/* Right Content - Products */}
        <Animated.View 
          style={[
            styles.productsContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateX: slideAnim }]
            }
          ]}
        >
          {isLoadingProducts && !hasLoaded ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="cloud-offline-outline" size={64} color="#FF6B6B" />
              <Text style={styles.errorTitle}>Connection Error</Text>
              <Text style={styles.errorMessage}>{error}</Text>
              <TouchableOpacity 
                style={styles.retryButton}
                onPress={handleRetry}
                disabled={isLoadingProducts}
              >
                <Ionicons name="refresh" size={20} color="#FFFFFF" />
                <Text style={styles.retryButtonText}>
                  {isLoadingProducts ? 'Retrying...' : 'Try Again'}
                </Text>
              </TouchableOpacity>
              {retryCount > 0 && (
                <Text style={styles.retryCount}>Retry attempt: {retryCount}</Text>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item, index) => {
                // Use packagingId from first pack if available, otherwise fallback to productId-index
                const firstPack = item.packs && item.packs.length > 0 ? item.packs[0] : null;
                return firstPack ? firstPack.packagingId.toString() : `${item.productId.toString()}-${index.toString()}`;
              }}
              numColumns={2}
              key={'grid-2-columns'}
              columnWrapperStyle={styles.columnWrapper}
              contentContainerStyle={styles.productsGrid}
              onEndReached={loadMoreProducts}
              onEndReachedThreshold={0.1}
              showsVerticalScrollIndicator={false}
              ListFooterComponent={() => 
                loading ? <ActivityIndicator size="large" color="#FF0000" style={styles.loader} /> : null
              }
              ListEmptyComponent={() => 
                !isLoadingProducts && !error ? (
                  <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>No products found</Text>
                  </View>
                ) : null
              }
            />
          )}
        </Animated.View>
      </View>

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
  },
  customBackButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  categoryDropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  categoryDropdownText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  content: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebar: {
    width: 100,
    backgroundColor: '#F8F8F8',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
    position: 'relative',
  },
  selectionIndicator: {
    position: 'absolute',
    right: 0,
    top: 0,
    width: 3,
    height: 82,
    backgroundColor: '#FF0000',
    zIndex: 10,
  },
  subCategoryItem: {
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 8,
    height: 82,
  },
  selectedSubCategory: {
    backgroundColor: '#FFFFFF',
  },
  subCategoryIcon: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#E0E0E0',
  },
  selectedSubCategoryIcon: {
    borderColor: '#FF0000',
  },
  subCategoryImage: {
    width: 30,
    height: 30,
    borderRadius: 6,
  },
  subCategoryText: {
    fontSize: 10,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 12,
  },
  selectedSubCategoryText: {
    color: '#FF0000',
    fontWeight: 'bold',
  },
  productsContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  productsGrid: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  skeletonProduct: {
    flex: 1,
    backgroundColor: 'white',
    margin: 4,
    borderRadius: 8,
    padding: 8,
  },
  skeletonImage: {
    width: '100%',
    height: 100,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
  },
  skeletonText: {
    width: '80%',
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 4,
  },
  skeletonPrice: {
    width: '60%',
    height: 10,
    backgroundColor: '#E0E0E0',
    borderRadius: 5,
  },
  loader: {
    marginVertical: 20,
  },
  // Mira Logo styles
  miraLogo: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  shoppingBag: {
    width: '60%',
    height: '60%',
    backgroundColor: '#D2B48C',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#8B4513',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  bagHandle: {
    position: 'absolute',
    top: -2,
    left: '20%',
    right: '20%',
    height: 4,
    borderTopWidth: 1,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#8B4513',
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  },
  bagBody: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoM: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  logoText: {
    fontWeight: 'bold',
    color: '#FF0000',
    marginTop: 2,
  },
  // Empty state styles
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  // Error state styles
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
    paddingVertical: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 22,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF0000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  retryCount: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});
