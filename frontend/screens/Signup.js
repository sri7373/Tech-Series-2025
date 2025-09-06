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
        navigation.goBack(); // Navigate back to Login screen
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
          />

          <TextInput
            style={styles.input}
            placeholder="Enter your neighbourhood"
            value={neighbourhood}
            onChangeText={setNeighbourhood}
          />

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

          <TouchableOpacity style={styles.loginButton} onPress={handleSignup}>
            <Text style={styles.loginText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.signupText}>
              Already have an account? <Text style={{ fontWeight: 'bold' }}>Login</Text>
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
    backgroundColor: 'rgba(232,245,233,0.5)',
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
  title: { fontSize: typography.title, fontWeight: '700', color: colours.primary, marginBottom: spacing.lg },
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
  loginText: { color: colours.surface, fontSize: typography.button, fontWeight: '700' },
  signupText: { fontSize: typography.caption, color: colours.textSecondary, textAlign: 'center' },
});