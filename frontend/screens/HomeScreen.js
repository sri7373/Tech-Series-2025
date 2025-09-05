import React, { useState, useEffect } from 'react';
import { categories, categoryImages } from './categories';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from './LogoutButton';
import { colours, spacing, typography } from '../theme';

export default function HomeScreen({ navigation }) {
  // Helper to normalize category names (lowercase, remove trailing s, replace underscores)
  function normalizeCategory(str) {
    return str ? str.toLowerCase().replace(/_/g, ' ').replace(/s$/, '') : '';
  }
  

  
  const [products, setProducts] = useState([]); // All products (auto-fetched)
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const PAGE_SIZE = 10;
  const [page, setPage] = useState(1);
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [hoveredNav, setHoveredNav] = useState(null);

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

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/leafy.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(232,245,233,0.5)' }}>
          <ActivityIndicator size="large" color={colours.primary} />
        </View>
      </ImageBackground>
    );
  }

  // Sort products so images appear first
  const sortedProducts = filteredProducts.sort((a, b) => {
    if (a.imageUrl && !b.imageUrl) return -1;
    if (!a.imageUrl && b.imageUrl) return 1;
    return 0;
  });

  return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Sidebar */}
          <View style={styles.sidebar}>
            <TouchableOpacity
              style={[
                styles.navItem,
                hoveredNav === 'home' && styles.navItemHover
              ]}
              onPress={() => navigation.navigate('Home')}
              onMouseEnter={() => setHoveredNav('home')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <Ionicons name="home" size={28} color="#007AFF" />
              <Text style={styles.navTextActive}>ECOmmerce</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navItem,
                hoveredNav === 'leaderboard' && styles.navItemHover
              ]}
              onPress={() => navigation.navigate('Leaderboard')}
              onMouseEnter={() => setHoveredNav('leaderboard')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <Ionicons name="trophy" size={28} color="#555" />
              <Text style={styles.navText}>Leaderboard</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navItem,
                hoveredNav === 'upload' && styles.navItemHover
              ]}
              onPress={() => navigation.navigate('Upload')}
              onMouseEnter={() => setHoveredNav('upload')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <Ionicons name="cloud-upload-outline" size={28} color="#555" />
              <Text style={styles.navText}>Upload</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navItem,
                hoveredNav === 'voucher' && styles.navItemHover
              ]}
              onPress={() => navigation.navigate('VoucherScreen')}
              onMouseEnter={() => setHoveredNav('voucher')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <Ionicons name="gift-outline" size={28} color={colours.primary} />
              <Text style={styles.navText}>Vouchers</Text>
            </TouchableOpacity>

            <View style={{ flex: 1 }} />

            <TouchableOpacity
              style={[
                styles.navItem,
                hoveredNav === 'profile' && styles.navItemHover
              ]}
              onPress={() => navigation.navigate('Profile')}
              onMouseEnter={() => setHoveredNav('profile')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <Ionicons name="person-circle" size={28} color="#007AFF" />
              <Text style={styles.navText}>Profile</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.navItem,
                hoveredNav === 'logout' && styles.navItemHover
              ]}
              onPress={() => navigation.navigate('Logout')}
              onMouseEnter={() => setHoveredNav('logout')}
              onMouseLeave={() => setHoveredNav(null)}
            >
              <Ionicons name="log-out-outline" size={28} color="#FF3B30" />
              <Text style={styles.navText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Title & Subtitle */}

            {/* Search Bar */}
            <View style={styles.topBar}>
              <TextInput
                style={styles.searchInput}
                placeholder="Search products..."
                value={searchText}
                onChangeText={setSearchText}
              />
            </View>

            <View style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.categoryBar}
                contentContainerStyle={[styles.categoryBarContent, { justifyContent: 'center', alignItems: 'center' }]}
              >
                {['All', ...categories].map((cat, idx) => (
                  <TouchableOpacity
                    key={cat}
                    style={{
                      ...styles.categoryButton,
                      borderColor: selectedCategory === cat ? colours.shadowDark : colours.border, // use shadowDark for selected
                      borderWidth: selectedCategory === cat ? 2 : 1,
                      backgroundColor: selectedCategory === cat ? colours.muted : colours.surface, // highlight selected
                      marginRight: 16,
                      height: 110,
                      justifyContent: 'center',
                      alignItems: 'center',
                      // Add shadow to navigator/category button
                      shadowColor: colours.shadowDark,
                      shadowOffset: { width: 0, height: 2 },
                      shadowOpacity: selectedCategory === cat ? 0.25 : 0.12,
                      shadowRadius: selectedCategory === cat ? 6 : 3,
                      elevation: selectedCategory === cat ? 6 : 2,
                    }}
                    onPress={() => setSelectedCategory(cat)}
                  >
                    <View style={styles.iconBox}>
                      <Image
                        source={{ uri: cat === 'All' ? 'https://cdn-icons-png.flaticon.com/512/1046/1046783.png' : categoryImages[cat] }}
                        style={styles.categoryIcon}
                        resizeMode="contain"
                      />
                    </View>
                    <Text style={{
                      ...styles.categoryText,
                      color: selectedCategory === cat ? colours.primary : colours.text,
                      fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                      textTransform: 'capitalize',
                    }}>
                      {cat.replace('_', ' ')}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Product List */}
          <View style={{ flex: 1, marginTop: 0 }}>
              <FlatList
                data={displayedProducts}
                keyExtractor={(item) => item.id || item._id || Math.random().toString()}
                contentContainerStyle={{ paddingBottom: 20 }}
                numColumns={4}
                renderItem={({ item }) => (
                  <View style={styles.productCard}>
                    {item.imageUrl ? (
                      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
                    ) : (
                      <View style={styles.noImagePlaceholder}>
                        <Text style={styles.noImageText}>No Image</Text>
                      </View>
                    )}
                    <View style={styles.productInfo}>
                      <Text style={styles.productName}>{item.name}</Text>
                      <Text style={styles.productDetail}>${item.price} </Text>
                      <Text style={styles.productDetail}>CO2: {item.carbonEmissions} g</Text>
                      <Text style={styles.productDetail}>Plastic: {item.plasticUsage} g</Text>
                      <Text style={styles.productDetail}>EcoScore: {item.sustainabilityScore}</Text>
                      <Text style={styles.productDetail}>Points: {item.points}</Text>
                      <Text style={styles.productDetail}>Category: {item.category}</Text>
                    </View>
                  </View>
                )}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
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
    backgroundColor: 'rgba(232,245,233,0.5)', // less opaque overlay
  },
  container: { 
    flex: 1, 
    flexDirection: 'row', 
    backgroundColor: 'transparent' 
  },
  sidebar: {
    width: 80,
    backgroundColor: colours.surface,
    paddingTop: spacing.xl,
    alignItems: 'center',
    flexDirection: 'column',
  },
  navItem: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderRadius: spacing.md,
    transition: 'background-color 0.2s',
  },
  navItemHover: {
    backgroundColor: colours.muted,
    boxShadow: `0 2px 8px ${colours.shadowDark}`,
  },
  navText: {
    color: colours.textSecondary,
    fontSize: typography.caption,
    textAlign: 'center',
  },
  navTextActive: {
    color: colours.primary,
    fontSize: typography.caption,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainContent: { flex: 1, padding: 0 },
  title: {
    fontSize: typography.title,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
    marginTop: 0,
    color: colours.primary,
  },
  subtitle: {
    fontSize: typography.body,
    color: colours.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  topBar: { 
    flexDirection: 'row', 
    marginBottom: spacing.lg, 
    alignItems: 'center',
    marginTop: spacing.md, // move down a bit
    justifyContent: 'center',
  },
  searchInput: { 
    width: '80%', // make it smaller and not flush to sides
    height: spacing.xl,
    borderWidth: 1, 
    borderColor: colours.border, 
    borderRadius: spacing.md, 
    paddingHorizontal: spacing.md,
    backgroundColor: colours.inputBackground,
    color: colours.text,
    fontSize: typography.body,
    alignSelf: 'center',
  },
  categoryBar: {
    marginBottom: spacing.md,
    marginTop: spacing.sm,
    paddingVertical: spacing.sm,
    backgroundColor: 'transparent',
    maxHeight: 200,
  },
  categoryBarContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    alignItems: 'center',
  },
  categoryButton: {
    width: 80,
    height: 90,
    borderRadius: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.surface,
    marginBottom: 4,
    marginRight: 0,
    borderColor: colours.border, // changed from '#eee' to theme green border
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: spacing.sm,
    backgroundColor: colours.inputBackground,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  categoryIcon: {
    width: 40,
    height: 40,
    borderRadius: spacing.sm,
  },
  categoryText: {
    fontSize: typography.body,
    textAlign: 'center',
    marginTop: 2,
    color: colours.text,
  },
  addButton: {
    backgroundColor: colours.accent,
    padding: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  buttonText: {
    color: colours.onAccent,
    fontSize: typography.button,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: colours.surface,
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
    maxHeight: 400,
    borderColor: colours.border, // green border for forms
    borderWidth: 1,
  },
  formTitle: {
    fontSize: typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colours.primary,
  },
  formSubtitle: {
    fontSize: typography.caption,
    color: colours.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  inputContainer: {
    marginBottom: spacing.md,
  },
  label: {
    fontSize: typography.caption,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    marginTop: spacing.sm,
    color: colours.text,
  },
  input: {
    borderWidth: 1,
    borderColor: colours.border, // changed from '#ddd' to theme green border
    borderRadius: spacing.md,
    padding: spacing.sm,
    fontSize: typography.body,
    backgroundColor: colours.inputBackground,
    color: colours.text,
  },
  uploadButton: {
    backgroundColor: colours.success,
    padding: spacing.md,
    borderRadius: spacing.md,
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  uploadBox: {
    border: `1.5px solid ${colours.border}`, // ensure green border for upload box
    borderRadius: spacing.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colours.surface,
  },
  disabledButton: {
    backgroundColor: colours.muted,
  },
  productCard: {
    flex: 1,
    margin: spacing.sm,
    backgroundColor: colours.surface,
    borderRadius: spacing.md,
    padding: spacing.sm,
    alignItems: 'center',
    flexDirection: 'column',
    borderColor: colours.border,
    borderWidth: 1,
    // Add shadow for product card
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  productImage: {
    width: 160, // increased from 100
    height: 160, // increased from 100
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    resizeMode: 'cover',
  },
  noImagePlaceholder: {
    width: 160, // match productImage size
    height: 160,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colours.muted,
    justifyContent: 'center',
    alignItems: 'center',
    borderColor: colours.border,
    borderWidth: 1,
  },
  noImageText: {
    fontSize: typography.caption,
    color: colours.textSecondary,
    textAlign: 'center',
  },
  productInfo: {
    alignItems: 'center',
  },
  productName: {
    fontSize: typography.body,
    fontWeight: 'bold',
    marginBottom: spacing.xs,
    textAlign: 'center',
    color: colours.primary,
  },
  productDetail: {
    fontSize: typography.caption,
    color: colours.textSecondary,
    textAlign: 'center',
    marginBottom: 2,
  },
  productPoints: {
    fontSize: typography.body,
    fontWeight: '600',
    color: colours.primary,
    marginTop: spacing.xs,
    textAlign: 'center',
  },

});