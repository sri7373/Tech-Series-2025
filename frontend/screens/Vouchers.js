import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';

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

  if (loading) return <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 50 }} />;

  return (
    <ScrollView style={{ padding: 20 }}>
      {/* Return/Home Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Home')} style={{ marginBottom: 15 }}>
        <Text style={{ color: '#007AFF', fontWeight: 'bold', fontSize: 16 }}>← Home</Text>
      </TouchableOpacity>

      {/* Points */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
        <Ionicons name="star" size={24} color="#FFD700" />
        <Text style={{ marginLeft: 8, fontSize: 16, fontWeight: 'bold' }}>
          {user?.points ?? 0} Points
        </Text>
      </View>

      {/* Claim Voucher */}
      <TouchableOpacity
        onPress={handleClaimVoucher}
        disabled={!canClaim}
        style={{
          padding: 12,
          borderRadius: 8,
          marginBottom: 20,
          backgroundColor: canClaim ? '#FF9800' : '#ccc',
        }}
      >
        <Text style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center' }}>
          {canClaim ? `Claim Voucher (${requiredPoints} Points)` : 'Not enough points'}
        </Text>
      </TouchableOpacity>

      {/* Claimed Vouchers */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>Your Vouchers</Text>
      {myVouchers.length === 0 ? (
        <Text>You don’t own any vouchers yet.</Text>
      ) : (
        myVouchers.map((v, idx) => (
          <View key={idx} style={{ padding: 12, borderWidth: 1, borderRadius: 8, marginBottom: 8 }}>
            <Text>Code: {v.code}</Text>
            <Text>Discount: {v.discount}%</Text>
            <Text>Expires: {new Date(v.expires).toLocaleDateString()}</Text>
            <Text>Used: {v.used ? 'Yes' : 'No'}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}
