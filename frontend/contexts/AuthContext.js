import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  // Check for existing authentication on app start
  useEffect(() => {
    checkAuthState();
  }, []);

  const clearAuthData = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'userData', 'userId', 'NAVIGATION_STATE_V1']);
      console.log('Auth data cleared successfully');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  };

  const verifyTokenWithBackend = async (storedToken) => {
    try {
      const response = await fetch('http://localhost:3000/api/auth/verify-token', {
        method: 'GET',
        headers: {
          'x-auth-token': storedToken,
        },
      });

      if (response.ok) {
        const data = await response.json();
        return { valid: true, user: data.user };
      } else {
        return { valid: false };
      }
    } catch (error) {
      console.error('Token verification failed:', error);
      return { valid: false };
    }
  };

  const checkAuthState = async () => {
    try {
      console.log('Checking auth state...');
      const storedToken = await AsyncStorage.getItem('token');
      const storedUser = await AsyncStorage.getItem('userData');
      
      if (storedToken && storedUser) {
        console.log('Found stored credentials, verifying with backend...');
        
        // Verify token with backend
        const verification = await verifyTokenWithBackend(storedToken);
        
        if (verification.valid) {
          console.log('Token is valid');
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
        } else {
          console.log('Token is invalid, clearing stored data');
          await clearAuthData();
          setToken(null);
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        console.log('No stored credentials found');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (userData, authToken) => {
    try {
      await AsyncStorage.setItem('token', authToken);
      await AsyncStorage.setItem('userData', JSON.stringify(userData));
      await AsyncStorage.setItem('userId', userData._id);
      
      setToken(authToken);
      setUser(userData);
      setIsAuthenticated(true);
      
      console.log('User logged in successfully');
    } catch (error) {
      console.error('Error storing auth data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('Starting logout process...');
      
      // Call backend logout if token exists
      if (token) {
        try {
          await fetch('http://localhost:3000/api/auth/logout', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-auth-token': token,
            },
          });
          console.log('Backend logout successful');
        } catch (backendError) {
          console.error('Backend logout failed:', backendError);
          // Continue with local logout even if backend fails
        }
      }

      // Clear all local data (only call this once)
      await clearAuthData();
      
      // Reset state
      setToken(null);
      setUser(null);
      setIsAuthenticated(false);
      
      console.log('User logged out successfully');
    } catch (error) {
      console.error('Error during logout:', error);
      
      // Force logout even if there's an error
      try {
        await clearAuthData();
        setToken(null);
        setUser(null);
        setIsAuthenticated(false);
        console.log('Force logout completed');
      } catch (forceError) {
        console.error('Force logout error:', forceError);
      }
    }
  };

  const value = {
    isAuthenticated,
    user,
    token,
    loading,
    login,
    logout,
    checkAuthState
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};