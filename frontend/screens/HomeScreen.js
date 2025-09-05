import React, { useState, useEffect } from 'react';
import { categories, categoryImages } from './categories';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from './LogoutButton';

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
          <Ionicons name="gift-outline" size={28} color="#FF9800" />
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
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => Alert.alert('Filter clicked')}
          >
            <Ionicons name="filter" size={24} color="#fff" />
          </TouchableOpacity>
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
  container: { flex: 1, flexDirection: 'row', backgroundColor: '#f0f0f0' },
  sidebar: {
    width: 80,
    backgroundColor: '#fff',
    paddingTop: 50,
    alignItems: 'center',
    flexDirection: 'column',
  },
  navItem: {
    marginBottom: 30,
    alignItems: 'center',
  },
  navText: {
    color: '#555',
    fontSize: 12,
    textAlign: 'center',
  },
  navTextActive: {
    color: '#007AFF',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  mainContent: { flex: 1, padding: 20 },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
    marginTop: 160,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  topBar: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  searchInput: { flex: 1, height: 40, borderWidth: 1, borderColor: '#aaa', borderRadius: 8, paddingHorizontal: 10 },
  filterButton: { marginLeft: 10, backgroundColor: '#007AFF', padding: 10, borderRadius: 8 },
    categoryBar: {
      marginBottom: 18,
      marginTop: 8,
      paddingVertical: 8,
      backgroundColor: 'transparent',
      maxHeight: 100,
    },
    categoryBarContent: {
      paddingHorizontal: 24,
      gap: 16,
      alignItems: 'center',
    },
    categoryButton: {
      width: 80,
      height: 90,
      borderRadius: 16,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#fff',
      boxShadow: '0 2px 8px rgba(0,0,0,0.07)',
      marginBottom: 4,
      marginRight: 0,
    },
    iconBox: {
      width: 48,
      height: 48,
      borderRadius: 12,
      backgroundColor: '#f5f5f5',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 4,
    },
    categoryIcon: {
      width: 40,
      height: 40,
      borderRadius: 8,
    },
    categoryText: {
      fontSize: 15,
      textAlign: 'center',
      marginTop: 2,
    },
  addButton: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    maxHeight: 400,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    textAlign: 'center',
  },
  formSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
  },
  uploadButton: {
    backgroundColor: '#34C759',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  productCard: {
    flex: 1,
    margin: 8,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'column', // image on top, info below
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  productImage: {
    width: 100,       // small square
    height: 100,      // small square
    borderRadius: 10,
    marginBottom: 10,
    resizeMode: 'cover', // fills the square nicely
  },
  noImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  productInfo: {
    alignItems: 'center', // center the text
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
  },
  productDetail: {
    fontSize: 13,
    color: '#555',
    textAlign: 'center',
    marginBottom: 2,
  },
  // Removed fixedCategoryBarWrapper style
  productPoints: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 4,
    textAlign: 'center',
  },

});