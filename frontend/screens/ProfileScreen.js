import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [user, setUser] = useState(null);
  const [nationalRank, setNationalRank] = useState(null);
  const [neighbourhoodRank, setNeighbourhoodRank] = useState(null);
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
          
          // Fetch rank information from leaderboard API
          const rankResponse = await fetch(`http://localhost:3000/api/leaderboard/ranks/${userId}`);
          const rankData = await rankResponse.json();
          
          if (rankResponse.ok) {
            setNationalRank(rankData.nationalRank);
            setNeighbourhoodRank(rankData.neighbourhoodRank);
          }
        } else {
          Alert.alert('Error', userData.error || 'Failed to fetch user profile');
        }
      } catch (error) {
        Alert.alert('Error', 'Network error');
        console.error('Profile load error:', error);
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Profile Picture */}
      <View style={styles.avatarContainer}>
        <Ionicons name="person-circle" size={100} color="#007AFF" />
      </View>
      
      {/* Username */}
      <Text style={styles.username}>{user.username}</Text>
      
      {/* Email */}
      <Text style={styles.email}>{user.email}</Text>
      
      {/* Neighbourhood */}
      {user.neighbourhood && (
        <Text style={styles.neighbourhood}>{user.neighbourhood}</Text>
      )}
      
      {/* Points */}
      <View style={styles.pointsContainer}>
        <Ionicons name="star" size={24} color="#FFD700" />
        <Text style={styles.pointsText}>{user.points} Points</Text>
      </View>
      
      {/* Ranks */}
      <View style={styles.rankSection}>
        <Text style={styles.sectionTitle}>Your Rankings</Text>
        
        {/* National Rank */}
        <View style={styles.rankContainer}>
          <Ionicons name="trophy" size={24} color="#FFA500" />
          <View style={styles.rankTextContainer}>
            <Text style={styles.rankText}>National Rank: #{nationalRank || 'N/A'}</Text>
          </View>
        </View>
        
        {/* Neighbourhood Rank */}
        {user.neighbourhood && (
          <View style={styles.rankContainer}>
            <Ionicons name="location" size={24} color="#4CAF50" />
            <View style={styles.rankTextContainer}>
              <Text style={styles.rankText}>Neighbourhood Rank: #{neighbourhoodRank || 'N/A'}</Text>
              <Text style={styles.rankSubtext}>In {user.neighbourhood}</Text>
            </View>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexGrow: 1, 
    padding: 20, 
    backgroundColor: '#fff',
    alignItems: 'center'
  },
  centered: { 
    flex: 1, 
    alignItems: 'center', 
    justifyContent: 'center', 
    backgroundColor: '#fff' 
  },
  avatarContainer: { 
    alignItems: 'center', 
    marginBottom: 20,
    marginTop: 20
  },
  username: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    color: '#007AFF', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  email: { 
    fontSize: 16, 
    color: '#555', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  neighbourhood: { 
    fontSize: 16, 
    color: '#777', 
    marginBottom: 16, 
    textAlign: 'center',
    fontWeight: '500'
  },
  pointsContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'center',
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 10,
    width: '90%'
  },
  pointsText: { 
    fontSize: 18, 
    color: '#333', 
    marginLeft: 8, 
    fontWeight: 'bold' 
  },
  rankSection: { 
    width: '90%', 
    marginTop: 20 
  },
  sectionTitle: { 
    fontSize: 20, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    textAlign: 'center' 
  },
  rankContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f0f8ff',
    borderRadius: 10
  },
  rankTextContainer: { 
    marginLeft: 10, 
    flex: 1 
  },
  rankText: { 
    fontSize: 16, 
    fontWeight: 'bold', 
    color: '#333' 
  },
  rankSubtext: { 
    fontSize: 14, 
    color: '#666', 
    marginTop: 2 
  }
});