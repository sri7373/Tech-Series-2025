// screens/Upload.js
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { BlurView } from 'expo-blur';

export default function Upload({ navigation }) {
  const [image, setImage] = useState(null);

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

  const confirmImage = () => {
    if (!image) {
      Alert.alert('No image', 'Please select an image first.');
      return;
    }
    navigation.navigate('Points'); // Navigate to PointsPage
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

      {/* Confirm Button */}
      {image && (
        <TouchableOpacity style={styles.confirmButton} onPress={confirmImage}>
          <Text style={styles.confirmText}>✅ Confirm</Text>
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
  confirmButton: {
    marginTop: 20,
    backgroundColor: '#28a745',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
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
