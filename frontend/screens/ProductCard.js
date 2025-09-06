import React from 'react';
import { View, Text, Image, TouchableOpacity, Animated, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colours, spacing, typography } from '../theme';

const ProductCard = ({ item, width, animation }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return colours.success;
    if (score >= 50) return colours.primaryGreen;
    if (score >= 30) return colours.primaryOrange;
    return colours.error;
  };

  const scoreColor = getScoreColor(item.sustainabilityScore);
  const showPoints = item.points && item.points > 0;
  
  return (
    <Animated.View 
      style={[
        styles.productCard, 
        { width },
        animation && { transform: [{ scale: animation.interpolate({
          inputRange: [0, 0.5, 1],
          outputRange: [1, 1.05, 1]
        })}] }
      ]}
    >
      <View style={styles.imageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.productImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.noImagePlaceholder}>
            <Ionicons name="image-outline" size={32} color={colours.mediumGray} />
            <Text style={styles.noImageText}>No Image</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        
        <View style={styles.priceContainer}>
          <Text style={styles.productPrice}>${item.price}</Text>
          {showPoints && (
            <View style={styles.pointsEarned}>
              <Ionicons name="leaf" size={12} color={colours.primaryGreen} />
              <Text style={styles.pointsText}>+{item.points}</Text>
            </View>
          )}
        </View>
        
        <View style={styles.ecoInfo}>
          <View style={styles.ecoStat}>
            <Ionicons name="cloud-outline" size={12} color={colours.textSecondary} />
            <Text style={styles.ecoLabel}>CO₂:</Text>
            <Text style={styles.ecoValue}>{item.carbonEmissions}g</Text>
          </View>
          
          <View style={styles.ecoStat}>
            <Ionicons name="bag-outline" size={12} color={colours.textSecondary} />
            <Text style={styles.ecoLabel}>Plastic:</Text>
            <Text style={styles.ecoValue}>{item.plasticUsage}g</Text>
          </View>
        </View>
        
        {item.sustainabilityScore > 0 && (
          <View style={styles.scoreContainer}>
            <View style={[styles.scoreBadge, { backgroundColor: scoreColor }]}>
              <Text style={styles.scoreText}>Eco Score: {item.sustainabilityScore}</Text>
            </View>
          </View>
        )}
        
        <TouchableOpacity style={styles.viewButton}>
          <Text style={styles.viewButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    backgroundColor: colours.white,
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: spacing.sm,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: colours.borderLight,
    height: 380, // Taller card
    // width: 160, // Narrower card
  },
  imageContainer: {
    width: '100%',
    height: 200, // Bigger image area
    backgroundColor: colours.white, // White background for images
    justifyContent: 'center',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: colours.borderLight,
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  noImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: colours.mediumGray,
    fontSize: typography.sizes.xs,
    marginTop: spacing.xs,
  },
  productInfo: {
    padding: spacing.sm,
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: typography.sizes.sm,
    fontWeight: typography.weights.medium,
    color: colours.textPrimary,
    marginBottom: spacing.xs,
    minHeight: 36,
    textAlign: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  productPrice: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    color: colours.primaryOrange,
  },
  pointsEarned: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.lightGreen + '40',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  pointsText: {
    fontSize: typography.sizes.xs,
    color: colours.primaryGreen,
    fontWeight: typography.weights.medium,
    marginLeft: 2,
  },
  ecoInfo: {
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
    paddingVertical: 6,
    backgroundColor: colours.offWhite,
    borderRadius: 6,
  },
  ecoStat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  ecoLabel: {
    fontSize: typography.sizes.xxs,
    color: colours.textSecondary,
    fontWeight: typography.weights.medium,
    marginRight: 2,
  },
  ecoValue: {
    fontSize: typography.sizes.xs,
    color: colours.textPrimary,
    fontWeight: typography.weights.medium,
  },
  scoreContainer: {
    marginBottom: spacing.sm,
  },
  scoreBadge: {
    paddingHorizontal: spacing.xs,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
  },
  scoreText: {
    fontSize: typography.sizes.xs,
    color: colours.white,
    fontWeight: typography.weights.bold,
  },
  viewButton: {
    backgroundColor: colours.primaryGreen + '20',
    paddingHorizontal: spacing.sm,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  viewButtonText: {
    fontSize: typography.sizes.sm,
    color: colours.primaryGreen,
    fontWeight: typography.weights.medium,
  },
});

export default ProductCard;