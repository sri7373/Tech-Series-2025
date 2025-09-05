import React, { useState, useEffect } from 'react';
import { categories, categoryImages } from './categories';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  // Sort products so images appear first
  const sortedProducts = filteredProducts.sort((a, b) => {
    if (a.imageUrl && !b.imageUrl) return -1;
    if (!a.imageUrl && b.imageUrl) return 1;
    return 0;
  });

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <View style={styles.sidebar}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Home')}
        >
          <Ionicons name="home" size={28} color="#007AFF" />
          <Text style={styles.navTextActive}>Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Ionicons name="trophy" size={28} color="#555" />
          <Text style={styles.navText}>Leaderboard</Text>
        </TouchableOpacity>

        {/* Upload Button */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Upload')}
        >
          <Ionicons name="cloud-upload-outline" size={28} color="#555" />
          <Text style={styles.navText}>Upload</Text>
        </TouchableOpacity>

        {/* Voucher Button aligned with other navItems */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('VoucherScreen')}
        >
          <Ionicons name="gift-outline" size={28} color={colours.primary} />
          <Text style={styles.navText}>Vouchers</Text>
        </TouchableOpacity>

        {/* Push logout & profile to bottom */}
        <View style={{ flex: 1 }} />

        {/* Profile Icon */}
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Profile')}
        >
          <Ionicons name="person-circle" size={28} color="#007AFF" />
          <Text style={styles.navText}>Profile</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Logout')}
        >
          <Ionicons name="log-out-outline" size={28} color="#FF3B30" />
          <Text style={styles.navText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Title & Subtitle */}
        <Text style={styles.title}>Products</Text>

        {/* Search Bar */}
        <View style={styles.topBar}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryBar} contentContainerStyle={styles.categoryBarContent}>
            {['All', ...categories].map((cat, idx) => (
              <TouchableOpacity
                key={cat}
                style={{
                  ...styles.categoryButton,
                  borderColor: selectedCategory === cat ? '#FF6B35' : '#eee',
                  borderWidth: selectedCategory === cat ? 2 : 1,
                  backgroundColor: '#fff',
                  marginRight: 16,
                  height: 110,
                  justifyContent: 'center',
                  alignItems: 'center', 
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
                  color: selectedCategory === cat ? '#FF6B35' : '#333',
                  fontWeight: selectedCategory === cat ? 'bold' : 'normal',
                  textTransform: 'capitalize',
                }}>{cat.replace('_', ' ')}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

        {/* Product List */}
      <View style={{ flex: 1, marginTop: 0 }}>
          <FlatList
            data={displayedProducts}
            keyExtractor={(item) => item.id || item._id || Math.random().toString()}
            contentContainerStyle={{ paddingBottom: 20 }}
            numColumns={2}
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
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, flexDirection: 'row', backgroundColor: colours.background },
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
  topBar: { flexDirection: 'row', marginBottom: spacing.lg, alignItems: 'center' },
  searchInput: { 
    flex: 1, 
    height: spacing.xl, // was spacing.lg, now larger
    borderWidth: 1, 
    borderColor: colours.border, 
    borderRadius: spacing.md, 
    paddingHorizontal: spacing.md,
    backgroundColor: colours.inputBackground,
    color: colours.text,
    fontSize: typography.body, // ensure readable font size
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
    borderColor: colours.border,
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
    shadowColor: colours.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  productImage: {
    width: 100,
    height: 100,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    resizeMode: 'cover',
  },
  noImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: spacing.sm,
    marginBottom: spacing.sm,
    backgroundColor: colours.muted,
    justifyContent: 'center',
    alignItems: 'center',
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