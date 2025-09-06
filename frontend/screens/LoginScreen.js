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

      console.log('Login response data:', data);

      if (response.ok) {
        // Use AuthContext login method
        await login(data.user, data.token);

        console.log('Login successful');
        // Store all user data
        await AsyncStorage.setItem('userToken', data.token);
        await AsyncStorage.setItem('userId', data.user._id);
        await AsyncStorage.setItem('userPoints', data.user.points.toString());
        await AsyncStorage.setItem('username', data.user.username || '');
        await AsyncStorage.setItem('email', data.user.email || '');
        await AsyncStorage.setItem('neighbourhood', data.user.neighbourhood || '');

        navigation.replace('Home'); // Using replace to prevent going back

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
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your password"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <TouchableOpacity onPress={() => Alert.alert('Forgot Password clicked')}>
            <Text style={styles.linkText}>Forgot password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <Text style={styles.loginText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.signupText}>
              Don’t have an account? <Text style={{ fontWeight: 'bold' }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(232,245,233,0.5)', // less opaque overlay
    padding: spacing.lg,
  },
  card: {
    width: '90%',
    backgroundColor: colours.surface,
    borderRadius: spacing.lg,
    padding: spacing.xl,
    shadowColor: colours.shadow,
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: typography.title,
    fontWeight: '700',
    color: colours.primary,
    marginBottom: spacing.lg,
  },
  input: {
    width: '100%',
    height: spacing.xl,
    borderWidth: 1,
    borderColor: colours.border,
    borderRadius: spacing.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    fontSize: typography.body,
    backgroundColor: colours.inputBackground,
    color: colours.text,
    fontWeight: '600',
  },
  linkText: {
    color: colours.secondary,
    alignSelf: 'flex-end',
    marginBottom: spacing.lg,
    fontWeight: '600',
  },
  loginButton: {
    width: '100%',
    height: spacing.xl,
    backgroundColor: colours.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: spacing.md,
    marginBottom: spacing.md,
    shadowColor: colours.shadow,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 5,
  },
  loginText: {
    color: colours.surface,
    fontSize: typography.button,
    fontWeight: '700',
  },
  signupText: {
    fontSize: typography.caption,
    color: colours.textSecondary,
    textAlign: 'center',
  },
});
