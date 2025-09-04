import React, { useState } from 'react';

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
        const productInfo = `Product Found\nName: ${result.product.name}\nCO2: ${result.product.carbonEmissions}\nPlastic: ${result.product.plasticUsage}\nPoints: ${result.product.points}`;
        
        if (window.confirm(`${productInfo}\n\nWould you like to see sustainable alternatives?`)) {
          // Navigate to recommendations screen
          if (navigation) {
            navigation.navigate('Recommendations', { product: result.product });
          }
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

    // console.log('Uploading receipt image for scanning...');
    // console.log(image.uri);

    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/receipts/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: image.uri }),
      });

      const result = await response.json();
      if (result && result.items) {
        // Navigate to ReceiptsPoints screen with items and totalPoints
        
        if (navigation) {
          navigation.navigate('ReceiptsPoints', {
            items: result.items,
            totalPoints: result.totalPoints
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

      {/* Choose Upload Type */}
      {!uploadType && (
        <div style={{ display: 'flex', gap: 20, marginTop: 40 }}>
          <button style={styles.confirmButton} onClick={() => setUploadType('barcode')}>Upload Barcode</button>
          <button style={styles.confirmButton} onClick={() => setUploadType('receipt')}>Upload Receipt</button>
        </div>
      )}

      {/* Upload Box / Preview */}
      {uploadType && (
        <div style={styles.uploadBox}>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            style={{ width: '100%', height: '100%', opacity: 0, position: 'absolute', left: 0, top: 0, cursor: 'pointer' }}
          />
          {!image ? (
            <span style={styles.uploadText}>
              {uploadType === 'barcode' ? '📷 Upload Barcode Image' : '🧾 Upload Receipt Image'}
            </span>
          ) : (
            <img src={image.uri} alt="preview" style={styles.preview} />
          )}
        </div>
      )}

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

      {/* Back to type selection */}
      {uploadType && (
        <button style={{ ...styles.returnButton, top: 90, left: 20 }} onClick={() => { setUploadType(null); setImage(null); }}>
          ← Back
        </button>
      )}
    </div>
  );
}

// ...styles unchanged, but converted to JS objects for web...
const styles = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    background: '#000',
    position: 'relative',
  },
  uploadBox: {
    width: 250,
    height: 250,
    background: '#fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 80,
    display: 'flex',
    position: 'relative',
    overflow: 'hidden',
  },
  uploadText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#007AFF',
    zIndex: 1,
  },
  preview: {
    width: 220,
    height: 220,
    borderRadius: 15,
    objectFit: 'cover',
    zIndex: 1,
  },
  confirmButton: {
    marginTop: 30,
    background: '#28a745',
    padding: '12px 30px',
    borderRadius: 10,
    color: '#fff',
    fontSize: 18,
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
  },
  returnButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    background: '#fff',
    padding: '6px 14px',
    borderRadius: 8,
    fontWeight: 'bold',
    fontSize: 16,
    color: '#007AFF',
    border: 'none',
    cursor: 'pointer',
    zIndex: 2,
  },
};