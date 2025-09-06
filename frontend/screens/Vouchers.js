// vouchers.js
import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, ImageBackground, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colours, spacing, typography } from '../theme';
import { globalStyles } from '../theme/globalStyles';
import NavigationBar from './NavigationBar';

export default function VoucherPage({ navigation }) {
  const [user, setUser] = useState(null);
  const [canClaim, setCanClaim] = useState(false);
  const [requiredPoints, setRequiredPoints] = useState(0);
  const [myVouchers, setMyVouchers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => { 
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert('Error', 'Please log in first.');
          setLoading(false);
          return;
        }

        const checkRes = await fetch('http://localhost:3000/api/vouchers/check', {
          headers: { 'x-auth-token': token }
        });

        if (checkRes.ok) {
          const checkData = await checkRes.json();
          setCanClaim(checkData.canClaim);
          setRequiredPoints(checkData.requiredPoints);
          setUser({ points: checkData.currentPoints });
        }

        const vouchersRes = await fetch('http://localhost:3000/api/vouchers/my-vouchers', {
          headers: { 'x-auth-token': token }
        });

        if (vouchersRes.ok) {
          const vouchersData = await vouchersRes.json();
          setMyVouchers(vouchersData);
        }

      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleClaimVoucher = async () => {
    if (!canClaim) {
      Alert.alert('Not Enough Points', `You need ${requiredPoints} points to claim a voucher. You currently have ${user?.points || 0} points.`);
      return;
    }

    try {
      const token = await AsyncStorage.getItem('userToken');

      const res = await fetch('http://localhost:3000/api/vouchers/claim', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'x-auth-token': token },
      });
      const data = await res.json();

      if (res.ok) {
        setUser(prev => ({ ...prev, points: data.remainingPoints }));
        setMyVouchers(prev => [...prev, data.voucher]);
        setCanClaim(data.remainingPoints >= requiredPoints);
        Alert.alert('Success', `Voucher claimed! Code: ${data.voucher.code}`);
      } else {
        Alert.alert('Error', data.error || 'Failed to claim voucher');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Failed to claim voucher');
    }
  };

  if (loading) return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={[styles.container, globalStyles.centerContent]}>
          <ActivityIndicator size="large" color={colours.primaryGreen} />
        </View>
      </View>
    </ImageBackground>
  );

  return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Sidebar */}
          <NavigationBar navigation={navigation} />

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Header Bar */}
            <View style={styles.headerBar}>
              <Text style={styles.headerTitle}>Vouchers</Text>
              <View style={styles.headerRight}>
                <View style={styles.pointsBadge}>
                  <Ionicons name="leaf" size={20} color={colours.primaryGreen} />
                  <Text style={styles.pointsCount}>{user?.points ?? 0}</Text>
                  <Text style={styles.pointsLabel}>Eco Points</Text>
                </View>
              </View>
            </View>

            {/* Content */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Claim Voucher */}
              <TouchableOpacity
                onPress={handleClaimVoucher}
                disabled={!canClaim}
                style={[
                  globalStyles.buttonPrimary,
                  styles.claimButton,
                  !canClaim && { backgroundColor: colours.mediumGray }
                ]}
              >
                <Text style={globalStyles.buttonPrimaryText}>
                  {canClaim ? `Claim Voucher (${requiredPoints} Points)` : 'Not enough points'}
                </Text>
              </TouchableOpacity>

              {/* Claimed Vouchers */}
              <Text style={styles.sectionTitle}>Your Vouchers</Text>
              {myVouchers.length === 0 ? (
                <Text style={styles.noVoucherText}>You don’t own any vouchers yet.</Text>
              ) : (
                myVouchers.map((v, idx) => (
                  <View key={idx} style={[globalStyles.card, styles.voucherCard]}>
                    <Text style={styles.voucherCode}>Code: {v.code}</Text>
                    <Text style={styles.voucherDetail}>Discount: {v.discount}%</Text>
                    <Text style={styles.voucherDetail}>Expires: {new Date(v.expires).toLocaleDateString()}</Text>
                    <Text style={[styles.voucherDetail, { color: v.used ? colours.danger : colours.success }]}>
                      Used: {v.used ? 'Yes' : 'No'}
                    </Text>
                  </View>
                ))
              )}
            </ScrollView>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(255, 255, 255, 0.9)' },
  container: { flex: 1, flexDirection: 'row' },
  mainContent: { flex: 1 },

  /* Header */
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colours.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colours.borderLight,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    height: 100,
  },
  headerTitle: {
    fontSize: typography.sizes.xl,
    fontWeight: typography.weights.bold,
    color: colours.primary,
  },
  headerRight: { flexDirection: 'row', alignItems: 'center' },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.offWhite,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: 20,
  },
  pointsCount: {
    marginLeft: spacing.xs,
    fontWeight: typography.weights.bold,
    fontSize: typography.sizes.base,
    color: colours.primaryGreen,
  },
  pointsLabel: {
    marginLeft: spacing.xs,
    fontSize: typography.sizes.sm,
    color: colours.textSecondary,
  },

  /* Content */
  scrollContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },

  /* Claim button */
  claimButton: {
    marginBottom: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: 12,
  },

  /* Vouchers */
  sectionTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.bold,
    marginBottom: spacing.sm,
    color: colours.primary,
    textAlign: 'center',
  },
  noVoucherText: {
    color: colours.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  voucherCard: {
    marginBottom: spacing.sm,
  },
  voucherCode: {
    color: colours.textPrimary,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  voucherDetail: {
    color: colours.textSecondary,
    marginBottom: 2,
  },
});
