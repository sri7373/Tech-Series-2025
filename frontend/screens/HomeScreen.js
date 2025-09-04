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
  FlatList 
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';

export default function HomeScreen({ navigation }) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [productData, setProductData] = useState({
    name: '',
    carbonEmissions: '',
    plasticUsage: '',
    points: ''
  });
  const [products, setProducts] = useState([]);
  const [showForm, setShowForm] = useState(false);

  // Load products when component mounts
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/products');
      const data = await response.json();
      
      if (response.ok) {
        setProducts(data);
      } else {
        console.error('Failed to fetch products:', data.error);
      }
    } catch (error) {
      console.error('Fetch products error:', error);
    }
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission required", "You need to allow access to your photos!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const uploadProduct = async () => {
    // Validate inputs
    if (!selectedImage) {
      Alert.alert("No image", "Please select a product image!");
      return;
    }
    
    if (!productData.name || !productData.carbonEmissions || !productData.plasticUsage) {
      Alert.alert("Missing fields", "Please fill in all required fields!");
      return;
    }

    const formData = new FormData();
    formData.append('image', {
      uri: selectedImage,
      type: 'image/jpeg',
      name: 'product.jpg',
    });
    formData.append('name', productData.name);
    formData.append('carbonEmissions', productData.carbonEmissions);
    formData.append('plasticUsage', productData.plasticUsage);
    formData.append('points', productData.points || '0');

    try {
      const response = await fetch('http://localhost:3000/api/upload/product', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const result = await response.json();
      
      if (response.ok) {
        Alert.alert("Success", `Product "${result.product.name}" created successfully!`);
        // Reset form
        setSelectedImage(null);
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
        Alert.alert("Error", result.error || "Product upload failed");
      }
    } catch (error) {
      console.error('Upload error:', error);
      Alert.alert("Error", "Network error occurred");
    }
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      {item.imageUrl && (
        <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
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
      <Text style={styles.title}>Manual Products</Text>
      
      <View style={styles.navigationContainer}>
        <TouchableOpacity 
          style={styles.navButton} 
          onPress={() => navigation.navigate('Auto')}
        >
          <Text style={styles.navButtonText}>🤖 Try Smart Products</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => setShowForm(!showForm)}
      >
        <Text style={styles.buttonText}>
          {showForm ? 'Cancel' : 'Add Manual Product'}
        </Text>
      </TouchableOpacity>

      {showForm && (
        <ScrollView style={styles.formContainer}>
          <Text style={styles.formTitle}>Create New Product</Text>
          
          {/* Product Image */}
          <TouchableOpacity style={styles.imagePickerButton} onPress={pickImage}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.selectedImage} />
            ) : (
              <Text style={styles.imagePickerText}>Tap to select product image</Text>
            )}
          </TouchableOpacity>

          {/* Product Form */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
              style={styles.input}
              value={productData.name}
              onChangeText={(text) => setProductData({...productData, name: text})}
              placeholder="Enter product name"
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

          <TouchableOpacity style={styles.uploadButton} onPress={uploadProduct}>
            <Text style={styles.buttonText}>Create Product</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Products List */}
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item._id}
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
    marginBottom: 20,
    textAlign: 'center',
    marginTop: 20,
  },
  navigationContainer: {
    marginBottom: 15,
  },
  navButton: {
    backgroundColor: '#FF6B35',
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
    backgroundColor: '#007AFF',
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
    marginBottom: 15,
    textAlign: 'center',
  },
  imagePickerButton: {
    backgroundColor: '#e0e0e0',
    borderRadius: 8,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    borderWidth: 2,
    borderColor: '#ccc',
    borderStyle: 'dashed',
  },
  imagePickerText: {
    fontSize: 14,
    color: '#666',
  },
  selectedImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
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
