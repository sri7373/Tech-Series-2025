import React, { useEffect, useState } from 'react';
import { Alert } from 'react-native';

export default function VoucherPage({ token, userId, navigation }) {
  const [points, setPoints] = useState(0);
  const [ownedVouchers, setOwnedVouchers] = useState([]);
  const [availableVouchers] = useState([
    { pointsRequired: 200, value: 2 },
    { pointsRequired: 500, value: 6 },
    { pointsRequired: 1000, value: 15 },
    { pointsRequired: 1500, value: 20 },
    { pointsRequired: 2000, value: 32 },
  ]);

  const [hoveredVoucher, setHoveredVoucher] = useState(null);
  const [hoverReturn, setHoverReturn] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user points and vouchers
useEffect(() => {
  const loadUserData = async () => {
    setLoading(true);
    try {
      if (!token || !userId) {
        Alert.alert("Error", "Missing token or userId.");
        setLoading(false);
        return;
      }

      // Fetch user data using props
      const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'x-auth-token': token },
      });
      const data = await response.json();

      if (response.ok) {
        console.log('Fetched user data:', data);
        setPoints(data.points || 0); // <-- THIS IS YOUR POINTS
        setOwnedVouchers(data.vouchers || []);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch user data');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Network error while fetching user data');
    } finally {
      setLoading(false);
    }
  };

  loadUserData();
}, [token, userId]);

  const handleRedeem = async (voucher) => {
    if (points < voucher.pointsRequired) {
      alert('Not enough points to redeem this voucher.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/users/${userId}/redeem`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-auth-token': token,
        },
        body: JSON.stringify({ voucher }),
      });

      const data = await response.json();
      if (data.success) {
        alert(`Redeemed $${voucher.value} voucher!`);
        setPoints(data.updatedPoints);
        setOwnedVouchers([...ownedVouchers, voucher]);
      } else {
        alert('Failed to redeem voucher.');
      }
    } catch (err) {
      console.error(err);
      alert('Error redeeming voucher.');
    }
  };

  if (loading) return <p>Loading user data...</p>;

  return (
    <div style={styles.container}>
      {/* Return/Home Button */}
      <div
        style={{
          ...styles.touchableReturnButton,
          backgroundColor: hoverReturn ? '#005BBB' : '#007AFF',
        }}
        onClick={() => navigation && navigation.navigate('Home')}
        onMouseEnter={() => setHoverReturn(true)}
        onMouseLeave={() => setHoverReturn(false)}
      >
        ← Home
      </div>

      {/* Header */}
      <div style={styles.header}>
        <h2 style={styles.title}>Voucher Center</h2>
        <div style={styles.pointsBadge}>Points: {points}</div>
      </div>

      {/* Owned Vouchers */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Your Vouchers</h3>
        {ownedVouchers.length === 0 ? (
          <p style={styles.noVouchers}>You don’t own any vouchers yet.</p>
        ) : (
          <div style={styles.voucherList}>
            {ownedVouchers.map((v, idx) => (
              <div key={idx} style={styles.voucherCard}>
                <p>${v.value} Voucher</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Available Vouchers */}
      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>Available to Redeem</h3>
        <div style={styles.voucherList}>
          {availableVouchers.map((v, idx) => (
            <div key={idx} style={styles.voucherCard}>
              <p>${v.value} Voucher</p>
              <p>{v.pointsRequired} Points</p>
              <div
                style={{
                  ...styles.touchableRedeemButton,
                  backgroundColor: hoveredVoucher === idx ? '#FFB74D' : '#FF9800',
                  opacity: points >= v.pointsRequired ? 1 : 0.5,
                  cursor: points >= v.pointsRequired ? 'pointer' : 'not-allowed',
                }}
                onClick={() => points >= v.pointsRequired && handleRedeem(v)}
                onMouseEnter={() => setHoveredVoucher(idx)}
                onMouseLeave={() => setHoveredVoucher(null)}
              >
                {points >= v.pointsRequired ? 'Redeem' : 'Not enough points'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '20px', fontFamily: 'Arial, sans-serif' },
  touchableReturnButton: {
    display: 'inline-block',
    padding: '8px 12px',
    marginBottom: '10px',
    color: '#fff',
    fontWeight: 'bold',
    borderRadius: '6px',
    userSelect: 'none',
    transition: 'background-color 0.2s',
    textAlign: 'center',
  },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { margin: 0 },
  pointsBadge: {
    backgroundColor: '#4CAF50',
    color: '#fff',
    padding: '8px 12px',
    borderRadius: '12px',
    fontWeight: 'bold',
  },
  section: { marginTop: '30px' },
  sectionTitle: { fontSize: '20px', marginBottom: '12px' },
  noVouchers: { color: '#666', fontStyle: 'italic' },
  voucherList: { display: 'flex', gap: '12px', flexWrap: 'wrap' },
  voucherCard: {
    border: '1px solid #ccc',
    padding: '12px 16px',
    borderRadius: '8px',
    minWidth: '120px',
    textAlign: 'center',
    backgroundColor: '#f9f9f9',
  },
  touchableRedeemButton: {
    marginTop: '8px',
    padding: '6px 12px',
    borderRadius: '6px',
    color: '#fff',
    fontWeight: 'bold',
    userSelect: 'none',
    transition: 'background-color 0.2s',
  },
};
