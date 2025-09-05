import React, { useState, useEffect } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ImageBackground,
} from 'react-native';
import { getSustainableAlternativesForProduct } from '../services/api';

export default function RecommendationsScreen({ route, navigation }) {
  const { product } = route.params; // The scanned product passed from barcode scan
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalProduct, setOriginalProduct] = useState(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      console.log('Loading recommendations for product:', product);

      const response = await getSustainableAlternativesForProduct(product, 5);
      console.log('Recommendations response:', response);

      if (response.success) {
        setOriginalProduct(response.original);
        setAlternatives(response.alternatives);
      } else {
        Alert.alert('Error', 'Failed to load recommendations');
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
      Alert.alert('Error', 'Failed to load recommendations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const MainProductCard = ({ product }) => {
    // Fun fact: convert CO2 g to approximate car distance in km
    const funFact = () => {
      // Average car emits ~120 g CO2 per km
      const distanceKm = (product.carbonEmissions / 120).toFixed(1);
      return `💡 This product produces as much CO2 as driving ${distanceKm} km by car!`;
    };

    return (
      <View style={styles.mainProductCardRow}>
        {/* Product Image */}
        {product.imageUrl && (
          <Image source={{ uri: product.imageUrl }} style={styles.mainProductImageRow} />
        )}

        {/* Product Info */}
        <View style={styles.mainProductInfoRow}>
          <Text style={styles.mainProductTitle}>{product.name} 🌟</Text>
          <Text style={styles.productPrice}>${product.price}</Text>

          <View style={styles.statsColumn}>
            <Text style={styles.statText}>🌍 CO2: {product.carbonEmissions} g</Text>
            <Text style={styles.statText}>♻️ Plastic: {product.plasticUsage} g</Text>
            <Text style={styles.statText}>EcoScore: {product.sustainabilityScore}/100</Text>
            <Text style={styles.statText}>Points: {product.points}</Text>
          </View>

          {/* Sustainability Bar */}
          <View style={styles.sustainabilityBarMain}>
            <View
              style={[
                styles.sustainabilityFillMain,
                { width: `${Math.min(100, product.sustainabilityScore)}%` },
              ]}
            />
            <Text style={styles.sustainabilityTextMain}>
              Sustainability: {product.sustainabilityScore}/100
            </Text>
          </View>

          {/* Fun Fact */}
          <Text style={styles.funFactText}>{funFact()}</Text>
        </View>
      </View>
    );
  };



  const ProductCard = ({ product, improvement = null }) => (
    <View style={styles.productCard}>
      {improvement && (
        <View style={styles.improvementBadge}>
          <Text style={styles.improvementText}>
            +{improvement.scoreImprovement} pts better!
          </Text>
        </View>
      )}

      {product.imageUrl && (
        <Image source={{ uri: product.imageUrl }} style={styles.productImage} />
      )}

      <View style={styles.productInfo}>
        <Text style={styles.productName}>{product.name}</Text>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>CO2</Text>
            <Text style={styles.statValue}>{product.carbonEmissions}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Plastic</Text>
            <Text style={styles.statValue}>{product.plasticUsage}</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statLabel}>Points</Text>
            <Text style={[styles.statValue, styles.pointsValue]}>{product.points}</Text>
          </View>
        </View>

        {improvement && (
          <View style={styles.improvementDetails}>
            <Text style={styles.improvementTitle}>Environmental Benefits:</Text>
            {improvement.carbonReduction > 0 && (
              <Text style={styles.benefitText}>
                🌍 -{improvement.carbonReduction} CO2 emissions
              </Text>
            )}
            {improvement.plasticReduction > 0 && (
              <Text style={styles.benefitText}>
                ♻️ -{improvement.plasticReduction} plastic usage
              </Text>
            )}
          </View>
        )}

        <View style={styles.sustainabilityBar}>
          <View
            style={[
              styles.sustainabilityFill,
              { width: `${Math.min(100, product.sustainabilityScore)}%`, backgroundColor: '#4CAF50' },
            ]}
          />
          <Text style={styles.sustainabilityText}>
            Sustainability: {product.sustainabilityScore}/100
          </Text>
        </View>
      </View>
    </View>
  );


  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/leafy.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Finding sustainable alternatives...</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sustainable Alternatives</Text>
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Current Product */}
          <Text style={styles.sectionTitle}>Your Product</Text>
          <MainProductCard product={originalProduct || product} isOriginal={true} />

          {/* Alternatives */}
          {alternatives.length > 0 ? (
            <>
              <Text style={styles.sectionTitle}>
                Better Alternatives ({alternatives.length} found)
              </Text>
              {alternatives.map((alternative, index) => (
                <ProductCard
                  key={alternative._id || index}
                  product={alternative}
                  improvement={alternative.improvement}
                />
              ))}
            </>
          ) : (
            <View style={styles.noAlternativesContainer}>
              <Text style={styles.noAlternativesTitle}>Great Choice! 🌟</Text>
              <Text style={styles.noAlternativesText}>
                This product is already one of the most sustainable options in its category.
              </Text>
            </View>
          )}

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Sustainability Tips</Text>
            <Text style={styles.tipText}>• Look for products with lower CO2 emissions</Text>
            <Text style={styles.tipText}>• Choose items with minimal plastic packaging</Text>
            <Text style={styles.tipText}>• Higher points = more environmentally friendly</Text>
          </View>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(232,245,233,0.5)', // semi-transparent overlay
  },

  // ===== Main Product (Clicked Product) =====
  mainProductCardRow: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginVertical: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  mainProductImageRow: {
    width: 180,       // increased from 120
    height: 180,      // increased from 120
    borderRadius: 12,
    marginRight: 16,
    resizeMode: 'cover',
  },


  mainProductInfoRow: {
    flex: 1,
    justifyContent: 'flex-start',
  },

  mainProductTitle: {
    fontSize: 26,         // bigger title
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },

  productPrice: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FF5722',
    marginBottom: 12,
  },

  statsColumn: {
    marginBottom: 12,
  },

  statText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },

  sustainabilityBarMain: {
    height: 28,
    backgroundColor: '#e0e0e0',
    borderRadius: 14,
    overflow: 'hidden',
    marginTop: 8,
    justifyContent: 'center',
    position: 'relative',
  },

  sustainabilityFillMain: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 14,
  },

  sustainabilityTextMain: {
    position: 'absolute',
    width: '100%',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    zIndex: 1,
  },

  funFactText: {
    marginTop: 12,
    fontSize: 14,
    fontStyle: 'italic',
    color: '#555',
  },

  // ===== General Container =====
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },

  // ===== Header =====
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    marginRight: 16,
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  scrollContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 24,
    marginBottom: 16,
  },

  // ===== Alternative Product Cards =====
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  originalCard: {
    borderWidth: 2,
    borderColor: '#FF9800',
  },
  originalBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#FF9800',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  originalBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  improvementBadge: {
    position: 'absolute',
    top: -8,
    right: 12,
    backgroundColor: '#4CAF50',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 1,
  },
  improvementText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productImage: {
    width: 180,       // increased from 120
    height: 180,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  pointsValue: {
    color: '#4CAF50',
  },
  improvementDetails: {
    backgroundColor: '#f0f8f0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  improvementTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
    marginBottom: 6,
  },
  benefitText: {
    fontSize: 13,
    color: '#2E7D32',
    marginBottom: 2,
  },
  sustainabilityBar: {
    height: 24,
    backgroundColor: '#e0e0e0',
    borderRadius: 12,
    overflow: 'hidden',
    justifyContent: 'center',
    position: 'relative',
  },
  originalBar: {
    backgroundColor: '#FFF3E0',
  },
  sustainabilityFill: {
    position: 'absolute',
    left: 0,
    top: 0,
    height: '100%',
    borderRadius: 12,
  },
  sustainabilityText: {
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    zIndex: 1,
  },

  // ===== No Alternatives =====
  noAlternativesContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginTop: 16,
  },
  noAlternativesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginBottom: 8,
  },
  noAlternativesText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },

  // ===== Tips =====
  tipsContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 24,
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 6,
    lineHeight: 20,
  },
});