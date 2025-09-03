import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const PRODUCTS = [
  { id: '1', name: 'Product A', rating: 4.5, price: '$10', greenScore: 80 },
  { id: '2', name: 'Product B', rating: 3.8, price: '$15', greenScore: 70 },
  { id: '3', name: 'Product C', rating: 5, price: '$20', greenScore: 90 },
  { id: '4', name: 'Product D', rating: 4, price: '$12', greenScore: 75 },
];

export default function HomeScreen({ navigation }) {
  const [searchText, setSearchText] = useState('');
  const [filteredProducts, setFilteredProducts] = useState(PRODUCTS);

  useEffect(() => {
    const filtered = PRODUCTS.filter((product) =>
      product.name.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredProducts(filtered);
  }, [searchText]);

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

        <TouchableOpacity
          style={[styles.navItem, { marginBottom: 20 }]}
          onPress={() => navigation.replace('Login')}
        >
          <Ionicons name="log-out-outline" size={28} color="#FF3B30" />
          <Text style={[styles.navText, { color: '#FF3B30' }]}>Logout</Text>
        </TouchableOpacity>
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
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.productCard}
              onPress={() => Alert.alert(`Clicked ${item.name}`)}
            >
              <View style={styles.productImagePlaceholder}>
                <Text>Image</Text>
              </View>
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text>Rating: {item.rating} ⭐</Text>
                <Text>Price: {item.price}</Text>
                <Text>Green Score: {item.greenScore}</Text>
              </View>
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
});
