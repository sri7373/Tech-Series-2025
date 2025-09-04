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
} from 'react-native';
import { getSustainableAlternatives } from '../services/api';

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
      
      const response = await getSustainableAlternatives(product._id || product.id, 5);
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

  const ProductCard = ({ product, isOriginal = false, improvement = null }) => (
    <View style={[styles.productCard, isOriginal && styles.originalCard]}>
      {isOriginal && (
        <View style={styles.originalBadge}>
          <Text style={styles.originalBadgeText}>Your Product</Text>
        </View>
      )}
      
      {!isOriginal && improvement && (
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

        {!isOriginal && improvement && (
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

        <View style={[styles.sustainabilityBar, isOriginal && styles.originalBar]}>
          <View 
            style={[
              styles.sustainabilityFill, 
              { 
                width: `${Math.min(100, product.points)}%`,
                backgroundColor: isOriginal ? '#FF9800' : '#4CAF50'
              }
            ]} 
          />
          <Text style={styles.sustainabilityText}>
            Sustainability: {product.points}/100
          </Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Finding sustainable alternatives...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
        <Text style={styles.sectionTitle}>Your Scanned Product</Text>
        <ProductCard product={originalProduct || product} isOriginal={true} />

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
  );
}

const styles = StyleSheet.create({
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
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    resizeMode: 'contain',
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
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
