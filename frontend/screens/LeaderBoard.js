import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert } from 'react-native';

// Replace this with your actual user ID or username from context/auth
const CURRENT_USER_ID = 'your_current_user_id'; // e.g., from AsyncStorage or context

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:3000/api/leaderboard');
      const data = await response.json();
      if (response.ok) {
        setUsers(data);
      } else {
        Alert.alert('Error', data.error || 'Failed to fetch leaderboard');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error');
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item, index }) => (
    <View
      style={[
        styles.row,
        (item._id === CURRENT_USER_ID || item.username === 'YourUsername') && styles.highlightRow,
      ]}
    >
      <Text style={styles.rank}>{index + 1}</Text>
      <Text style={styles.name}>{item.username || item.name}</Text>
      <Text style={styles.score}>{item.points}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Leaderboard</Text>
      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <FlatList
          data={users.sort((a, b) => b.points - a.points)}
          keyExtractor={(item) => item._id || item.id || Math.random().toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10 },
  row: { flexDirection: 'row', justifyContent: 'space-between', padding: 15, borderBottomWidth: 1, borderColor: '#eee' },
  highlightRow: { backgroundColor: '#d0f0ff', borderRadius: 5 },
  rank: { fontWeight: 'bold', width: 30 },
  name: { flex: 1 },
  score: { fontWeight: 'bold' },
});