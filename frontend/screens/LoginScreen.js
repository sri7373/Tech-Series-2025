import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

const handleLogin = async () => {
  try {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    console.log('Login response:', response.status, data); // Add this line
    if (response.ok) {
      // 🔑 Save the token for later use
      await AsyncStorage.setItem('userToken', data.token);

      navigation.navigate('Home');
    } else {
      Alert.alert('Login Failed', data.error || 'Invalid credentials');
    }
  } catch (err) {
    Alert.alert('Error', 'Could not connect to server');
  }
};

  return (
    <View style={styles.container}>
      {/* Email Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      {/* Password Input */}
      <TextInput
        style={styles.input}
        placeholder="Enter your password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      {/* Forgot Password */}
      <TouchableOpacity onPress={() => Alert.alert('Forgot Password clicked')}>
        <Text style={styles.linkText}>Forget password?</Text>
      </TouchableOpacity>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleLogin}
      >
        <Text style={styles.loginText}>Login</Text>
      </TouchableOpacity>

      {/* Sign Up */}
      <TouchableOpacity onPress={() => Alert.alert('Sign Up clicked')}>
        <Text style={styles.signupText}>
          Don’t have an account? <Text style={{ fontWeight: 'bold' }}>Sign up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 15,
    fontSize: 16,
  },
  linkText: {
    color: 'blue',
    alignSelf: 'flex-end',
    marginBottom: 30,
  },
  loginButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  loginText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  signupText: {
    fontSize: 14,
    color: '#333',
  },
});
