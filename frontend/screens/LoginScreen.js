import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colours, spacing, typography } from '../theme';
import { useAuth } from '../contexts/AuthContext';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter both email and password');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        await AsyncStorage.setItem('token', data.token);
        await AsyncStorage.setItem('userId', data.user._id);
        await AsyncStorage.setItem('userPoints', data.user.points.toString());
        await AsyncStorage.setItem('username', data.user.username || '');
        await AsyncStorage.setItem('email', data.user.email || '');
        await AsyncStorage.setItem('neighbourhood', data.user.neighbourhood || '');
        navigation.replace('Home');
      } else {
        Alert.alert('Login Failed', data.error || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Error', 'Could not connect to server');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/leafy.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>ECOmmerce</Text>

          <TextInput
            style={styles.input}
            placeholder="Enter your email"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            placeholderTextColor={colours.mediumGray}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholderTextColor={colours.mediumGray}
          />

          <TouchableOpacity onPress={() => Alert.alert('Forgot Password clicked')}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>
              Don’t have an account? <Text style={styles.signupBold}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', height: '100%' },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(248,248,248,0.7)', // softer overlay
    padding: spacing.lg,
  },
  card: {
    width: '90%',
    backgroundColor: colours.cardBackground,
    borderRadius: spacing.lg,
    padding: spacing.xl,
    shadowColor: colours.black,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 6,
    alignItems: 'center',
  },
  title: {
    fontFamily: typography.families.heading,
    fontSize: typography.sizes.xxxl,
    fontWeight: typography.weights.bold,
    color: colours.primaryGreen,
    marginBottom: spacing.lg,
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: colours.borderLight,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.md,
    fontSize: typography.sizes.base,
    fontFamily: typography.families.primary,
    color: colours.textPrimary,
    backgroundColor: colours.white,
  },
  linkText: {
    fontFamily: typography.families.primary,
    fontSize: typography.sizes.sm,
    color: colours.primaryOrange,
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    fontWeight: typography.weights.medium,
  },
  loginButton: {
    width: '100%',
    backgroundColor: colours.primaryGreen,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.md,
  },
  loginText: {
    fontFamily: typography.families.primary,
    color: colours.textInverted,
    fontSize: typography.sizes.base,
    fontWeight: typography.weights.semiBold,
  },
  signupText: {
    fontFamily: typography.families.primary,
    fontSize: typography.sizes.sm,
    color: colours.textSecondary,
    textAlign: 'center',
  },
  signupBold: { fontWeight: typography.weights.bold, color: colours.primaryGreen },
});
