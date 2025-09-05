import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, Alert, TouchableOpacity, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colours, spacing, typography } from '../theme';
import NavigationBar from './NavigationBar';

export default function Leaderboard({ navigation }) {
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
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);

      const response = await fetch('http://localhost:3000/api/leaderboard');
      const data = await response.json();
      
      if (response.ok) {
        setUsers(data);
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

  const filteredUsers = rankingType === 'neighbourhood'
    ? users.filter(u => u.neighbourhood === currentUserNeighborhood)
    : users;

  filteredUsers.sort((a, b) => b.points - a.points);

  const usersWithRank = filteredUsers.map((user, index) => ({ ...user, rank: index + 1 }));

  const currentUserInTop10 = currentUserId ? usersWithRank.slice(0, 10).some(u => u._id === currentUserId) : false;
  const currentUserData = currentUserId ? usersWithRank.find(u => u._id === currentUserId) : null;

  const renderItem = ({ item }) => {
    const isCurrentUser = currentUserId && item._id === currentUserId;
    return (
      <View style={[
        styles.row,
        isCurrentUser && styles.currentUserRow
      ]}>
        <Text style={[
          styles.rank,
          item.rank <= 3 && styles.topRank
        ]}>
          {item.rank}
        </Text>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{item.username || item.name}</Text>
          {rankingType === 'nation' && item.neighbourhood && (
            <Text style={styles.neighbourhood}>{item.neighbourhood}</Text>
          )}
        </View>
        <Text style={styles.score}>{item.points} pts</Text>
      </View>
    );
  };

  const renderCurrentUserRow = () => {
    if (!currentUserData || currentUserInTop10) return null;
    return (
      <View style={[styles.row, styles.currentUserRow, styles.bottomRow]}>
        <Text style={styles.rank}>{currentUserData.rank}</Text>
        <View style={styles.nameContainer}>
          <Text style={styles.name}>{currentUserData.username || currentUserData.name}</Text>
          {rankingType === 'nation' && currentUserData.neighbourhood && (
            <Text style={styles.neighbourhood}>{currentUserData.neighbourhood}</Text>
          )}
        </View>
        <Text style={styles.score}>{currentUserData.points} pts</Text>
      </View>
    );
  };

  return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <NavigationBar navigation={navigation} />

          <View style={styles.mainContent}>
            <View style={styles.header}>
              <Text style={styles.title}>🏆 Leaderboard</Text>
              
              <View style={styles.toggleContainer}>
                <TouchableOpacity
                  style={[styles.toggleButton, rankingType === 'nation' && styles.activeToggle]}
                  onPress={() => setRankingType('nation')}
                >
                  <Text style={[styles.toggleText, rankingType === 'nation' && styles.activeToggleText]}>
                    National
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.toggleButton, rankingType === 'neighbourhood' && styles.activeToggle]}
                  onPress={() => setRankingType('neighbourhood')}
                >
                  <Text style={[styles.toggleText, rankingType === 'neighbourhood' && styles.activeToggleText]}>
                    Neighborhood
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colours.primary} />
                <Text style={styles.loadingText}>Loading leaderboard...</Text>
              </View>
            ) : (
              <>
                {rankingType === 'neighbourhood' && currentUserNeighborhood && (
                  <View style={styles.neighbourhoodHeader}>
                    <Text style={styles.neighbourhoodTitle}>{currentUserNeighborhood}</Text>
                  </View>
                )}

                <FlatList
                  data={usersWithRank.slice(0, 10)}
                  keyExtractor={(item) => item._id || item.id || Math.random().toString()}
                  renderItem={renderItem}
                  contentContainerStyle={styles.listContent}
                />

                {renderCurrentUserRow()}
              </>
            )}
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
  mainContent: { flex: 1, padding: spacing.lg },
  header: { marginBottom: spacing.lg, alignItems: 'center' },
  title: {
    fontSize: typography.sizes.xxl,
    fontWeight: typography.weights.bold,
    color: colours.primary,
    marginBottom: spacing.md,
  },
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colours.offWhite,
    borderRadius: 20,
    padding: spacing.xs,
  },
  toggleButton: { paddingVertical: spacing.sm, paddingHorizontal: spacing.lg, borderRadius: 16 },
  activeToggle: { backgroundColor: colours.primaryGreen },
  toggleText: { color: colours.textSecondary, fontSize: typography.sizes.sm },
  activeToggleText: { color: colours.white, fontWeight: typography.weights.bold },

  neighbourhoodHeader: {
    backgroundColor: colours.white,
    padding: spacing.md,
    borderRadius: 12,
    marginBottom: spacing.lg,
    alignItems: 'center',
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  neighbourhoodTitle: { fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colours.primary },
  neighbourhoodSubtitle: { fontSize: typography.sizes.sm, color: colours.textSecondary },

  listContent: { paddingBottom: spacing.lg },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: 12,
    backgroundColor: colours.white,
    shadowColor: colours.shadowDark,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  currentUserRow: {
    backgroundColor: colours.lightGreen + '40',
    borderWidth: 1,
    borderColor: colours.primaryGreen,
  },
  bottomRow: { marginTop: spacing.md },
  rank: { width: 40, fontSize: typography.sizes.lg, fontWeight: typography.weights.bold, color: colours.textSecondary, textAlign: 'center' },
  topRank: { color: colours.primaryOrange },
  nameContainer: { flex: 1, marginHorizontal: spacing.md },
  name: { fontSize: typography.sizes.base, fontWeight: typography.weights.medium, color: colours.textPrimary },
  neighbourhood: { fontSize: typography.sizes.xs, color: colours.textSecondary, fontStyle: 'italic' },
  score: { fontSize: typography.sizes.base, fontWeight: typography.weights.bold, color: colours.primaryOrange },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: spacing.md, color: colours.textSecondary, fontSize: typography.sizes.base },
});
