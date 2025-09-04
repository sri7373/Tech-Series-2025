import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert, ScrollView, ActivityIndicator, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from './LogoutButton';

export default function HomeScreen({ navigation }) {
  // Product form state for adding auto products
  const [productData, setProductData] = useState({
    name: '',
    carbonEmissions: '',
    plasticUsage: '',
    points: ''
  });
  const [products, setProducts] = useState([]); // All products (auto-fetched)
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);

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

  // Create auto product
  const createAutoProduct = async () => {
    if (!productData.name || !productData.carbonEmissions || !productData.plasticUsage) {
      Alert.alert("Missing fields", "Please fill in all required fields!");
      return;
    }
    setCreating(true);
    try {
      const response = await fetch('http://localhost:3000/api/upload/product-auto', {
        method: 'POST',
        body: JSON.stringify({
          name: productData.name,
          carbonEmissions: productData.carbonEmissions,
          plasticUsage: productData.plasticUsage,
          points: productData.points || '0'
        }),
        headers: {
          'Content-Type': 'application/json',
        },
      });
      const result = await response.json();
      if (response.ok) {
        const imageStatus = result.product.hasImage ?
          "with auto-fetched image" :
          "without image (not found in database)";
        Alert.alert(
          "Success",
          `Product "${result.product.name}" created successfully ${imageStatus}!`
        );
        setProductData({
          name: '',
          carbonEmissions: '',
          plasticUsage: '',
          points: ''
        });
        setShowForm(false);
        fetchProducts();
      } else {
        Alert.alert("Error", result.error || "Product creation failed");
      }
    } catch (error) {
      console.error('Creation error:', error);
      Alert.alert("Error", "Network error occurred");
    } finally {
      setCreating(false);
    }
  };

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
        <Text style={styles.title}>Smart Products</Text>
        <Text style={styles.subtitle}>Images auto-fetched from Open Food Facts</Text>

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

        {/* Add Smart Product Button */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowForm(!showForm)}
        >
          <Text style={styles.buttonText}>
            {showForm ? 'Cancel' : 'Add Smart Product'}
          </Text>
        </TouchableOpacity>

        {/* Smart Product Form */}
        {showForm && (
          <ScrollView style={styles.formContainer}>
            <Text style={styles.formTitle}>Create Smart Product</Text>
            <Text style={styles.formSubtitle}>
              Enter product name - we'll try to find the image automatically!
            </Text>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                value={productData.name}
                onChangeText={(text) => setProductData({ ...productData, name: text })}
                placeholder="e.g., Coca Cola, Oreo Cookies, etc."
              />
              <Text style={styles.label}>Carbon Emissions (kg CO2) *</Text>
              <TextInput
                style={styles.input}
                value={productData.carbonEmissions}
                onChangeText={(text) => setProductData({ ...productData, carbonEmissions: text })}
                placeholder="e.g., 2.5"
                keyboardType="numeric"
              />
              <Text style={styles.label}>Plastic Usage (g) *</Text>
              <TextInput
                style={styles.input}
                value={productData.plasticUsage}
                onChangeText={(text) => setProductData({ ...productData, plasticUsage: text })}
                placeholder="e.g., 15"
                keyboardType="numeric"
              />
              <Text style={styles.label}>Points (optional)</Text>
              <TextInput
                style={styles.input}
                value={productData.points}
                onChangeText={(text) => setProductData({ ...productData, points: text })}
                placeholder="e.g., 10"
                keyboardType="numeric"
              />
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, creating && styles.disabledButton]}
              onPress={createAutoProduct}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Create Smart Product</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        )}

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