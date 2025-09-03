import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import LogoutButton from './LogoutButton';
import { ActivityIndicator } from 'react-native';
import { Image } from 'react-native';


export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [products, setProducts] = useState([]); // <-- dynamic data
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch products from API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('https://sri2025backend.loca.lt/api/upload/products');
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API error:', response.status, errorText);
          Alert.alert('Error', 'Failed to load products');
          setLoading(false);
          return;
        }
        const data = await response.json();
        console.log('fetched data:', data);
        // Adjust this line if your API returns { products: [...] }
        setProducts(Array.isArray(data) ? data : data.products || []);
        setFilteredProducts(Array.isArray(data) ? data : data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
        Alert.alert('Error', 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const filtered = products.filter((product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchText]);

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

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => navigation.navigate('Upload')}
        >
          <Ionicons name="camera" size={28} color="#555" />
          <Text style={styles.navText}>Upload</Text>
        </TouchableOpacity>

        {/* Push logout to bottom */}
        <View style={{ flex: 1 }} />
        <LogoutButton navigation={navigation} />
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
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
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          numColumns={5} // 5 columns for grid
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCardGrid}
              onPress={() => Alert.alert(`Clicked ${item.name}`)}
            >
              {/* <Text style={styles.productId}>{item.id}</Text> */}
              <View style={styles.productImagePlaceholderGrid}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.productImageGrid} />
                ) : (
                  <Text>Image</Text>
                )}
              </View>
              <Text style={styles.productNameGrid}>{item.name}</Text>
              <Text style={styles.productInfoGrid}>Carbon: {item.carbonEmissions}</Text>
              <Text style={styles.productInfoGrid}>Plastic: {item.plasticUsage}</Text>
              <Text style={styles.productInfoGrid}>Points: {item.points}</Text>
            </TouchableOpacity>
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
  topBar: { flexDirection: 'row', marginBottom: 20, alignItems: 'center' },
  searchInput: { flex: 1, height: 40, borderWidth: 1, borderColor: '#aaa', borderRadius: 8, paddingHorizontal: 10 },
  filterButton: { marginLeft: 10, backgroundColor: '#007AFF', padding: 10, borderRadius: 8 },

  productCard: { flexDirection: 'row', backgroundColor: '#fff', padding: 10, borderRadius: 8, marginBottom: 15, alignItems: 'center' },
  productImagePlaceholder: { width: 60, height: 60, backgroundColor: '#ddd', justifyContent: 'center', alignItems: 'center', borderRadius: 8, marginRight: 15 },
  productInfo: { flex: 1 },
  productName: { fontWeight: 'bold', fontSize: 16, marginBottom: 5 },

  productCardGrid: {
    flex: 1,
    margin: 5,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 5,
    alignItems: 'center',
    position: 'relative', // for positioning the tiny ID
  },

  productId: {
    position: 'absolute',
    top: 2,
    right: 4,
    fontSize: 8,
    color: '#999',
  },

  productImagePlaceholderGrid: {
    width: 60, // fixed width
    height: 60, // fixed height
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 5,
  },

  productImageGrid: {
    width: 60, // fixed width
    height: 60, // fixed height
    borderRadius: 8,
  },

  productNameGrid: {
    fontWeight: 'bold',
    fontSize: 12,
    textAlign: 'center',
  },

  productInfoGrid: {
    fontSize: 10,
    color: '#555',
    textAlign: 'center',
  },


});
