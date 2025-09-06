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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getSustainableAlternativesForProduct } from '../services/api';
import { colours, spacing, typography } from '../theme';
import ProductCard from './ProductCard';

export default function RecommendationsScreen({ route, navigation }) {
  const { product } = route.params;
  const [alternatives, setAlternatives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [originalProduct, setOriginalProduct] = useState(null);
  const [numColumns, setNumColumns] = useState(2);

  useEffect(() => {
    loadRecommendations(product);
    calculateColumns();
  }, [product]);

  const calculateColumns = () => {
    const screenWidth = Dimensions.get('window').width;
    const cardWidth = 320; // Reduced card width for more columns
    const containerPadding = spacing.lg * 2;
    const availableWidth = screenWidth - containerPadding;
    const calculatedColumns = Math.floor(availableWidth / cardWidth);
    setNumColumns(Math.max(2, calculatedColumns));
  };

  const loadRecommendations = async () => {
    try {
      setLoading(true);
      const response = await getSustainableAlternativesForProduct(product, 5);

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

  // Get score color function (same as in ProductCard)
  const getScoreColor = (score) => {
    if (score >= 80) return colours.success;
    if (score >= 50) return colours.primaryGreen;
    if (score >= 30) return colours.primaryOrange;
    return colours.error;
  };

  const MainProductCard = ({ product }) => {
    const scoreColor = getScoreColor(product.sustainabilityScore);

    // Fun fact: convert CO2 g to approximate car distance in km
    const funFact = () => {
      const distanceKm = (product.carbonEmissions / 120).toFixed(1);
      return `💡 This product produces as much CO₂ as driving ${distanceKm} km by car!`;
    };

    return (
      <View style={styles.mainProductCard}>
        {/* Product Image on Left */}
        <View style={styles.imageColumn}>
          {product.imageUrl ? (
            <Image source={{ uri: product.imageUrl }} style={styles.mainProductImage} />
          ) : (
            <View style={styles.noImagePlaceholder}>
              <Ionicons name="image-outline" size={48} color={colours.mediumGray} />
              <Text style={styles.noImageText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Product Info on Right */}
        <View style={styles.infoColumn}>
          <Text style={styles.mainProductTitle}>{product.name}</Text>
          <Text style={styles.productPrice}>${product.price}</Text>

          {/* Eco Stats */}
          <View style={styles.ecoStats}>
            <View style={styles.ecoStat}>
              <Ionicons name="cloud-outline" size={16} color={colours.textSecondary} />
              <Text style={styles.ecoLabel}>CO₂:</Text>
              <Text style={styles.ecoValue}>{product.carbonEmissions}g</Text>
            </View>

            <View style={styles.ecoStat}>
              <Ionicons name="bag-outline" size={16} color={colours.textSecondary} />
              <Text style={styles.ecoLabel}>Plastic:</Text>
              <Text style={styles.ecoValue}>{product.plasticUsage}g</Text>
            </View>

            <View style={styles.ecoStat}>
              <Ionicons name="leaf" size={16} color={colours.primaryGreen} />
              <Text style={styles.ecoLabel}>Points:</Text>
              <Text style={styles.ecoValue}>{product.points}</Text>
            </View>
          </View>

          {/* Eco Score Badge */}
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
              <Text style={styles.scoreText}>Eco Score: {product.sustainabilityScore}</Text>
            </View>
          </View>

          {/* Fun Fact */}
          <Text style={styles.funFactText}>{funFact()}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/leafy.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colours.primaryGreen} />
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
            <Ionicons name="arrow-back" size={24} color={colours.primary} />
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Sustainable Alternatives</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
          {/* Current Product */}
          <Text style={styles.sectionTitle}>Your Product</Text>
          <MainProductCard product={originalProduct || product} />

          {/* Alternatives */}
          {alternatives.length > 0 ? (
            <>
              <View style={styles.alternativesGrid}>
                {alternatives.map((alternative, index) => (
                  <TouchableOpacity
                    key={alternative._id || index}
                    style={[styles.alternativeCard, { width: `${100 / numColumns}%` }]}
                    activeOpacity={0.8}
                    onPress={() => navigation.push('Recommendations', { product: alternative })}
                  >
                    {alternative.improvement && (
                      <View style={styles.improvementIndicator}>
                        <Ionicons name="arrow-up" size={16} color={colours.white} />
                        <Text style={styles.improvementValue}>
                          +{alternative.improvement.scoreImprovement}
                        </Text>
                      </View>
                    )}
                    <ProductCard item={alternative} width="100%" />
                    {alternative.improvement && (
                      <View style={styles.improvementDetails}>
                        <Text style={styles.improvementTitle}>Environmental Benefits:</Text>
                        {alternative.improvement.carbonReduction > 0 && (
                          <View style={styles.benefitItem}>
                            <Ionicons name="cloud" size={14} color={colours.primaryGreen} />
                            <Text style={styles.benefitText}>
                              -{alternative.improvement.carbonReduction}g CO₂
                            </Text>
                          </View>
                        )}
                        {alternative.improvement.plasticReduction > 0 && (
                          <View style={styles.benefitItem}>
                            <Ionicons name="bag" size={14} color={colours.primaryGreen} />
                            <Text style={styles.benefitText}>
                              -{alternative.improvement.plasticReduction}g plastic
                            </Text>
                          </View>
                        )}
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>

            </>
          ) : (
            <View style={styles.noAlternativesContainer}>
              <Ionicons name="trophy" size={48} color={colours.primaryGreen} />
              <Text style={styles.noAlternativesTitle}>Great Choice! 🌟</Text>
              <Text style={styles.noAlternativesText}>
                This product is already one of the most sustainable options in its category.
              </Text>
            </View>
          )}

          {/* Tips */}
          <View style={styles.tipsContainer}>
            <Text style={styles.tipsTitle}>💡 Sustainability Tips</Text>
            <View style={styles.tipItem}>
              <Ionicons name="cloud" size={16} color={colours.primaryGreen} />
              <Text style={styles.tipText}>Choose products with lower CO₂ emissions</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="bag" size={16} color={colours.primaryGreen} />
              <Text style={styles.tipText}>Look for minimal plastic packaging</Text>
            </View>
            <View style={styles.tipItem}>
              <Ionicons name="leaf" size={16} color={colours.primaryGreen} />
              <Text style={styles.tipText}>Higher Eco Score = more environmentally friendly</Text>
            </View>
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
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  loadingText: {
    marginTop: spacing.md,
    color: colours.textSecondary,
    fontSize: typography.sizes.base,
    fontFamily: typography.families.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colours.white,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colours.borderLight,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: typography.sizes.base,
    color: colours.primary,
    fontWeight: typography.weights.medium,
    marginLeft: spacing.xs,
    fontFamily: typography.families.primary,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colours.textPrimary,
    fontFamily: typography.families.heading,
  },
  scrollContainer: {
    flex: 1,
    padding: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colours.textPrimary,
    marginBottom: spacing.md,
    fontFamily: typography.families.heading,
  },
  // Main Product Card with side-by-side layout
  mainProductCard: {
    flexDirection: 'row',
    backgroundColor: colours.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: colours.primaryOrange,
  },
  imageColumn: {
    width: '40%',
    marginRight: spacing.md,
  },
  infoColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  mainProductImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    resizeMode: 'contain',
  },
  noImagePlaceholder: {
    width: '100%',
    height: 160,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colours.offWhite,
    borderRadius: 8,
  },
  noImageText: {
    color: colours.mediumGray,
    fontSize: typography.sizes.sm,
    marginTop: spacing.xs,
    fontFamily: typography.families.primary,
  },
  mainProductTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colours.textPrimary,
    marginBottom: spacing.xs,
    fontFamily: typography.families.heading,
  },
  productPrice: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colours.primaryOrange,
    marginBottom: spacing.md,
    fontFamily: typography.families.primary,
  },
  // Eco Stats styling (matching ProductCard)
  ecoStats: {
    marginBottom: spacing.md,
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colours.offWhite,
    borderRadius: 6,
  },
  ecoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 4,
  },
  ecoLabel: {
    fontSize: typography.sizes.xs,
    color: colours.textSecondary,
    fontWeight: typography.weights.medium,
    marginRight: 2,
    fontFamily: typography.families.primary,
  },
  ecoValue: {
    fontSize: typography.sizes.sm,
    color: colours.textPrimary,
    fontWeight: typography.weights.medium,
    fontFamily: typography.families.primary,
  },
  // Score Badge (matching ProductCard)
  scoreContainer: {
    marginBottom: spacing.md,
  },
  scoreBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 6,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: typography.sizes.sm,
    color: colours.white,
    fontWeight: typography.weights.bold,
    fontFamily: typography.families.primary,
  },
  funFactText: {
    fontSize: typography.sizes.sm,
    fontStyle: 'italic',
    color: colours.textSecondary,
    fontFamily: typography.families.primary,
    lineHeight: 18,
  },
  // Alternatives section
  alternativesHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  improvementBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.primaryGreen,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 12,
    gap: spacing.xs,
  },
  improvementText: {
    fontSize: typography.sizes.xs,
    color: colours.white,
    fontWeight: typography.weights.semiBold,
    fontFamily: typography.families.primary,
  },
  alternativesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    marginBottom: spacing.lg,
  },
  alternativeCard: {
    padding: spacing.xs,
  },
  improvementIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.primaryGreen,
    paddingHorizontal: spacing.xs,
    paddingVertical: 2,
    borderRadius: 8,
    zIndex: 10,
    gap: 2,
  },
  improvementValue: {
    fontSize: typography.sizes.xs,
    color: colours.white,
    fontWeight: typography.weights.bold,
    fontFamily: typography.families.primary,
  },
  improvementDetails: {
    backgroundColor: colours.lightGreen + '20',
    padding: spacing.sm,
    borderRadius: 6,
    marginTop: spacing.xs,
  },
  improvementTitle: {
    fontSize: typography.sizes.xs,
    fontWeight: typography.weights.semiBold,
    color: colours.primaryGreen,
    marginBottom: spacing.xs,
    fontFamily: typography.families.primary,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: 2,
  },
  benefitText: {
    fontSize: typography.sizes.xs,
    color: colours.textSecondary,
    fontFamily: typography.families.primary,
  },
  noAlternativesContainer: {
    backgroundColor: colours.white,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    marginBottom: spacing.lg,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  noAlternativesTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colours.primaryGreen,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
    fontFamily: typography.families.heading,
  },
  noAlternativesText: {
    fontSize: typography.sizes.base,
    color: colours.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    fontFamily: typography.families.primary,
  },
  tipsContainer: {
    backgroundColor: colours.white,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.lg,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  tipsTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colours.textPrimary,
    marginBottom: spacing.md,
    fontFamily: typography.families.heading,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  tipText: {
    fontSize: typography.sizes.sm,
    color: colours.textSecondary,
    flex: 1,
    fontFamily: typography.families.primary,
  },
});