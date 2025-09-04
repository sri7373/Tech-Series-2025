import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from './LogoutButton';

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]); // All products (auto-fetched)
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);

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
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchText, products]);


  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

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
        
        <LogoutButton navigation={navigation} />
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

        {/* Product List */}
        <FlatList
          data={filteredProducts}
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
                <Text style={styles.productDetail}>CO2: {item.carbonEmissions} kg</Text>
                <Text style={styles.productDetail}>Plastic: {item.plasticUsage} g</Text>
                <Text style={styles.productDetail}>Points: {item.points}</Text>
              </View>
            </View>
          )}
        />
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
    marginTop: 20,
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
    margin: 5,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
  },
  noImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 15,
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
    flex: 1,
    justifyContent: 'center',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  productDetail: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
});