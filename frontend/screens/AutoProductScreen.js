import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Alert, 
  TextInput, 
  ScrollView,
  FlatList,
  ActivityIndicator 
} from 'react-native';

export default function AutoProductScreen({ navigation }) {
  const [productData, setProductData] = useState({
    name: '',
    carbonEmissions: '',
    plasticUsage: '',
    points: ''
  });
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/upload/products');
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data.products);
      } else {
        console.error('Failed to fetch products:', data.error);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  };

  const createAutoProduct = async () => {
    // Validate inputs
    if (!productData.name || !productData.carbonEmissions || !productData.plasticUsage) {
      Alert.alert("Missing fields", "Please fill in all required fields!");
      return;
    }

    setLoading(true);

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
        
        // Reset form
        setProductData({
          name: '',
          carbonEmissions: '',
          plasticUsage: '',
          points: ''
        });
        setShowForm(false);
        
        // Refresh products list
        fetchProducts();
      } else {
        Alert.alert("Error", result.error || "Product creation failed");
      }
    } catch (error) {
      console.error('Creation error:', error);
      Alert.alert("Error", "Network error occurred");
    } finally {
      setLoading(false);
    }
  };

  const renderProduct = ({ item }) => (
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
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Smart Products</Text>
      <Text style={styles.subtitle}>Images auto-fetched from Open Food Facts</Text>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Home')}
        >
          <Text style={styles.navButtonText}>📱 Try Manual Products</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.buttonText}>
          {showForm ? 'Cancel' : 'Add Smart Product'}
        </Text>
      </TouchableOpacity>

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
              onChangeText={(text) => setProductData({...productData, name: text})}
              placeholder="e.g., Coca Cola, Oreo Cookies, etc."
            />

            <Text style={styles.label}>Carbon Emissions (kg CO2) *</Text>
            <TextInput
              style={styles.input}
              value={productData.carbonEmissions}
              onChangeText={(text) => setProductData({...productData, carbonEmissions: text})}
              placeholder="e.g., 2.5"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Plastic Usage (g) *</Text>
            <TextInput
              style={styles.input}
              value={productData.plasticUsage}
              onChangeText={(text) => setProductData({...productData, plasticUsage: text})}
              placeholder="e.g., 15"
              keyboardType="numeric"
            />

            <Text style={styles.label}>Points (optional)</Text>
            <TextInput
              style={styles.input}
              value={productData.points}
              onChangeText={(text) => setProductData({...productData, points: text})}
              placeholder="e.g., 10"
              keyboardType="numeric"
            />
          </View>

          <TouchableOpacity 
            style={[styles.uploadButton, loading && styles.disabledButton]} 
            onPress={createAutoProduct}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Create Smart Product</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        style={styles.productsList}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
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
  navigationContainer: {
    marginBottom: 15,
  },
  navButton: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  navButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#FF6B35',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
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
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  productsList: {
    flex: 1,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
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
