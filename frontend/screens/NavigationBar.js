import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colours, spacing, typography } from '../theme';

const NavigationBar = ({ navigation }) => {
  const [hoveredNav, setHoveredNav] = useState(null);

  const mainNavItems = [
    { key: 'home', name: 'ECOmmerce', icon: 'home', color: colours.primary },
    { key: 'leaderboard', name: 'Leaderboard', icon: 'trophy', color: colours.textSecondary },
    { key: 'upload', name: 'Upload', icon: 'cloud-upload-outline', color: colours.textSecondary },
    { key: 'voucher', name: 'Vouchers', icon: 'gift-outline', color: colours.primary },
  ];

  const bottomNavItems = [
    { key: 'profile', name: 'Profile', icon: 'person-circle', color: colours.primary },
    { key: 'logout', name: 'Logout', icon: 'log-out-outline', color: colours.error },
  ];

  const handleNavPress = (key) => {
    if (key === 'home') navigation.navigate('Home');
    else if (key === 'leaderboard') navigation.navigate('Leaderboard');
    else if (key === 'upload') navigation.navigate('Upload');
    else if (key === 'voucher') navigation.navigate('VoucherScreen');
    else if (key === 'profile') navigation.navigate('Profile');
    else if (key === 'logout') navigation.navigate('Logout');
  };

  const renderNavItems = (items) => (
    items.map((item) => (
      <TouchableOpacity
        key={item.key}
        style={[
          styles.navItem,
          hoveredNav === item.key && styles.navItemHover,
        ]}
        onPress={() => handleNavPress(item.key)}
        onMouseEnter={() => setHoveredNav(item.key)}
        onMouseLeave={() => setHoveredNav(null)}
      >
        <Ionicons name={item.icon} size={28} color={item.color} />
        <Text style={styles.navText}>
          {item.name}
        </Text>
      </TouchableOpacity>
    ))
  );

  return (
    <View style={styles.sidebar}>
      <View style={styles.topSection}>
        {renderNavItems(mainNavItems)}
      </View>
      <View style={styles.bottomSection}>
        {renderNavItems(bottomNavItems)}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  sidebar: {
    width: 80,
    backgroundColor: colours.surface,
    paddingTop: spacing.xl,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between',
    paddingBottom: spacing.xl, 
  },
  topSection: {
    alignItems: 'center',
  },
  bottomSection: {
    alignItems: 'center',
  },
  navItem: {
    marginBottom: spacing.lg,
    alignItems: 'center',
    borderRadius: spacing.md,
    padding: spacing.sm,
    transition: 'background-color 0.2s',
  },
  navItemHover: {
    backgroundColor: colours.muted,
  },
  navText: {
    color: colours.textSecondary,
    fontSize: typography.sizes.xs,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
});

export default NavigationBar;