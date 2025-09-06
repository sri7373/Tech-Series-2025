import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colours, spacing, typography } from '../theme';
import { Ionicons } from '@expo/vector-icons';
import NavigationBar from './NavigationBar';

export default function Upload({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'barcode' or 'receipt'
  const [isDragging, setIsDragging] = useState(false);

  // Handle file input and convert to base64
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setImage({ uri: reader.result }); // reader.result is base64 string
    };
    reader.readAsDataURL(file);
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage({ uri: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  // Scan barcode by uploading base64 image as JSON
  const scanProductBarcode = async () => {
    if (!image) {
      alert('No image. Please select an image first.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/products/scan-barcode', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image.uri }),
      });
      const result = await response.json();
      if (result && result.product) {

        if (navigation) {
          navigation.navigate('Recommendations', { product: result.product });
        }

      } else {
        alert(result.error || 'Scan failed. No barcode detected or product not found.');
      }
    } catch (err) {
      alert('Error: Failed to scan barcode. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Scan receipt by uploading base64 image as JSON
  const scanReceipt = async () => {
    if (!image) {
      alert('No image. Please select an image first.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/receipts/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image.uri }),
      });

      const result = await response.json();

      console.log('Receipt scan result:', result);

      if (result && result.items) {
        console.log('Scanned items:', result.items);
        console.log('Total points:', result.totalPoints);
        console.log('Total carbon emissions:', result.carbonEmissions);
        console.log('Total plastic usage:', result.plasticUsage);
        // Save receipt to DB
        const userId = await AsyncStorage.getItem('userId');
        const token = await AsyncStorage.getItem('userToken');
        const itemsWithProductId = result.items.map(item => ({
          ...item,
          productId: item.productId // ensure productId is present if available
        }));
        const receiptPayload = {
          userId,
          items: itemsWithProductId,
          points: result.totalPoints,
          carbonEmissions: result.carbonEmissions,
          plasticUsage: result.plasticUsage,
          uploadedAt: new Date().toISOString()
        };

        console.log('Saving receipt:', receiptPayload);

        await fetch('http://localhost:3000/api/receipts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token
          },
          body: JSON.stringify(receiptPayload)
        });

        // Navigate to ReceiptsPoints screen with items and totalPoints
        if (navigation) {
          navigation.navigate('ReceiptsPoints', {
            items: result.items,
            totalPoints: result.totalPoints,
          });
        }
      } else {
        alert(result.error || 'Scan failed. No items detected.');
      }
    } catch (err) {
      alert('Error: Failed to scan receipt. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <NavigationBar navigation={navigation} />

          <View style={styles.mainContent}>
            <View style={styles.centeredContainer}>
              <View style={styles.card}>
                <Text style={styles.title}>Upload & Scan</Text>
                <Text style={styles.subtitle}>
                  Upload a receipt to earn eco points, or a product barcode to find sustainable alternatives.
                </Text>

                {/* Upload Type Selection */}
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      uploadType === 'barcode' && styles.typeButtonSelected
                    ]}
                    onPress={() => { setUploadType('barcode'); setImage(null); }}
                  >
                    <Ionicons name="barcode-outline" size={24} color={uploadType === 'barcode' ? colours.white : colours.primary} />
                    <Text style={[
                      styles.typeButtonText,
                      uploadType === 'barcode' && styles.typeButtonTextSelected
                    ]}>
                      Barcode
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.typeButton,
                      uploadType === 'receipt' && styles.typeButtonSelected
                    ]}
                    onPress={() => { setUploadType('receipt'); setImage(null); }}
                  >
                    <Ionicons name="receipt-outline" size={24} color={uploadType === 'receipt' ? colours.white : colours.primary} />
                    <Text style={[
                      styles.typeButtonText,
                      uploadType === 'receipt' && styles.typeButtonTextSelected
                    ]}>
                      Receipt
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Drop Zone */}
                {uploadType && (
                  <View style={styles.uploadSection}>
                    <Text style={styles.uploadTitle}>
                      {uploadType === 'barcode' ? 'Upload Barcode' : 'Upload Receipt'}
                    </Text>

                    <View
                      style={[
                        styles.dropZone,
                        isDragging && styles.dropZoneDragging,
                        image && styles.dropZoneHasImage
                      ]}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        style={styles.fileInput}
                        disabled={!uploadType}
                      />

                      {!image ? (
                        <View style={styles.uploadContent}>
                          <Ionicons
                            name={uploadType === 'barcode' ? "barcode" : "receipt"}
                            size={48}
                            color={isDragging ? colours.primary : colours.mediumGray}
                          />
                          <Text style={styles.uploadText}>
                            {isDragging ? 'Drop image here' :
                              uploadType === 'barcode' ? 'Click to upload barcode' :
                                'Click to upload receipt'}
                          </Text>
                          <Text style={styles.uploadSubtext}>
                            or drag and drop
                          </Text>
                        </View>
                      ) : (
                        <View style={styles.previewContainer}>
                          <Image
                            source={{ uri: image.uri }}
                            style={styles.previewImage}
                            resizeMode="contain"
                          />
                          <TouchableOpacity
                            style={styles.removeButton}
                            onPress={() => setImage(null)}
                          >
                            <Ionicons name="close-circle" sizeUp={24} color={colours.error} />
                          </TouchableOpacity>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Scan Button */}
                {uploadType && image && (
                  <TouchableOpacity
                    style={[
                      styles.scanButton,
                      loading && styles.scanButtonDisabled
                    ]}
                    onPress={uploadType === 'barcode' ? scanProductBarcode : scanReceipt}
                    disabled={loading}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color={colours.white} />
                    ) : (
                      <>
                        <Ionicons
                          name={uploadType === 'barcode' ? "scan-outline" : "checkmark-circle-outline"}
                          size={20}
                          color={colours.white}
                        />
                        <Text style={styles.scanButtonText}>
                          {uploadType === 'barcode' ? 'Scan Barcode' : 'Scan Receipt'}
                        </Text>
                      </>
                    )}
                  </TouchableOpacity>
                )}

                {/* Instructions */}
                {uploadType && (
                  <View style={styles.instructions}>
                    <Text style={styles.instructionsTitle}>How it works:</Text>

                    <View style={styles.instructionItem}>
                      <Ionicons name="camera-outline" size={16} color={colours.primary} />
                      <Text style={styles.instructionText}>
                        Take a clear photo of your {uploadType === 'barcode' ? 'product barcode' : 'store receipt'}
                      </Text>
                    </View>

                    <View style={styles.instructionItem}>
                      <Ionicons name="cloud-upload-outline" size={16} color={colours.primary} />
                      <Text style={styles.instructionText}>
                        Upload the image using the drop zone above
                      </Text>
                    </View>

                    <View style={styles.instructionItem}>
                      <Ionicons name="leaf-outline" size={16} color={colours.primary} />
                      <Text style={styles.instructionText}>
                        {uploadType === 'barcode'
                          ? 'Find out better alternatives that are more sustainable'
                          : 'Earn eco points for sustainable purchases'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%'
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.85)'
  },
  container: {
    flex: 1,
    flexDirection: 'row'
  },
  mainContent: {
    flex: 1,
    padding: spacing.lg
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    backgroundColor: colours.white,
    borderRadius: 20,
    padding: spacing.xl,
    width: '100%',
    maxWidth: 500,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colours.primary,
    marginBottom: spacing.xs,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.sizes.base,
    color: colours.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    gap: spacing.md,
  },
  typeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: 12,
    backgroundColor: colours.offWhite,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 120,
    gap: spacing.xs,
  },
  typeButtonSelected: {
    backgroundColor: colours.primaryGreen,
    borderColor: colours.primaryGreen,
  },
  typeButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colours.textPrimary,
  },
  typeButtonTextSelected: {
    color: colours.white,
    fontWeight: typography.weights.bold,
  },
  uploadSection: {
    width: '100%',
    marginBottom: spacing.lg,
  },
  uploadTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colours.textPrimary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  dropZone: {
    width: '100%',
    height: 200,
    backgroundColor: colours.offWhite,
    borderRadius: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colours.borderLight,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',  // ✅ this keeps fileInput aligned
    overflow: 'hidden',
  },

  dropZoneDragging: {
    borderColor: colours.primary,
    backgroundColor: colours.lightGreen + '40',
  },
  dropZoneHasImage: {
    borderColor: colours.primaryGreen,
  },
  fileInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
    zIndex: 10, // <--- force it above the icon/text
  },

  uploadContent: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  uploadText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.medium,
    color: colours.textPrimary,
    marginTop: spacing.md,
    textAlign: 'center',
  },
  uploadSubtext: {
    fontSize: typography.sizes.sm,
    color: colours.textSecondary,
    marginTop: spacing.xs,
  },
  previewContainer: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  previewImage: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
  removeButton: {
    position: 'absolute',
    top: spacing.xs,
    right: spacing.xs,
    backgroundColor: colours.white,
    borderRadius: 20,
    padding: 2,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colours.primaryOrange,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    gap: spacing.sm,
    minWidth: 200,
  },
  scanButtonDisabled: {
    backgroundColor: colours.mediumGray,
  },
  scanButtonText: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colours.white,
  },
  instructions: {
    width: '100%',
    backgroundColor: colours.offWhite,
    borderRadius: 12,
    padding: spacing.md,
  },
  instructionsTitle: {
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.bold,
    color: colours.textPrimary,
    marginBottom: spacing.sm,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.xs,
    gap: spacing.sm,
  },
  instructionText: {
    fontSize: typography.sizes.sm,
    color: colours.textSecondary,
    flex: 1,
  },
});