import React, { useState, useEffect } from 'react';
import { categories, categoryImages } from './categories';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, ImageBackground, Dimensions, Animated, Easing, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from './LogoutButton';
import { colours, spacing, typography } from '../theme';
import NavigationBar from './NavigationBar';
import ProductCard from './ProductCard';


export default function HomeScreen({ navigation }) {
  // Helper to normalize category names (lowercase, remove trailing s, replace underscores)
  function normalizeCategory(str) {
    return str ? str.toLowerCase().replace(/_/g, ' ').replace(/s$/, '') : '';
  }

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 20;
  const [page, setPage] = useState(1);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [numColumns, setNumColumns] = useState(calculateColumns());
  const [itemWidth, setItemWidth] = useState(320); // Fixed width for narrower cards
  const [userPoints, setUserPoints] = useState(1240);
  const bounceAnim = new Animated.Value(0);

  // Calculate number of columns based on screen width
  function calculateColumns() {
    const windowWidth = Dimensions.get('window').width;
    const sidebarWidth = 80;
    const contentWidth = windowWidth - sidebarWidth;
    const padding = spacing.lg * 2;

    // Calculate how many 160px cards can fit with spacing
    const availableWidth = contentWidth - padding;
    const columns = Math.floor(availableWidth / (320 + spacing.sm));

    return Math.max(1, columns); // Ensure at least 1 column
  }

  // Animation for category selection
  const animateCategorySelect = () => {
    bounceAnim.setValue(0);
    Animated.timing(bounceAnim, {
      toValue: 1,
      duration: 300,
      easing: Easing.elastic(1),
      useNativeDriver: true,
    }).start();
  };

  // Update columns on screen resize
  useEffect(() => {
    const updateLayout = () => {
      setNumColumns(calculateColumns());
    };

    const subscription = Dimensions.addEventListener('change', updateLayout);
    updateLayout();

    return () => subscription?.remove();
  }, []);

  // Fetch auto products from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();
      if (response.ok) {
        setProducts(data);
        setFilteredProducts(data.products || []);
        setDisplayedProducts(data.products ? data.products.slice(0, PAGE_SIZE) : []);
      } else {
        Alert.alert('Error', data.error || 'Failed to load products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      Alert.alert('Error', 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  // Filter products by search text
  useEffect(() => {
    let filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase())
    );
    // Category filter (flexible match)
    if (selectedCategory !== 'All') {
      const normSelected = normalizeCategory(selectedCategory);
      filtered = filtered.filter(product =>
        product.category && normalizeCategory(product.category) === normSelected
      );
    }
    setFilteredProducts(filtered);
    setPage(1);
    setDisplayedProducts(filtered.slice(0, PAGE_SIZE));
  }, [searchText, products, selectedCategory]);


  // Load more products when scrolling
  const handleLoadMore = () => {
    if (filteredProducts.length > displayedProducts.length) {
      const nextPage = page + 1;
      setPage(nextPage);
      setDisplayedProducts(filteredProducts.slice(0, nextPage * PAGE_SIZE));
    }
  };

  // Handle category selection with animation
  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    animateCategorySelect();
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/leafy.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={[styles.container, styles.loadingContainer]}>
          <View style={styles.sidebarPlaceholder} />
          <View style={styles.loadingContent}>
            <ActivityIndicator size="large" color={colours.primary} />
            <Text style={styles.loadingText}>Loading eco-friendly products...</Text>
          </View>
        </View>
      </ImageBackground>
    );
  }

  // Render product item using the new ProductCard component
  const renderProductItem = ({ item }) => (
    
    <TouchableOpacity
      onPress={() => navigation.navigate('Recommendations', { product: item })}
      activeOpacity={0.8} // optional: for touch feedback
    >
      <ProductCard item={item} width={itemWidth} animation={bounceAnim} />
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Sidebar - Using NavigationBar component */}
          <NavigationBar navigation={navigation} />

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Header with user points and search - Reduced padding between them */}
            <View style={styles.header}>
              <View style={styles.userPointsContainer}>
                <View style={styles.pointsBadge}>
                  <Ionicons name="leaf" size={20} color={colours.primaryGreen} />
                  <Text style={styles.pointsCount}>{userPoints}</Text>
                </View>
                <Text style={styles.pointsLabel}>Eco Points</Text>
              </View>

              <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color={colours.mediumGray} style={styles.searchIcon} />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search sustainable products..."
                  value={searchText}
                  onChangeText={setSearchText}
                  placeholderTextColor={colours.mediumGray}
                />
              </View>
            </View>

            {/* Category Selector */}
            <View style={styles.categorySection}>
              <Text style={styles.sectionTitle}>Browse Categories</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryBar}
                contentContainerStyle={styles.categoryBarContent}
              >
                {['All', ...categories].map((cat) => (
                  <TouchableOpacity
                    key={cat}
                    style={[
                      styles.categoryButton,
                      selectedCategory === cat && styles.categoryButtonSelected
                    ]}
                    onPress={() => handleCategorySelect(cat)}
                  >
                    <View style={[
                      styles.iconBox,
                      selectedCategory === cat && styles.iconBoxSelected
                    ]}>
                      <Image
                        source={{ uri: cat === 'All' ? 'https://cdn-icons-png.flaticon.com/512/1046/1046783.png' : categoryImages[cat] }}
                        style={styles.categoryIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={[
                      styles.categoryTextItem,
                      selectedCategory === cat && styles.categoryTextSelected
                    ]} numberOfLines={1}>
                      {cat === 'All' ? 'Popular' : cat.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Results Count */}
            <View style={styles.resultsHeader}>
              <Text style={styles.resultsCount}>
                {filteredProducts.length} product{filteredProducts.length !== 1 ? 's' : ''} found
                {selectedCategory !== 'All' ? ` in ${selectedCategory.replace('_', ' ')}` : ' in Popular'}
                {searchText ? ` for "${searchText}"` : ''}
              </Text>

              <TouchableOpacity style={styles.filterButton}>
                <Ionicons name="filter" size={16} color={colours.primary} />
                <Text style={styles.filterText}>Filters</Text>
              </TouchableOpacity>
            </View>

            {/* Product Grid */}
            <View style={styles.productsContainer}>
              <FlatList
                data={displayedProducts}
                keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                contentContainerStyle={styles.gridContainer}
                numColumns={numColumns}
                columnWrapperStyle={numColumns > 1 ? styles.columnWrapper : null}
                renderItem={renderProductItem}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.3}
                key={numColumns}
                ListEmptyComponent={
                  <View style={styles.emptyState}>
                    <Ionicons name="search-outline" size={48} color={colours.mediumGray} />
                    <Text style={styles.emptyStateText}>No products found</Text>
                    <Text style={styles.emptyStateSubtext}>
                      Try adjusting your search or category filters
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  container: {
    flex: 1,
    flexDirection: 'row',
  },
  loadingContainer: {
    backgroundColor: 'transparent',
  },
  sidebarPlaceholder: {
    width: 80,
    backgroundColor: colours.surface,
  },
  loadingContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent'
  },
  loadingText: {
    marginTop: spacing.md,
    color: colours.textSecondary,
    fontSize: typography.sizes.base,
  },
  mainContent: {
    flex: 1,
    padding: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.lg,
    paddingHorizontal: 0, // Reduced horizontal padding
  },
  userPointsContainer: {
    alignItems: 'center',
    flex: 1,
    marginRight: spacing.md, // Reduced space between points and search
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  pointsCount: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colours.primaryGreen,
    marginLeft: spacing.xs,
  },
  pointsLabel: {
    fontSize: typography.sizes.xs,
    color: colours.textSecondary,
    marginTop: spacing.xs,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 2,
    backgroundColor: colours.white,
    borderRadius: 25,
    paddingHorizontal: spacing.md,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  searchIcon: {
    marginRight: spacing.xs,
  },
  searchInput: {
    flex: 1,
    height: 45,
    color: colours.textPrimary,
    fontSize: typography.sizes.base,
  },
  categorySection: {
    marginBottom: spacing.lg,
    backgroundColor: colours.white,
    borderRadius: 16,
    padding: spacing.md,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colours.textPrimary,
    marginBottom: spacing.md,
  },
  categoryBar: {
    paddingVertical: spacing.xs,
  },
  categoryBarContent: {
    paddingHorizontal: spacing.xs,
    alignItems: 'center',
  },
  categoryButton: {
    width: 80,
    height: 100,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.offWhite,
    marginRight: spacing.md,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  categoryButtonSelected: {
    borderColor: colours.primaryGreen,
    backgroundColor: colours.lightGreen + '20',
    shadowColor: colours.primaryGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  iconBox: {
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: colours.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  iconBoxSelected: {
    backgroundColor: colours.primaryGreen + '20',
    transform: [{ scale: 1.1 }],
  },
  categoryIcon: {
    width: 36,
    height: 36,
  },
  categoryTextItem: {
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    color: colours.textSecondary,
    fontWeight: typography.weights.medium,
  },
  categoryTextSelected: {
    color: colours.primaryGreen,
    fontWeight: typography.weights.bold,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  resultsCount: {
    fontSize: typography.sizes.base,
    color: colours.textSecondary,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 16,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  filterText: {
    fontSize: typography.sizes.sm,
    color: colours.primary,
    marginLeft: spacing.xs,
    fontWeight: typography.weights.medium,
  },
  productsContainer: {
    flex: 1,
  },
  gridContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
  },
  columnWrapper: {
    justifyContent: 'flex-start',
    gap: spacing.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  emptyStateText: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.medium,
    color: colours.textSecondary,
    marginTop: spacing.md,
  },
  emptyStateSubtext: {
    fontSize: typography.sizes.sm,
    color: colours.mediumGray,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});