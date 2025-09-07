import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ImageBackground } from 'react-native';
import { colours, spacing, typography } from '../theme';

export default function SignupScreen({ navigation }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [neighbourhood, setNeighbourhood] = useState('');

  const handleSignup = async () => {
    if (!username || !email || !password || !neighbourhood) {
      Alert.alert('Validation Error', 'Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:3000/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password, neighbourhood }),
      });

      const data = await response.json();

      if (response.ok) {
        Alert.alert('Success', 'User created successfully!');
        navigation.goBack();
      } else {
        Alert.alert('Signup Failed', data.error || 'Could not create account.');
      }
    } catch (err) {
      console.error(err);
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
            placeholder="Enter your username"
            value={username}
            onChangeText={setUsername}
            placeholderTextColor={colours.mediumGray}
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your neighbourhood"
            value={neighbourhood}
            onChangeText={setNeighbourhood}
            placeholderTextColor={colours.mediumGray}
          />

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

          <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
            <Text style={styles.loginText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.signupText}>
              Already have an account? <Text style={styles.signupBold}>Login</Text>
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
    backgroundColor: 'rgba(248,248,248,0.7)',
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
