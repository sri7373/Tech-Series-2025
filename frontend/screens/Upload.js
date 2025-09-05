import React, { useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage'; // add if not present
import { colours, spacing, typography } from '../theme';

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
    <div style={styles.container}>
      {/* Return Button */}
      <button
        style={styles.returnButton}
        onClick={() => navigation && navigation.navigate('Home')}
      >
        ← Home
      </button>

      {/* Upload Type Selection */}
      <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
        <button
          style={{
            ...styles.confirmButton,
            background: uploadType === 'barcode' ? colours.secondary : colours.primary,
            color: uploadType === 'barcode' ? colours.surface : colours.surface,
            border: uploadType === 'barcode' ? `2px solid ${colours.secondary}` : 'none'
          }}
          onClick={() => { setUploadType('barcode'); setImage(null); }}
        >
          Upload Barcode
        </button>
        <button
          style={{
            ...styles.confirmButton,
            background: uploadType === 'receipt' ? colours.secondary : colours.primary,
            color: uploadType === 'receipt' ? colours.surface : colours.surface,
            border: uploadType === 'receipt' ? `2px solid ${colours.secondary}` : 'none'
          }}
          onClick={() => { setUploadType('receipt'); setImage(null); }}
        >
          Upload Receipt
        </button>
      </div>

      {/* Upload Box / Preview (always visible) */}
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

      {/* Confirm Button */}
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
  );
}

// ...existing styles...
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: colours.background, // was '#000'
    position: 'relative',
  },
  uploadBox: {
    width: 250,
    height: 250,
    background: colours.surface,
    borderRadius: spacing.lg,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
  },
  uploadText: {
    fontSize: typography.body,
    fontWeight: 'bold',
    textAlign: 'center',
    color: colours.primary,
    zIndex: 1,
  },
  preview: {
    width: 220,
    height: 220,
    borderRadius: spacing.md,
    objectFit: 'cover',
    zIndex: 1,
  },
  confirmButton: {
    marginTop: spacing.lg,
    background: colours.primary,
    padding: `${spacing.md}px 30px`,
    borderRadius: spacing.md,
    color: colours.surface,
    fontSize: typography.button,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  },
  returnButton: {
    position: 'absolute',
    top: spacing.xl,
    left: spacing.md,
    background: colours.surface,
    padding: `${spacing.xs}px 14px`,
    borderRadius: spacing.md,
    fontWeight: 'bold',
    fontSize: typography.button,
    color: colours.primary,
    border: 'none',
    cursor: 'pointer',
    zIndex: 2,
  },
};