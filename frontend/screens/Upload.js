import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // add if not present
import { colours, spacing, typography } from '../theme';
import { ImageBackground } from 'react-native';

export default function Upload({ navigation }) {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadType, setUploadType] = useState(null); // 'barcode' or 'receipt'

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
      style={{ flex: 1, width: '100%', height: '100%' }}
      resizeMode="cover"
    >
      <div style={styles.overlay}>
        <div style={styles.appTitleContainer}>
          <span style={styles.appTitle}>ECOmmerce</span>
        </div>
        <div style={styles.card}>
          <div style={styles.buttonRow}>
            <button
              style={{
                ...styles.confirmButton,
                ...(uploadType === 'barcode' ? styles.selectedButton : {}),
              }}
              onClick={() => { setUploadType('barcode'); setImage(null); }}
            >
              Upload Barcode
            </button>
            <button
              style={{
                ...styles.confirmButton,
                ...(uploadType === 'receipt' ? styles.selectedButton : {}),
              }}
              onClick={() => { setUploadType('receipt'); setImage(null); }}
            >
              Upload Receipt
            </button>
          </div>
          <div style={styles.uploadBox}>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              style={{ width: '100%', height: '100%', opacity: 0, position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
              disabled={!uploadType}
            />
            {!image ? (
              <span style={styles.uploadText}>
                {uploadType === 'barcode'
                  ? '📷 Upload Barcode Image'
                  : uploadType === 'receipt'
                    ? '🧾 Upload Receipt Image'
                    : 'Select upload type'}
              </span>
            ) : (
              <img src={image.uri} alt="preview" style={styles.preview} />
            )}
          </div>
          {uploadType && image && (
            <button
              style={styles.confirmButton}
              onClick={uploadType === 'barcode' ? scanProductBarcode : scanReceipt}
              disabled={loading}
            >
              {loading
                ? (uploadType === 'barcode' ? 'Scanning Barcode...' : 'Scanning Receipt...')
                : (uploadType === 'barcode' ? '✅ Scan Barcode' : '✅ Scan Receipt')}
            </button>
          )}
        </div>
        <button
          style={styles.returnButton}
          onClick={() => navigation && navigation.navigate('Home')}
        >
          ← Home
        </button>
      </div>
    </ImageBackground>
  );
}

const styles = {
  overlay: {
    width: '100%',
    minHeight: '100vh',
    background: 'rgba(232,245,233,0.5)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    position: 'relative',
  },
  appTitleContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
    display: 'flex',
    justifyContent: 'center',
  },
  appTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: colours.primary,
    textAlign: 'center',
    letterSpacing: 1,
  },
  card: {
    background: colours.surface,
    borderRadius: spacing.lg,
    boxShadow: `0 4px 24px ${colours.shadow}`,
    padding: spacing.xl,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    minWidth: 340,
    maxWidth: 400,
    margin: 'auto',
  },
  uploadBox: {
    width: 220,
    height: 220,
    background: colours.inputBackground,
    borderRadius: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.lg,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
    border: `1.5px solid ${colours.border}`,
    boxShadow: `0 2px 8px ${colours.shadow}`,
  },
  uploadText: {
    fontSize: typography.body,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colours.primary,
    zIndex: 1,
  },
  preview: {
    width: 190,
    height: 190,
    borderRadius: spacing.md,
    objectFit: 'cover',
    zIndex: 1,
    boxShadow: `0 2px 8px ${colours.shadow}`,
  },
  buttonRow: {
    display: 'flex',
    gap: 16,
    marginBottom: spacing.md,
    marginTop: spacing.md,
    width: '100%',
    justifyContent: 'center',
  },
  confirmButton: {
    background: colours.primary,
    padding: `${spacing.sm}px ${spacing.lg}px`,
    borderRadius: spacing.md,
    color: colours.surface,
    fontSize: typography.button,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'background 0.2s',
    minWidth: 140,
  },
  selectedButton: {
    background: colours.secondary,
    border: `2px solid ${colours.secondary}`,
    color: colours.surface,
  },
  returnButton: {
    position: 'absolute',
    top: spacing.lg,
    left: spacing.lg,
    background: colours.surface,
    padding: `${spacing.xs}px 14px`,
    borderRadius: spacing.md,
    fontWeight: 'bold',
    fontSize: typography.button,
    color: colours.primary,
    border: 'none',
    cursor: 'pointer',
    zIndex: 2,
    boxShadow: `0 2px 8px ${colours.shadow}`,
  },
};