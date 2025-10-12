import React, { useState, useEffect, useRef } from 'react';
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
  Animated 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { categoryGroups, sampleProducts } from '../models/data';
import ProductCard from '../components/ProductCard';

// Mira Logo Component for placeholders
const MiraLogo = ({ size = 40 }: { size?: number }) => (
  <View style={[styles.miraLogo, { width: size, height: size }]}>
    <View style={styles.shoppingBag}>
      <View style={styles.bagHandle} />
      <View style={styles.bagBody}>
        <Text style={styles.logoM}>M</Text>
      </View>
    </View>
    <Text style={[styles.logoText, { fontSize: size * 0.3 }]}>ira</Text>
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
  const { categoryId, categoryName } = route.params;
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState(sampleProducts);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const slideAnim = useRef(new Animated.Value(0)).current;
  const indicatorAnim = useRef(new Animated.Value(0)).current;

  // Find the current category group and subcategories
  const currentGroup = categoryGroups.find(group => 
    group.categories.some(cat => cat.id === categoryId)
  );
  const currentCategory = currentGroup?.categories.find(cat => cat.id === categoryId);
  const subCategories = currentCategory?.subCategories || [];

  // Simulate loading products
  useEffect(() => {
    setIsLoadingProducts(true);
    setTimeout(() => {
      setIsLoadingProducts(false);
    }, 1500);
  }, [categoryId]);

  // Animate when subcategory changes
  useEffect(() => {
    // Calculate the index of the selected subcategory
    const selectedIndex = subCategories.findIndex(sub => sub.name === selectedSubCategory);
    
    // Animate the indicator to the new position
    Animated.spring(indicatorAnim, {
      toValue: selectedIndex * 82, // 82px per item (66px height + 16px padding)
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

  // Filter products based on selected subcategory and search
  const filteredProducts = products.filter(product => {
    const matchesCategory = product.categoryId === categoryId;
    const matchesSubCategory = selectedSubCategory === 'All' || 
      product.subCategoryId === subCategories.find(sub => sub.name === selectedSubCategory)?.id;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesCategory && matchesSubCategory && matchesSearch;
  });

  const loadMoreProducts = () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    setTimeout(() => {
      setHasMore(false);
      setLoading(false);
    }, 1000);
  };

  const handleCategorySelect = (category: any) => {
    navigation.navigate('SubCategories', { 
      categoryId: category.id, 
      categoryName: category.name 
    });
    setShowCategoryDropdown(false);
  };

  const renderProduct = ({ item }: { item: any }) => (
    <ProductCard
      id={item.id}
      name={item.name}
      image={item.image}
      price={item.price}
      originalPrice={item.originalPrice}
      discount={item.discount}
      rating={item.rating}
      reviews={item.reviews}
      inStock={item.inStock}
      uom={item.uom}
      uomValue={item.uomValue}
      promotionalMessages={item.promotionalMessages}
      badge={item.badge}
      soldCount={item.soldCount}
      variant="grid"
      onPress={() => {
        // Navigate to product details
        console.log('Product pressed:', item.id);
      }}
      onAddToCart={() => {
        console.log('Added to cart:', item.id);
      }}
      onNotify={() => {
        console.log('Notify me when available:', item.id);
      }}
    />
  );

  const renderSubCategory = (subCategory: any) => (
    <TouchableOpacity
      key={subCategory.id}
      style={[
        styles.subCategoryItem,
        selectedSubCategory === subCategory.name && styles.selectedSubCategory
      ]}
      onPress={() => setSelectedSubCategory(subCategory.name)}
    >
      <View style={[
        styles.subCategoryIcon,
        selectedSubCategory === subCategory.name && styles.selectedSubCategoryIcon
      ]}>
        <Image 
          source={{ uri: currentCategory?.image }} 
          style={styles.subCategoryImage}
          onError={() => <MiraLogo size={30} />}
        />
      </View>
      <Text style={[
        styles.subCategoryText,
        selectedSubCategory === subCategory.name && styles.selectedSubCategoryText
      ]}>
        {subCategory.name}
      </Text>
    </TouchableOpacity>
  );

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
          <ScrollView showsVerticalScrollIndicator={false}>
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
          {isLoadingProducts ? (
            <View style={styles.skeletonGrid}>
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductSkeleton key={index} />
              ))}
            </View>
          ) : (
            <FlatList
              data={filteredProducts}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
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
            />
          )}
        </Animated.View>
      </View>

      {/* Category Selection Modal */}
      <Modal
        visible={showCategoryDropdown}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCategoryDropdown(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Category</Text>
              <TouchableOpacity onPress={() => setShowCategoryDropdown(false)}>
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {categoryGroups.map(group => (
                <View key={group.id} style={styles.modalGroup}>
                  <Text style={styles.modalGroupTitle}>{group.title}</Text>
                  {group.categories.map(category => (
                    <TouchableOpacity
                      key={category.id}
                      style={styles.modalCategoryItem}
                      onPress={() => handleCategorySelect(category)}
                    >
                      <Image 
                        source={{ uri: category.image }} 
                        style={styles.modalCategoryImage}
                        onError={() => <MiraLogo size={40} />}
                      />
                      <Text style={styles.modalCategoryName}>{category.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  modalGroup: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalGroupTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  modalCategoryItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    marginBottom: 4,
  },
  modalCategoryImage: {
    width: 40,
    height: 40,
    borderRadius: 6,
    marginRight: 12,
  },
  modalCategoryName: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});
