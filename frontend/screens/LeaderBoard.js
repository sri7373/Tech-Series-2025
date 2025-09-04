import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Get current user ID
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);

      // Fetch leaderboard (now includes ranks from backend)
      const response = await fetch('http://localhost:3000/api/leaderboard');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data); // Data already sorted by points with ranks
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch leaderboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
      console.log('Leaderboard error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Check if current user is in top 10
  const currentUserInTop10 = currentUserId ? users.slice(0, 10).some(user => user._id === currentUserId) : false;
  console.log('currentUserId from storage:', currentUserId);
  console.log('user ids from backend:', users.map(u => u._id));

  
  // Find current user's data for bottom row
  const currentUserData = currentUserId ? users.find(user => user._id === currentUserId) : null;

  const renderItem = ({ item }) => {
    const isCurrentUser = currentUserId && item._id === currentUserId;
    
    return (
      <View style={[styles.row, isCurrentUser && styles.highlightRow]}>
        <Text style={styles.rank}>{item.rank}</Text>
        <Text style={styles.name}>{item.username || item.name}</Text>
        <Text style={styles.score}>{item.points}</Text>
      </View>
    );
  };

  const renderCurrentUserRow = () => {
    if (!currentUserData || currentUserInTop10) return null;

    return (
      <View style={[styles.row, styles.highlightRow, styles.bottomRow]}>
        <Text style={styles.rank}>{currentUserData.rank}</Text>
        <Text style={styles.name}>{currentUserData.username || currentUserData.name}</Text>
        <Text style={styles.score}>{currentUserData.points}</Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <>
          <FlatList
            data={users.slice(0, 10)} // Show only top 10
            keyExtractor={(item) => item._id || item.id || Math.random().toString()}
            renderItem={renderItem}
          />
          {renderCurrentUserRow()}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  highlightRow: { backgroundColor: '#d0f0ff', borderRadius: 5 },
  bottomRow: { marginTop: 10, borderTopWidth: 2, borderTopColor: '#007AFF' },
  rank: { fontWeight: 'bold', width: 30 },
  name: { flex: 1 },
  score: { fontWeight: 'bold' },
});