import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { categoryGroups } from '../models/data';

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
const CategorySkeleton = () => (
  <View style={styles.skeletonCategory}>
    <View style={styles.skeletonImage} />
    <View style={styles.skeletonText} />
  </View>
);

export default function CategoriesScreen({ navigation }: any) {
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading
  React.useEffect(() => {
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleCategoryPress = (categoryId: string, categoryName: string) => {
    navigation.navigate('SubCategories', { categoryId, categoryName });
  };

  const renderCategoryCard = (category: any) => (
    <TouchableOpacity
      key={category.id}
      style={styles.categoryCard}
      onPress={() => handleCategoryPress(category.id, category.name)}
    >
      <Image 
        source={{ uri: category.image }} 
        style={styles.categoryImage}
        onError={() => <MiraLogo size={60} />}
      />
      <Text style={styles.categoryName}>{category.name}</Text>
    </TouchableOpacity>
  );

  const renderCategoryGroup = (group: any) => (
    <View key={group.id} style={styles.categoryGroup}>
      <View style={styles.groupHeader}>
        <Text style={styles.groupTitle}>{group.title}</Text>
        <TouchableOpacity>
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
          group.categories.map(renderCategoryCard)
        )}
      </ScrollView>
    </View>
  );

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
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {categoryGroups.map(renderCategoryGroup)}
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
});
