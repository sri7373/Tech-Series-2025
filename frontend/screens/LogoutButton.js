import React from 'react';
import { TouchableOpacity, Text, Alert, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LogoutButton({ navigation }) {
  const handleLogout = () => {
    console.log("Pressed logout"); // check if this prints
    Alert.alert(
      "Confirm Logout",
      "Are you sure you want to log out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => navigation.replace("Login")
        }
      ]
    );
  };

  return (
    <TouchableOpacity style={styles.button} onPress={handleLogout}>
      <Ionicons name="log-out-outline" size={28} color="#FF3B30" />
      <Text style={styles.text}>Logout</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: { 
    alignItems: 'center', 
    marginBottom: 20 
  },
  text: { 
    color: '#FF3B30', 
    fontSize: 12, 
    textAlign: 'center' 
  },
});
