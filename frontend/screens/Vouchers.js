import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert, ImageBackground, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { colours, spacing, typography } from '../theme';

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
        console.log('User token:', token);

        if (!token) {
          Alert.alert('Error', 'Please log in first.');
          setLoading(false);
          return;
        }

        // Check voucher eligibility
        const checkRes = await fetch('http://localhost:3000/api/vouchers/check', {
          headers: { 'x-auth-token': token }
        });

        if (checkRes.ok) {
          const checkData = await checkRes.json();
          console.log('Voucher eligibility:', checkData);
          setCanClaim(checkData.canClaim);
          setRequiredPoints(checkData.requiredPoints);
          setUser({ points: checkData.currentPoints });
        }

        // Fetch user's vouchers
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
        // Update local state
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
        <View style={styles.container}>
          <ActivityIndicator size="large" color={colours.primary} style={{ marginTop: spacing.xl }} />
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
          <Text style={styles.title}>Vouchers</Text>
          {/* Return/Home Button */}
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginBottom: spacing.md }}>
            <Text style={{ color: colours.primary, fontWeight: 'bold', fontSize: typography.button }}>← Home</Text>
          </TouchableOpacity>

          {/* Points */}
          <View style={styles.pointsContainer}>
            <Ionicons name="star" size={24} color={colours.accent} />
            <Text style={styles.pointsText}>
              {user?.points ?? 0} Points
            </Text>
          </View>

          {/* Claim Voucher */}
          <TouchableOpacity
            onPress={handleClaimVoucher}
            disabled={!canClaim}
            style={styles.claimButton}
          >
            <Text style={styles.claimButtonText}>
              {canClaim ? `Claim Voucher (${requiredPoints} Points)` : 'Not enough points'}
            </Text>
          </TouchableOpacity>

          {/* Claimed Vouchers */}
          <Text style={styles.sectionTitle}>Your Vouchers</Text>
          {myVouchers.length === 0 ? (
            <Text style={styles.noVoucherText}>You don’t own any vouchers yet.</Text>
          ) : (
            myVouchers.map((v, idx) => (
              <View key={idx} style={styles.voucherCard}>
                <Text style={styles.voucherCode}>Code: {v.code}</Text>
                <Text style={styles.voucherDetail}>Discount: {v.discount}%</Text>
                <Text style={styles.voucherDetail}>Expires: {new Date(v.expires).toLocaleDateString()}</Text>
                <Text style={[styles.voucherDetail, { color: v.used ? colours.danger : colours.success }]}>Used: {v.used ? 'Yes' : 'No'}</Text>
              </View>
            ))
          )}
        </View>
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
  container: {
    flex: 1,
    padding: spacing.lg,
  },
  title: {
    fontSize: typography.title,
    fontWeight: 'bold',
    marginBottom: spacing.sm,
    textAlign: 'center',
    color: colours.primary,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    padding: spacing.md,
    backgroundColor: colours.inputBackground,
    borderRadius: spacing.md,
  },
  pointsText: {
    marginLeft: spacing.sm,
    fontSize: typography.body,
    fontWeight: 'bold',
    color: colours.text,
  },
  claimButton: {
    padding: spacing.md,
    borderRadius: spacing.md,
    marginBottom: spacing.lg,
    backgroundColor: colours.accent,
    alignItems: 'center',
  },
  claimButtonText: {
    color: colours.onAccent,
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: typography.button,
  },
  sectionTitle: {
    fontSize: typography.body,
    fontWeight: 'bold',
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
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colours.border,
    borderRadius: spacing.md,
    marginBottom: spacing.sm,
    backgroundColor: colours.surface,
  },
  voucherCode: {
    color: colours.text,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  voucherDetail: {
    color: colours.textSecondary,
    marginBottom: 2,
  },
});
