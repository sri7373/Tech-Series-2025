import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        // Get the token saved during login
        const token = await AsyncStorage.getItem('userToken');
        const userId = await AsyncStorage.getItem('userId');

        if (!token || !userId) {
          Alert.alert("Not logged in", "Please log in first.");
          setLoading(false);
          return;
        }

        // Fetch user data
        const userResponse = await fetch(`http://localhost:3000/api/users/${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-auth-token': token,
          },
        });

        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUser(userData);
          
          // Fetch leaderboard to calculate rank
          const leaderboardResponse = await fetch('http://localhost:3000/api/leaderboard');
          const leaderboardData = await leaderboardResponse.json();
          
          if (leaderboardResponse.ok) {
            // Find user's rank in leaderboard
            const userRankIndex = leaderboardData.findIndex(u => u._id === userData._id);
            setUserRank(userRankIndex !== -1 ? userRankIndex + 1 : null);
          }
        } else {
          Alert.alert('Error', userData.error || 'Failed to fetch user profile');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: '#333' }}>No user data found.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Picture */}
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={100} color="#007AFF" />
      </View>
      
      {/* Username */}
      <Text style={styles.username}>{user.username}</Text>
      
      {/* Email */}
      <Text style={styles.email}>{user.email}</Text>
      
      {/* Points */}
      <View style={styles.pointsContainer}>
        <Ionicons name="star" size={24} color="#FFD700" />
        <Text style={styles.pointsText}>{user.points} Points</Text>
      </View>
      
      {/* Rank */}
      {userRank && (
        <View style={styles.rankContainer}>
          <Ionicons name="trophy" size={24} color="#FFA500" />
          <Text style={styles.rankText}>Rank #{userRank}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  avatarContainer: { marginBottom: 20 },
  username: { fontSize: 24, fontWeight: 'bold', color: '#007AFF', marginBottom: 8 },
  email: { fontSize: 16, color: '#555', marginBottom: 16 },
  pointsContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  pointsText: { fontSize: 18, color: '#333', marginLeft: 8, fontWeight: 'bold' },
  rankContainer: { flexDirection: 'row', alignItems: 'center', marginTop: 10 },
  rankText: { fontSize: 18, color: '#333', marginLeft: 8, fontWeight: 'bold' },
});