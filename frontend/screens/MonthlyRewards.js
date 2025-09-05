import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView, ActivityIndicator, StyleSheet, RefreshControl } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MonthlyRewardsScreen({ navigation }) {
  const [rewardsData, setRewardsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRewardsData();
  }, []);

  const fetchRewardsData = async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert('Error', 'Please log in first');
        navigation.replace('Login');
        return;
      }

      const response = await fetch('http://localhost:3000/api/rewards/monthly-rewards/check', {
        headers: { 'x-auth-token': token }
      });

      if (response.ok) {
        const data = await response.json();
        setRewardsData(data);
      } else {
        throw new Error('Failed to fetch rewards data');
      }
    } catch (err) {
      console.error('Error fetching rewards:', err);
      Alert.alert('Error', 'Failed to load monthly rewards data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchRewardsData();
    setRefreshing(false);
  };

  const handleClaimRewards = async () => {
    const unclaimedRewards = rewardsData?.availableRewards.filter(r => r.eligible && !r.claimed) || [];
    
    if (unclaimedRewards.length === 0) {
      Alert.alert('No Rewards', 'No rewards available to claim at this time.');
      return;
    }

    setClaiming(true);
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/rewards/monthly-rewards/claim', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-auth-token': token 
        }
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert(
          'Success!', 
          `${result.message}\n\nVouchers claimed: ${result.claimedVouchers.length}\nTotal value: $${result.totalAmount}`,
          [{ text: 'OK', onPress: () => fetchRewardsData() }]
        );
      } else {
        Alert.alert('Error', result.error || 'Failed to claim rewards');
      }
    } catch (err) {
      console.error('Claim error:', err);
      Alert.alert('Error', 'Failed to claim rewards');
    } finally {
      setClaiming(false);
    }
  };

  const getRewardIcon = (type) => {
    switch (type) {
      case '500_points': return '🎯';
      case 'national_top5': return '🏆';
      case 'neighbourhood_top3': return '🥇';
      default: return '🎁';
    }
  };

  const getRewardTitle = (type) => {
    switch (type) {
      case '500_points': return 'Monthly Champion';
      case 'national_top5': return 'National Elite';
      case 'neighbourhood_top3': return 'Local Hero';
      default: return 'Reward';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Loading monthly rewards...</Text>
      </View>
    );
  }

  const unclaimedRewards = rewardsData?.availableRewards.filter(r => r.eligible && !r.claimed) || [];
  const hasUnclaimedRewards = unclaimedRewards.length > 0;

  return (
    <ScrollView 
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Monthly Rewards</Text>
        <Text style={styles.subtitle}>
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </Text>
      </View>

      {/* Stats Card */}
      <View style={styles.statsCard}>
        <Text style={styles.statsTitle}>Your Monthly Progress</Text>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{rewardsData?.points || 0}</Text>
            <Text style={styles.statLabel}>Monthly Points</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>#{rewardsData?.nationalRank || '-'}</Text>
            <Text style={styles.statLabel}>National Rank</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>#{rewardsData?.neighbourhoodRank || '-'}</Text>
            <Text style={styles.statLabel}>Local Rank</Text>
          </View>
        </View>
      </View>

      {/* Progress Bar for 500 points */}
      <View style={styles.progressCard}>
        <Text style={styles.progressTitle}>Progress to $10 Voucher</Text>
        <View style={styles.progressBarContainer}>
          <View 
            style={[
              styles.progressBar, 
              { width: `${Math.min((rewardsData?.points || 0) / 500 * 100, 100)}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {rewardsData?.points || 0} / 500 points
        </Text>
      </View>

      {/* Rewards Section */}
      <View style={styles.rewardsSection}>
        <Text style={styles.sectionTitle}>Available Rewards</Text>
        
        {rewardsData?.availableRewards.length === 0 ? (
          <View style={styles.noRewardsCard}>
            <Text style={styles.noRewardsText}>Keep earning points to unlock rewards!</Text>
            <Text style={styles.noRewardsSubtext}>
              Reach 500 monthly points or climb the leaderboards to earn vouchers
            </Text>
          </View>
        ) : (
          rewardsData?.availableRewards.map((reward, index) => (
            <View key={index} style={[
              styles.rewardCard,
              reward.claimed ? styles.claimedCard : 
              reward.eligible ? styles.eligibleCard : styles.ineligibleCard
            ]}>
              <View style={styles.rewardHeader}>
                <Text style={styles.rewardIcon}>{getRewardIcon(reward.type)}</Text>
                <View style={styles.rewardInfo}>
                  <Text style={styles.rewardTitle}>{getRewardTitle(reward.type)}</Text>
                  <Text style={styles.rewardDescription}>{reward.description}</Text>
                </View>
                <View style={styles.rewardAmount}>
                  <Text style={styles.amountText}>${reward.amount}</Text>
                </View>
              </View>
              
              <View style={styles.rewardFooter}>
                <View style={[
                  styles.statusBadge,
                  reward.claimed ? styles.claimedBadge : 
                  reward.eligible ? styles.eligibleBadge : styles.ineligibleBadge
                ]}>
                  <Text style={[
                    styles.statusText,
                    reward.claimed ? styles.claimedText : 
                    reward.eligible ? styles.eligibleText : styles.ineligibleText
                  ]}>
                    {reward.claimed ? '✓ Claimed' : reward.eligible ? '✓ Ready to Claim' : '⏳ Not Yet Eligible'}
                  </Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      {/* Claim Button */}
      {hasUnclaimedRewards && (
        <View style={styles.claimSection}>
          <View style={styles.claimSummary}>
            <Text style={styles.claimSummaryTitle}>Ready to Claim</Text>
            <Text style={styles.claimSummaryAmount}>
              Total Value: ${rewardsData?.totalAmount}
            </Text>
            <Text style={styles.claimSummaryCount}>
              {unclaimedRewards.length} reward{unclaimedRewards.length !== 1 ? 's' : ''}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.claimButton, claiming && styles.claimButtonDisabled]}
            onPress={handleClaimRewards}
            disabled={claiming}
          >
            {claiming ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.claimButtonText}>Claim All Rewards</Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* Info Section */}
      <View style={styles.infoSection}>
        <Text style={styles.infoTitle}>How to Earn Rewards</Text>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>🎯</Text>
          <Text style={styles.infoText}>Earn 500 monthly points for a $10 voucher</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>🏆</Text>
          <Text style={styles.infoText}>Reach top 5 nationally for a $15 voucher</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>🥇</Text>
          <Text style={styles.infoText}>Reach top 3 in your area for a $15 voucher</Text>
        </View>
        <View style={styles.infoItem}>
          <Text style={styles.infoIcon}>💰</Text>
          <Text style={styles.infoText}>Stack rewards for up to $30 per month!</Text>
        </View>
      </View>

      {/* Navigation Buttons */}
      <View style={styles.navigationSection}>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('Leaderboard')}
        >
          <Text style={styles.navButtonText}>View Leaderboard</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.navButton}
          onPress={() => navigation.navigate('VoucherScreen')}
        >
          <Text style={styles.navButtonText}>My Vouchers</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5'
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5'
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666'
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.9)'
  },
  statsCard: {
    backgroundColor: 'white',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center'
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around'
  },
  statItem: {
    alignItems: 'center'
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4
  },
  progressCard: {
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 20,
    borderRadius: 12,
    elevation: 2
  },
  progressTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center'
  },
  progressBarContainer: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    marginBottom: 8
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4
  },
  progressText: {
    textAlign: 'center',
    fontSize: 14,
    color: '#666'
  },
  rewardsSection: {
    marginHorizontal: 16
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333'
  },
  noRewardsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 16
  },
  noRewardsText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8
  },
  noRewardsSubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center'
  },
  rewardCard: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 2
  },
  eligibleCard: {
    borderColor: '#4CAF50',
    backgroundColor: '#f8fff8'
  },
  claimedCard: {
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5'
  },
  ineligibleCard: {
    borderColor: '#e0e0e0'
  },
  rewardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  rewardIcon: {
    fontSize: 24,
    marginRight: 12
  },
  rewardInfo: {
    flex: 1
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333'
  },
  rewardDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 2
  },
  rewardAmount: {
    alignItems: 'center'
  },
  amountText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#4CAF50'
  },
  rewardFooter: {
    alignItems: 'flex-end'
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12
  },
  eligibleBadge: {
    backgroundColor: '#4CAF50'
  },
  claimedBadge: {
    backgroundColor: '#ccc'
  },
  ineligibleBadge: {
    backgroundColor: '#e0e0e0'
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold'
  },
  eligibleText: {
    color: 'white'
  },
  claimedText: {
    color: 'white'
  },
  ineligibleText: {
    color: '#666'
  },
  claimSection: {
    margin: 16,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 2
  },
  claimSummary: {
    alignItems: 'center',
    marginBottom: 20
  },
  claimSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333'
  },
  claimSummaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#4CAF50',
    marginVertical: 8
  },
  claimSummaryCount: {
    fontSize: 14,
    color: '#666'
  },
  claimButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center'
  },
  claimButtonDisabled: {
    backgroundColor: '#ccc'
  },
  claimButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold'
  },
  infoSection: {
    margin: 16,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    elevation: 2
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
    color: '#333'
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 30
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#666'
  },
  navigationSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    margin: 16,
    marginBottom: 32
  },
  navButton: {
    flex: 1,
    backgroundColor: '#2196F3',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 8
  },
  navButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold'
  }
});

