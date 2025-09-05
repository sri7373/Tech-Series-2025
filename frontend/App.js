import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { AuthProvider, useAuth } from './contexts/AuthContext';

// Import screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import Leaderboard from './screens/LeaderBoard';
import Upload from './screens/Upload'; // New Upload screen
import PointsPage from './screens/PointsPage'; // Optional: points page after upload
// import ProductDetail from './screens/ProductDetail';
import VoucherScreen from './screens/Vouchers';
import LogoutButton from './screens/LogoutButton';
import ProfileScreen from './screens/ProfileScreen';
import AutoProductScreen from './screens/AutoProductScreen';
import RecommendationsScreen from './screens/RecommendationsScreen';
import ReceiptsPoints from './screens/ReceiptsPoints';
import MonthlyRewardsScreen from './screens/MonthlyRewards';

const Stack = createNativeStackNavigator();

const NAVIGATION_PERSISTENCE_KEY = 'NAVIGATION_STATE';

function AuthNavigator() {
  const { isAuthenticated, loading } = useAuth();
  const[isReady, setIsReady] = React.useState(false);
  const[initialState, setInitialState] = React.useState();

  // Restore navigation state
  React.useEffect(() => {
    const restoreState = async () => {
      try {
        const savedStateString = await AsyncStorage.getItem(NAVIGATION_PERSISTENCE_KEY);
        const state = savedStateString ? JSON.parse(savedStateString) : undefined;

        if (state !== undefined) {
          setInitialState(state);
        }
      } catch (e) {
        console.error('Failed to load navigation state:', e);
      } finally {
        setIsReady(true);
      }
    };

    if (!isReady) {
      restoreState();
    }
  }, [isReady]);

  if (loading || !isReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer
      initialState={initialState}
      onStateChange={(state) => {
        // Only save state for authenticated users
        if (isAuthenticated) {
          AsyncStorage.setItem(NAVIGATION_PERSISTENCE_KEY, JSON.stringify(state));
        }
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: true }}>
        {isAuthenticated ? (
          // Authenticated screens
          <>
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
            name="VoucherScreen"
            component={VoucherScreen}
            options={{ title: 'My Vouchers', headerShown: false }}
          />

          <Stack.Screen
            name="MonthlyRewards"
            component={MonthlyRewardsScreen}
            options={{ title: 'Monthly Rewards', headerShown: false }}
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
          <Stack.Screen
            name="Recommendations"
            component={RecommendationsScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen
            name="ReceiptsPoints"
            component={ReceiptsPoints}
            options={{ title: 'Receipt Points', headerShown: false }}
          />
          <Stack.Screen 
            name="Logout" 
            component={LogoutButton}
            options={{ title: 'Logout' }}
          />
        </>
        ) : (
          // Unauthenticated screens
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AuthNavigator />
    </AuthProvider>
  );
}
