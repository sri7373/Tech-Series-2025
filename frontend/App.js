import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import Leaderboard from './screens/LeaderBoard';
import Upload from './screens/Upload'; // New Upload screen
import PointsPage from './screens/PointsPage'; // Optional: points page after upload
// import ProductDetail from './screens/ProductDetail';
// import LogoutButton from './screens/LogoutButton';
import ProfileScreen from './screens/ProfileScreen';
import AutoProductScreen from './screens/AutoProductScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Home',
            headerLeft: () => null,
          }}
        />
        <Stack.Screen
          name="Leaderboard"
          component={Leaderboard}
          options={{ title: 'Leaderboard' }}
        />
        <Stack.Screen
          name="Upload"
          component={Upload}
          options={{ title: 'Upload Image', headerShown: false }}
        />
        <Stack.Screen
          name="Points"
          component={PointsPage}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Auto"
          component={AutoProductScreen}
          options={{ title: 'Smart Products' }}
        />
        <Stack.Screen name="Profile" component={ProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
