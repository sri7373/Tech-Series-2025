import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colours, spacing, typography } from '../theme';

export default function Leaderboard() {
  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [currentUserNeighborhood, setCurrentUserNeighborhood] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rankingType, setRankingType] = useState('nation'); // "nation" or "neighbourhood"

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      // Get current user ID
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);

      // Fetch leaderboard (full list)
      const response = await fetch('http://localhost:3000/api/leaderboard');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);
        // find current user's neighbourhood
        const currentUser = data.find(u => u._id === userId);
        if (currentUser) setCurrentUserNeighborhood(currentUser.neighbourhood);
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

  // Filtered users based on ranking type
  const filteredUsers = rankingType === 'neighbourhood'
    ? users.filter(u => u.neighbourhood === currentUserNeighborhood)
    : users;

  // Sort by points descending
  filteredUsers.sort((a, b) => b.points - a.points);

  // Add rank
  const usersWithRank = filteredUsers.map((user, index) => ({ ...user, rank: index + 1 }));

  // Is current user in top 10?
  const currentUserInTop10 = currentUserId ? usersWithRank.slice(0, 10).some(u => u._id === currentUserId) : false;
  const currentUserData = currentUserId ? usersWithRank.find(u => u._id === currentUserId) : null;

  const renderItem = ({ item }) => {
    const isCurrentUser = currentUserId && item._id === currentUserId;
    return (
      <View style={[
        styles.row,
        isCurrentUser && styles.highlightRow,
        isCurrentUser && styles.currentUserRow // add green highlight for current user
      ]}>
        <Text style={styles.rank}>{item.rank}</Text>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{item.username || item.name}</Text>
          {rankingType === 'nation' && item.neighbourhood && (
            <Text style={styles.neighbourhood}>{item.neighbourhood}</Text>
          )}
        </View>
        <Text style={styles.score}>{item.points}</Text>
      </View>
    );
  };

  const renderCurrentUserRow = () => {
    if (!currentUserData || currentUserInTop10) return null;
    return (
      <View style={[styles.row, styles.highlightRow, styles.bottomRow]}>
        <Text style={styles.rank}>{currentUserData.rank}</Text>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{currentUserData.username || currentUserData.name}</Text>
          {rankingType === 'nation' && currentUserData.neighbourhood && (
            <Text style={styles.neighbourhood}>{currentUserData.neighbourhood}</Text>
          )}
        </View>
        <Text style={styles.score}>{currentUserData.points}</Text>
      </View>
    );
  };

  const toggleRanking = (type) => setRankingType(type);

  return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Leaderboard</Text>

          {/* Toggle buttons */}
          <View style={styles.toggleContainer}>
            <TouchableOpacity
              style={[styles.toggleButton, rankingType === 'nation' && styles.activeToggle]}
              onPress={() => toggleRanking('nation')}
            >
              <Text style={styles.toggleText}>Nation Rankings</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, rankingType === 'neighbourhood' && styles.activeToggle]}
              onPress={() => toggleRanking('neighbourhood')}
            >
              <Text style={styles.toggleText}>Neighbourhood Rankings</Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <>
              {rankingType === 'neighbourhood' && currentUserNeighborhood && (
                <Text style={styles.neighbourhoodHeader}>
                  {currentUserNeighborhood} Rankings
                </Text>
              )}
              <FlatList
                data={usersWithRank.slice(0, 10)}
                keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                renderItem={renderItem}
              />
              {renderCurrentUserRow()}
            </>
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
  container: { flex: 1, padding: spacing.lg },
  title: { fontSize: typography.title, fontWeight: 'bold', marginBottom: spacing.sm, textAlign: 'center', color: colours.primary },
  toggleContainer: { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.md },
  toggleButton: { padding: spacing.sm, marginHorizontal: spacing.xs, borderRadius: spacing.sm, backgroundColor: colours.muted },
  activeToggle: { backgroundColor: colours.primary },
  toggleText: { color: colours.text, fontWeight: 'bold' },
  neighbourhoodHeader: { 
    fontSize: typography.body, 
    fontWeight: 'bold', 
    textAlign: 'center', 
    marginBottom: spacing.md, 
    color: colours.primary,
    backgroundColor: colours.inputBackground,
    padding: spacing.sm,
    borderRadius: spacing.md
  },
  row: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    padding: spacing.md, 
    borderBottomWidth: 1, 
    borderColor: colours.border,
    backgroundColor: '#f5f5f5', // light gray for others
    borderRadius: spacing.sm,
  },
  highlightRow: { 
    backgroundColor: colours.surface, // current user white
    borderRadius: spacing.sm 
  },
  currentUserRow: {
    backgroundColor: colours.muted, // green highlight for current user
    borderWidth: 2,
    borderColor: colours.primary,
  },
  bottomRow: { marginTop: spacing.sm, borderTopWidth: 2, borderTopColor: colours.primary },
  rank: { fontWeight: 'bold', width: 30, color: colours.text },
  nameContainer: { flex: 1 },
  name: { fontWeight: 'bold', color: colours.text },
  neighbourhood: { 
    fontSize: typography.caption, 
    color: colours.textSecondary, 
    fontStyle: 'italic',
    marginTop: 2
  },
  score: { fontWeight: 'bold', color: colours.success },
});
