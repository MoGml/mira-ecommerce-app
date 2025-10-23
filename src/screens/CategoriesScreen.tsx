import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { getCategories, Category, getBag } from '../services/api';
import { useCart } from '../context/CartContext';

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
const CategorySkeleton = () => (
  <View style={styles.skeletonCategory}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonText} />
  </View>
);

export default function CategoriesScreen({ navigation }: any) {
  const { syncFromBag } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Sync bag data when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      console.log('🔄 [CATEGORIES] Screen focused, syncing bag data');
      const syncBagData = async () => {
        try {
          const bagData = await getBag();
          const allBagItems = [...bagData.expressBagItems, ...bagData.tomorrowBagItems];
          syncFromBag(allBagItems);
        } catch (error) {
          console.log('⚠️ [CATEGORIES] Could not sync bag data:', error);
          // Silent fail - don't disrupt user experience
        }
      };
      syncBagData();
    }, [syncFromBag])
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Note: Removed useFocusEffect auto-refresh to prevent API spam
  // Users can manually refresh via pull-to-refresh

  const loadCategories = useCallback(async (isRefresh = false) => {
    // Prevent multiple simultaneous requests (but allow initial load)
    if (isLoading && !isRetrying && hasLoaded && !isRefresh) {
      console.log('🚫 [CATEGORIES] Request already in progress, skipping duplicate request');
      return;
    }

    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError(null);
      setIsRetrying(false);
      
      console.log('🌐 [CATEGORIES] Loading categories', isRefresh ? '(refresh)' : '(initial)');
      const data = await getCategories();
      console.log('✅ [CATEGORIES] API response received:', data);
      setCategories(Array.isArray(data) ? data : []);
      setRetryCount(0); // Reset retry count on successful load
      setHasLoaded(true); // Mark as loaded to enable duplicate request prevention
    } catch (err: any) {
      console.error('❌ [CATEGORIES] Error loading categories:', err);
      setError(`Failed to load categories. ${err.message || 'Please try again.'}`);
      setCategories([]); // Set empty array on error
      
      // Only show alert if this is not a retry attempt
      if (!isRetrying) {
        Alert.alert(
          'Connection Error', 
          'Unable to load categories. Please check your internet connection and try again.',
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Retry', onPress: () => handleRetry() }
          ]
        );
      }
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [isLoading, isRetrying, hasLoaded]);

  // Handle retry logic
  const handleRetry = async () => {
    if (isLoading) return;
    
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      await loadCategories();
    } catch (err) {
      console.error('❌ [CATEGORIES] Retry failed:', err);
    }
  };

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    // Navigate to SubCategories with "All" selected (no specific subcategory)
    navigation.navigate('SubCategories', { 
      categoryId: parseInt(categoryId), 
      categoryName,
      selectedSubCategoryId: null 
    });
  };

  const handleSubCategoryPress = (categoryId: string, categoryName: string, subCategoryId: string, subCategoryName: string) => {
    // Navigate to SubCategories with specific subcategory selected
    navigation.navigate('SubCategories', { 
      categoryId: parseInt(categoryId), 
      categoryName,
      selectedSubCategoryId: parseInt(subCategoryId)
    });
  };

  const renderCategoryCard = (category: Category) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category.id.toString(), category.name)}
    >
      <MiraLogo size={60} />
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );

  const renderCategoryGroup = (category: Category) => (
    <View key={category.id} style={styles.categoryGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{category.name}</Text>
        <TouchableOpacity onPress={() => handleCategoryPress(category.id.toString(), category.name)}>
          <Text style={styles.seeAllText}>See all</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoriesScroll}
        contentContainerStyle={styles.categoriesContent}
      >
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
            <CategorySkeleton key={index} />
          ))
        ) : (
          category.subCategories.map((subCategory) => (
            <TouchableOpacity
              key={subCategory.id}
              style={styles.categoryCard}
              onPress={() => handleSubCategoryPress(category.id.toString(), category.name, subCategory.id.toString(), subCategory.name)}
            >
              <MiraLogo size={60} />
              <Text style={styles.categoryName}>{subCategory.name}</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );

  if (error && !isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="cloud-offline-outline" size={64} color="#FF6B6B" />
          <Text style={styles.errorTitle}>Connection Error</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={handleRetry}
            disabled={isLoading}
          >
            <Ionicons name="refresh" size={20} color="#FFFFFF" />
            <Text style={styles.retryButtonText}>
              {isLoading ? 'Retrying...' : 'Try Again'}
            </Text>
          </TouchableOpacity>
          {retryCount > 0 && (
            <Text style={styles.retryCount}>Retry attempt: {retryCount}</Text>
          )}
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Need anything? Freshly, Snacks"
          placeholderTextColor="#999"
        />
      </View>

      {/* Category Groups */}
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadCategories(true)}
            tintColor="#FF0000"
            colors={['#FF0000']}
          />
        }
      >
        {isLoading && !hasLoaded ? (
          // Show loading skeleton for initial load
          Array.from({ length: 3 }).map((_, index) => (
            <View key={index} style={styles.categoryGroup}>
              <View style={styles.groupHeader}>
                <View style={styles.skeletonText} />
                <View style={styles.skeletonText} />
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoriesScroll}
                contentContainerStyle={styles.categoriesContent}
              >
                {Array.from({ length: 4 }).map((_, subIndex) => (
                  <CategorySkeleton key={subIndex} />
                ))}
              </ScrollView>
            </View>
          ))
        ) : categories && categories.length > 0 ? (
          categories.map(renderCategoryGroup)
        ) : !isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>No categories available</Text>
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    marginHorizontal: 16,
    marginVertical: 12,
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
  scrollView: {
    flex: 1,
  },
  categoryGroup: {
    marginBottom: 24,
  },
  groupHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    fontSize: 14,
    color: '#FF0000',
    fontWeight: '500',
  },
  categoriesScroll: {
    paddingLeft: 16,
  },
  categoriesContent: {
    paddingRight: 16,
  },
  categoryCard: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  categoryImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '500',
    color: '#333',
    textAlign: 'center',
    lineHeight: 16,
  },
  // Skeleton styles
  skeletonCategory: {
    alignItems: 'center',
    marginRight: 16,
    width: 100,
  },
  skeletonImage: {
    width: 80,
    height: 80,
    backgroundColor: '#E0E0E0',
    borderRadius: 12,
    marginBottom: 8,
  },
  skeletonText: {
    width: 60,
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
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
  // Error handling styles
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
});
