import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';

export default function Upload({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  // Choose between product barcode scan and receipt scan
  const [scanType, setScanType] = useState(null); // 'product' or 'receipt'

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission denied', 'Please allow access to your gallery.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

  // Helper to convert image URI to FormData for upload
  const getFormData = (uri) => {
    const filename = uri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    const formData = new FormData();
    formData.append('image', {
      uri,
      name: filename,
      type,
    });
    return formData;
  };

  // Scan product barcode
  const scanProductBarcode = async () => {
    if (!image) {
      Alert.alert('No image', 'Please select an image first.');
      return;
    }
    setLoading(true);
    try {
      const formData = getFormData(image);
      const response = await fetch('http://localhost:3000/api/products/scan-barcode', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.json();
      if (response.ok && result.product) {
        Alert.alert(
          'Product Found',
          `Name: ${result.product.name}\nCO2: ${result.product.carbonEmissions}\nPlastic: ${result.product.plasticUsage}\nPoints: ${result.product.points}`
        );
      } else {
        Alert.alert('Scan Failed', result.error || 'No barcode detected or product not found. Please try again with a clearer image or different product.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to scan barcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Scan receipt
  const scanReceipt = async () => {
    if (!image) {
      Alert.alert('No image', 'Please select an image first.');
      return;
    }
    setLoading(true);
    try {
      const formData = getFormData(image);
      const response = await fetch('http://localhost:3000/api/receipts/scan', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      const result = await response.json();
      if (response.ok && result.items && result.items.length > 0) {
        Alert.alert(
          'Receipt Scan',
          `Matched Items: ${result.items.map(i => i.name).join(', ')}\nTotal Points: ${result.totalPoints}`
        );
      } else {
        Alert.alert('Scan Failed', result.error || 'No items detected or matched. Please try again with a clearer receipt image.');
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to scan receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const confirmImage = () => {
    if (!image) {
      Alert.alert('No image', 'Please select an image first.');
      return;
    }
    if (!scanType) {
      Alert.alert('Select Scan Type', 'Please choose Product Barcode or Receipt Scan.');
      return;
    }
    if (scanType === 'product') {
      scanProductBarcode();
    } else if (scanType === 'receipt') {
      scanReceipt();
    }
  };

  return (
    <View style={styles.container}>
      {/* Return Button */}
      <TouchableOpacity
        style={styles.returnButton}
        onPress={() => navigation.navigate('Home')}
      >
        <Text style={styles.returnButtonText}>← Home</Text>
      </TouchableOpacity>

      {/* Blur Background */}
      <BlurView intensity={70} tint="dark" style={StyleSheet.absoluteFill} />

      {/* Upload Box / Preview */}
      <TouchableOpacity style={styles.uploadBox} onPress={pickImage}>
        {!image ? (
          <Text style={styles.uploadText}>📷 Upload Image Here</Text>
        ) : (
          <Image source={{ uri: image }} style={styles.preview} />
        )}
      </TouchableOpacity>

      {/* Scan Type Selection */}
      <View style={styles.scanTypeContainer}>
        <TouchableOpacity
          style={[
            styles.scanTypeButton,
            scanType === 'product' && styles.scanTypeSelected,
          ]}
          onPress={() => setScanType('product')}
        >
          <Text style={[
            styles.scanTypeText,
            scanType === 'product' && styles.scanTypeTextSelected,
          ]}>
            Product Barcode
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.scanTypeButton,
            scanType === 'receipt' && styles.scanTypeSelected,
          ]}
          onPress={() => setScanType('receipt')}
        >
          <Text style={[
            styles.scanTypeText,
            scanType === 'receipt' && styles.scanTypeTextSelected,
          ]}>
            Receipt Scan
          </Text>
        </TouchableOpacity>
      </View>


      {/* Confirm Button */}
      {image && (
        <TouchableOpacity style={styles.confirmButton} onPress={confirmImage} disabled={loading}>
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.confirmText}>✅ Confirm</Text>
          )}
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    backgroundColor: '#000', // fallback behind blur
  },
  uploadBox: {
    width: 250,
    height: 250,
    backgroundColor: '#ffffffff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
  },
  preview: {
    width: 220,
    height: 220,
    borderRadius: 15,
  },
  scanTypeContainer: {
    flexDirection: 'row',
    marginTop: 20,
    marginBottom: 10,
    zIndex: 1,
  },
  scanTypeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
    marginHorizontal: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  scanTypeSelected: {
    backgroundColor: '#007AFF', // Invert button color when selected
    borderColor: '#007AFF',
  },
  scanTypeText: {
    color: '#007AFF',
    fontWeight: 'bold',
  },
  scanTypeTextSelected: {
    color: '#fff', // Invert font color when selected
  },
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
    zIndex: 1,
  },
  confirmText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  returnButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 2,
    backgroundColor: '#fff',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 2,
  },
  returnButtonText: {
    color: '#007AFF',
    fontWeight: 'bold',
    fontSize: 16,
  },
});