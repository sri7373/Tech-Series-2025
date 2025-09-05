import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, ScrollView, Dimensions, ImageBackground } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LineChart } from 'react-native-chart-kit';
import { ScrollView as RNScrollView } from 'react-native'; // alias for horizontal scroll
import { processColor } from 'react-native';
import { colours, spacing, typography } from '../theme';

export default function ProfileScreen() {
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

          // Fetch receipts history for eco journey dashboard
          const receiptsResponse = await fetch(`http://localhost:3000/api/receipts/history/${userId}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token,
            },
          });
          const receiptsData = await receiptsResponse.json();
          if (receiptsResponse.ok) {
            setReceipts(receiptsData);

            // Aggregate receipts by day using uploadedAt
            const statsByDay = {};
            receiptsData.forEach(r => {
              const day = r.uploadedAt.slice(0, 10); // YYYY-MM-DD
              if (!statsByDay[day]) {
                statsByDay[day] = { ecoPoints: 0, carbon: 0, plastic: 0 };
              } 
              statsByDay[day].ecoPoints += r.points || 0;
              statsByDay[day].carbon += r.carbonEmissions || 0;
              statsByDay[day].plastic += r.plasticUsage || 0;
            });
            // Convert to array sorted by date desc
            const dailyStatsArr = Object.entries(statsByDay)
              .map(([date, stats]) => ({ date, ...stats }))
              .sort((a, b) => b.date.localeCompare(a.date));
            setDailyStats(dailyStatsArr);

            // Calculate today's trend vs yesterday
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

  // Prepare line chart data for ecoPoints only
  // Sort dailyStats chronologically (oldest first, newest last)
  const sortedStats = [...dailyStats].sort((a, b) => a.date.localeCompare(b.date));
  const chartLabels = sortedStats.map(stat => {
    const [year, month, day] = stat.date.split('-');
    return `${parseInt(day)}/${parseInt(month)}`; // D/M
  });
  const pointsData = sortedStats.map(stat => stat.ecoPoints);

  // Find today's index (last one in sortedStats)
  const todayIdx = sortedStats.length - 1;

  // Custom dot colors: red for today, green for others
  const getDotColor = (idx) =>
    idx === todayIdx ? "#d32f2f" : "#43a047";

  const pointsChartData = {
    labels: chartLabels,
    datasets: [
      {
        data: pointsData,
        color: (opacity = 1) => `rgba(81, 160, 71, ${opacity})`, // green
        strokeWidth: 3
      }
    ]
  };

  // Calculate chart width based on number of labels (points)
  const minPointWidth = 40;
  const chartWidth = Math.max(Dimensions.get('window').width * 0.9, pointsData.length * minPointWidth);

  if (loading) {
    return (
      <ImageBackground
        source={require('../assets/leafy.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centeredOverlay}>
          <ActivityIndicator size="large" color={colours.primary} />
        </View>
      </ImageBackground>
    );
  }

  if (!user) {
    return (
      <ImageBackground
        source={require('../assets/leafy.jpg')}
        style={styles.background}
        resizeMode="cover"
      >
        <View style={styles.centeredOverlay}>
          <Text style={{ color: colours.text }}>No user data found.</Text>
        </View>
      </ImageBackground>
    );
  }

  return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <ScrollView contentContainerStyle={styles.overlay}>
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
        
        {/* Eco Journey Dashboard */}
        <View style={styles.dashboardSection}>
          <Text style={styles.sectionTitle}>Eco Journey Dashboard</Text>
          {todayTrend !== null && (
            <Text style={styles.trendText}>
              {todayTrend >= 0
                ? `Up ${todayTrend}% in points today compared to yesterday!`
                : `Down ${Math.abs(todayTrend)}% in points today compared to yesterday.`}
            </Text>
          )}

          {/* Full width Eco Points Line Chart */}
          {sortedStats.length > 0 && (
            <RNScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ alignItems: 'center', justifyContent: 'center' }}
              style={{ width: '100%' }}
            >
              <View style={{ position: 'relative' }}>
                <LineChart
                  data={pointsChartData}
                  width={chartWidth}
                  height={220}
                  yAxisLabel=""
                  yAxisSuffix=" pts"
                  chartConfig={{
                    backgroundColor: "#fff",
                    backgroundGradientFrom: "#fff",
                    backgroundGradientTo: "#fff",
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(81, 160, 71, ${opacity})`, // green
                    labelColor: (opacity = 1) => `rgba(51,51,51,${opacity})`,
                    propsForDots: {
                      r: "5",
                      strokeWidth: "2",
                      stroke: "#43a047"
                    },
                    propsForBackgroundLines: {
                      strokeDasharray: "",
                    },
                  }}
                  style={{
                    marginVertical: 4,
                    borderRadius: 12,
                    alignSelf: 'center'
                  }}
                  fromZero
                  bezier
                  renderDotContent={({ index, x, y, indexData }) => (
                    index === todayIdx ? (
                      <View
                        key={index}
                        style={{
                          position: 'absolute',
                          left: x - 6,
                          top: y - 6,
                          width: 12,
                          height: 12,
                          borderRadius: 6,
                          backgroundColor: '#d32f2f',
                          borderWidth: 2,
                          borderColor: '#fff',
                          zIndex: 10,
                        }}
                      />
                    ) : null
                  )}
                />
              </View>
            </RNScrollView>
          )}
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
    flexGrow: 1,
    padding: 20,
    backgroundColor: 'rgba(232,245,233,0.5)', // less opaque overlay
    alignItems: 'center',
  },
  centeredOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(232,245,233,0.5)',
  },
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
  dashboardSection: {
    width: '90%',
    marginTop: 20, // less spacing above
    marginBottom: 0, // less spacing below
    backgroundColor: '#e8f5e9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center'
  },
  trendText: {
    fontSize: 15,
    color: '#388e3c',
    fontWeight: 'bold',
    marginBottom: 6,
    textAlign: 'center'
  },
  dayBlock: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 10,
    marginRight: 8,
    alignItems: 'flex-start',
    minWidth: 130,
    elevation: 2,
    marginBottom: 0
  },
  dayDate: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 2
  },
  dayPoints: {
    fontSize: 13,
    color: '#333',
    marginBottom: 1
  },
  dayCarbon: {
    fontSize: 12,
    color: '#388e3c',
    marginBottom: 1
  },
  dayPlastic: {
    fontSize: 12,
    color: '#1976d2'
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