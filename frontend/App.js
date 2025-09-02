import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import Leaderboard from './screens/LeaderBoard';
import Upload from './screens/Upload'; // New Upload screen
import PointsPage from './screens/PointsPage'; // Optional: points page after upload

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        {/* Login Screen */}
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }} 
        />

        {/* Home Screen */}
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          options={{ 
          title: 'Home',
          headerLeft: () => null, // This removes the back button
        }} 
        />

        {/* Leaderboard Screen */}
        <Stack.Screen
          name="Leaderboard"
          component={Leaderboard}
          options={{ title: 'Leaderboard' }}
        />

        {/* Upload Screen */}
        <Stack.Screen
          name="Upload"
          component={Upload}
          options={{ title: 'Upload Image', headerShown: false }} // Hide header for a cleaner blur look
        />

        {/* Points Page (Optional) */}
        <Stack.Screen
          name="Points"
          component={PointsPage}
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
