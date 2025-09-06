// profilescreen.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { ScrollView as RNScrollView } from 'react-native';
import { colours, spacing, typography } from '../theme';
import { globalStyles } from '../theme/globalStyles';
import NavigationBar from './NavigationBar';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [nationalRank, setNationalRank] = useState(null);
  const [neighbourhoodRank, setNeighbourhoodRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [receipts, setReceipts] = useState([]);
  const [dailyStats, setDailyStats] = useState([]);
  const [todayTrend, setTodayTrend] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      try {
        const token = await AsyncStorage.getItem('token');
        const userId = await AsyncStorage.getItem('userId');
        if (!token || !userId) {
          Alert.alert("Not logged in", "Please log in first.");
          setLoading(false);
          return;
        }

        const userResponse = await fetch(`http://localhost:3000/api/users/${userId}`, {
          headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
        });
        const userData = await userResponse.json();
        if (userResponse.ok) {
          setUser(userData);

          const rankResponse = await fetch(`http://localhost:3000/api/leaderboard/ranks/${userId}`);
          const rankData = await rankResponse.json();
          if (rankResponse.ok) {
            setNationalRank(rankData.nationalRank);
            setNeighbourhoodRank(rankData.neighbourhoodRank);
          }

          const receiptsResponse = await fetch(`http://localhost:3000/api/receipts/history/${userId}`, {
            headers: { 'Content-Type': 'application/json', 'x-auth-token': token }
          });
          const receiptsData = await receiptsResponse.json();
          if (receiptsResponse.ok) {
            setReceipts(receiptsData);

            const statsByDay = {};
            receiptsData.forEach(r => {
              const day = r.uploadedAt.slice(0, 10);
              if (!statsByDay[day]) {
                statsByDay[day] = { ecoPoints: 0, carbon: 0, plastic: 0 };
              }
              statsByDay[day].ecoPoints += r.points || 0;
              statsByDay[day].carbon += r.carbonEmissions || 0;
              statsByDay[day].plastic += r.plasticUsage || 0;
            });
            const dailyStatsArr = Object.entries(statsByDay)
              .map(([date, stats]) => ({ date, ...stats }))
              .sort((a, b) => b.date.localeCompare(a.date));
            setDailyStats(dailyStatsArr);

            if (dailyStatsArr.length >= 2) {
              const today = dailyStatsArr[0];
              const yesterday = dailyStatsArr[1];
              const percentChange = yesterday.ecoPoints === 0
                ? 100
                : Math.round(((today.ecoPoints - yesterday.ecoPoints) / yesterday.ecoPoints) * 100);
              setTodayTrend(percentChange);
            } else {
              setTodayTrend(null);
            }
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

  const sortedStats = [...dailyStats].sort((a, b) => a.date.localeCompare(b.date));
  const chartLabels = sortedStats.map(stat => {
    const [year, month, day] = stat.date.split('-');
    return `${parseInt(day)}/${parseInt(month)}`;
  });
  const pointsData = sortedStats.map(stat => stat.ecoPoints);
  const pointsChartData = {
    labels: chartLabels,
    datasets: [{ data: pointsData, color: (opacity = 1) => `rgba(46,139,87,${opacity})`, strokeWidth: 3 }]
  };
  const minPointWidth = 40;
  const chartWidth = Math.max(Dimensions.get('window').width * 0.9, pointsData.length * minPointWidth);

  if (loading) {
    return (
      <ImageBackground source={require('../assets/leafy.jpg')} style={styles.background} resizeMode="cover">
        <View style={styles.centeredOverlay}>
          <ActivityIndicator size="large" color={colours.primaryGreen} />
        </View>
      </ImageBackground>
    );
  }

  if (!user) {
    return (
      <ImageBackground source={require('../assets/leafy.jpg')} style={styles.background} resizeMode="cover">
        <View style={styles.centeredOverlay}>
          <Text style={{ color: colours.textSecondary }}>No user data found.</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground source={require('../assets/leafy.jpg')} style={styles.background} resizeMode="cover">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {/* Sidebar */}
          <NavigationBar navigation={navigation} />

          {/* Main Content */}
          <View style={styles.mainContent}>
            {/* Header */}
            <View style={styles.headerBar}>
              <Text style={styles.headerTitle}>Profile</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
              {/* Avatar + Info */}
              <View style={[globalStyles.card, styles.avatarCard]}>
                <Ionicons name="person-circle" size={100} color={colours.primaryGreen} style={{ marginBottom: spacing.sm }} />
                <Text style={styles.username}>{user.username}</Text>
                <Text style={styles.email}>{user.email}</Text>
                {user.neighbourhood && <Text style={styles.neighbourhood}>{user.neighbourhood}</Text>}
              </View>

              {/* Eco Points */}
              <View style={[globalStyles.card, styles.pointsContainer]}>
                <Ionicons name="star" size={24} color="#FFD700" />
                <Text style={styles.pointsText}>{user.points} Points</Text>
              </View>

              {/* Eco Journey */}
              <View style={[globalStyles.card, styles.dashboardSection]}>
                <Text style={styles.sectionTitle}>Eco Journey Dashboard</Text>
                {todayTrend !== null && (
                  <Text style={styles.trendText}>
                    {todayTrend >= 0 ? `Up ${todayTrend}% vs yesterday` : `Down ${Math.abs(todayTrend)}% vs yesterday`}
                  </Text>
                )}
                {sortedStats.length > 0 && (
                  <RNScrollView horizontal showsHorizontalScrollIndicator={false} style={{ width: '100%' }}>
                    <LineChart
                      data={pointsChartData}
                      width={chartWidth}
                      height={220}
                      yAxisSuffix=" pts"
                      chartConfig={{
                        backgroundColor: colours.white,
                        backgroundGradientFrom: colours.white,
                        backgroundGradientTo: colours.white,
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(46,139,87,${opacity})`,
                        labelColor: (opacity = 1) => `rgba(51,51,51,${opacity})`,
                        propsForDots: { r: '5', strokeWidth: '2', stroke: colours.lightGreen }
                      }}
                      style={{ borderRadius: 12 }}
                      bezier
                      fromZero
                    />
                  </RNScrollView>
                )}
              </View>

              {/* Rankings */}
              <View style={[globalStyles.card, styles.rankSection]}>
                <Text style={styles.sectionTitle}>Your Rankings</Text>
                <View style={styles.rankContainer}>
                  <Ionicons name="trophy" size={24} color={colours.primaryOrange} />
                  <Text style={styles.rankText}>National Rank: #{nationalRank || 'N/A'}</Text>
                </View>
                {user.neighbourhood && (
                  <View style={styles.rankContainer}>
                    <Ionicons name="location" size={24} color={colours.success} />
                    <View>
                      <Text style={styles.rankText}>Neighbourhood Rank: #{neighbourhoodRank || 'N/A'}</Text>
                      <Text style={styles.rankSubtext}>In {user.neighbourhood}</Text>
                    </View>
                  </View>
                )}
              </View>
            </ScrollView>
          </View>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  overlay: { flex: 1, backgroundColor: 'rgba(255,255,255,0.9)' },
  container: { flex: 1, flexDirection: 'row' },
  mainContent: { flex: 1 },

  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colours.white,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colours.borderLight,
    shadowColor: colours.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerTitle: { fontSize: typography.sizes.xl, fontWeight: typography.weights.bold, color: colours.primary },

  scrollContent: { padding: spacing.lg },

  avatarCard: { alignItems: 'center' },
  username: { fontSize: 22, fontWeight: 'bold', color: colours.primaryGreen, marginBottom: spacing.xs },
  email: { fontSize: 16, color: colours.textSecondary, marginBottom: spacing.xs },
  neighbourhood: { fontSize: 16, color: colours.mediumGray },

  pointsContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  pointsText: { fontSize: 18, fontWeight: 'bold', marginLeft: spacing.sm, color: colours.darkGray },

  dashboardSection: { alignItems: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: spacing.sm, color: colours.textPrimary },
  trendText: { fontSize: 14, color: colours.success, marginBottom: spacing.sm },

  rankSection: {},
  rankContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm, gap: spacing.sm },
  rankText: { fontSize: 16, fontWeight: 'bold', color: colours.textPrimary },
  rankSubtext: { fontSize: 14, color: colours.textSecondary },

  centeredOverlay: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.9)' },
});
