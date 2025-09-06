import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, Image, TouchableOpacity, ActivityIndicator, Dimensions, ImageBackground, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Confetti from 'react-confetti';
import { colours, spacing, typography } from '../theme';
import NavigationBar from './NavigationBar';

export default function ReceiptsPoints({ route, navigation }) {
  const { items = [], totalPoints = 0 } = route?.params || {};
  const [prevPoints, setPrevPoints] = useState(null);
  const [updatedPoints, setUpdatedPoints] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(true);
  const windowSize = Dimensions.get('window');

  useEffect(() => {
    const updateUserPoints = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');
        if (!token || !userId) {
          alert('Not logged in. Please log in first.');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to fetch user profile');
        setPrevPoints(data.points);

        const newPoints = (data.points || 0) + totalPoints;
        setUpdatedPoints(newPoints);

        await fetch(`http://localhost:3000/api/users/${userId}/points`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
          body: JSON.stringify({ points: newPoints }),
        });
      } catch (err) {
        alert(err.message || 'Network error');
      } finally {
        setLoading(false);
      }
    };

    updateUserPoints();
  }, [totalPoints]);

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 5000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/leafy.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.overlay}>
          <ActivityIndicator size="large" color={colours.primary} />
          <Text style={styles.loadingText}>Updating points...</Text>
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
        {showConfetti && <Confetti width={windowSize.width} height={windowSize.height} />}

        {/* Navigation bar */}
        <NavigationBar navigation={navigation} vertical />

        {/* Scrollable content */}
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          {/* Points summary in center */}
          <View style={styles.card}>
            <Text style={styles.summaryTitle}>Points Update</Text>
            <Text style={styles.summaryPrevious}>Previous Points: {prevPoints}</Text>
            <Text style={styles.summaryEarned}>Receipt Points: {totalPoints}</Text>
            <Text style={styles.summaryUpdated}>
              Updated Points: <Text style={styles.updatedNumber}>{updatedPoints}</Text>
            </Text>
          </View>

          {/* Items list */}
          {items.length === 0 ? (
            <View style={styles.noItemsBox}>
              <Text style={styles.noItemsText}>No items scanned.</Text>
            </View>
          ) : (
            items.map((item, idx) => (
              <View key={idx} style={styles.itemBox}>
                {item.imageUrl ? (
                  <Image source={{ uri: item.imageUrl }} style={styles.itemImage} />
                ) : (
                  <View style={styles.noImage}>
                    <Text style={{ fontSize: 12, color: colours.textSecondary }}>No Image</Text>
                  </View>
                )}
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemQty}>Qty: {item.qty}</Text>
                  <Text style={styles.itemPoints}>Points: {item.pointsEarned ?? item.points}</Text>
                </View>
              </View>
            ))
          )}
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
    backgroundColor: 'rgba(255,255,255,0.85)',
    flexDirection: 'row',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: 18,
    color: colours.primary,
  },
  contentContainer: {
    flexGrow: 1,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: spacing.xl,
  },
  card: {
    backgroundColor: colours.white,
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: spacing.xl,
    marginBottom: spacing.lg,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
    alignItems: 'center',
  },
  summaryTitle: {
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colours.primary,
    marginBottom: spacing.sm,
  },
  summaryPrevious: { fontSize: 16, color: colours.textSecondary, marginBottom: spacing.xs },
  summaryEarned: { fontSize: 18, fontWeight: 'bold', color: colours.success, marginBottom: spacing.xs },
  summaryUpdated: { fontSize: 20, fontWeight: 'bold', marginTop: spacing.sm, color: colours.textPrimary },
  updatedNumber: { color: colours.primaryOrange },
  noItemsBox: {
    backgroundColor: colours.white,
    width: '100%',
    maxWidth: 500,
    borderRadius: 20,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  noItemsText: { fontSize: 16, color: colours.textSecondary },
  itemBox: {
    flexDirection: 'row',
    backgroundColor: colours.white,
    width: '100%',
    maxWidth: 500,
    borderRadius: 16,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  itemImage: { width: 50, height: 50, borderRadius: 8, marginRight: spacing.md },
  noImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: colours.offWhite,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  itemDetails: { flex: 1 },
  itemName: { fontSize: 16, fontWeight: 'bold', color: colours.textPrimary },
  itemQty: { fontSize: 14, color: colours.textSecondary, marginTop: 2 },
  itemPoints: { fontSize: 14, fontWeight: 'bold', color: colours.success, marginTop: 2 },
});
