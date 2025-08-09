import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, View } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { TabBar, Toast } from '../components';
import Auth from './Auth';
import Connect from './connect';
import Dashboard from './Dashboard';
import Feed from './Feed';
import OnboardingScreen from './onboarding';
import Profile from './Profile';

type Theme = 'dark' | 'light';

interface ToastState {
  visible: boolean;
  message: string;
  type: 'success' | 'error';
}

const API_URL = process.env.API_URL || "http://localhost:5000/api/auth";

const Main: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(false);
  const [currentScreen, setCurrentScreen] = useState<'dashboard' | 'feed' | 'connect' | 'profile'>('dashboard');
  const [theme, setTheme] = useState<Theme>('dark');
    const [toast, setToast] = useState<{message: string, type: 'success' | 'error' | 'info', visible: boolean}>({
    message: '',
    type: 'info',
    visible: false,
  });

  useEffect(() => {
    initializeApp();
    
    // Handle app state changes
    const handleAppStateChange = (nextAppState: string) => {
      if (nextAppState === 'active') {
        // Verify token when app becomes active
        verifyAuthToken();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, []);

  const initializeApp = async () => {
    try {
      // Load theme preference
      const savedTheme = await AsyncStorage.getItem('theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setTheme(savedTheme as Theme);
      }

      // Check authentication status
      await verifyAuthToken();
    } catch (error) {
      console.error('Error initializing app:', error);
      setIsAuthenticated(false);
    }
  };

  const verifyAuthToken = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      
      if (!token || !user) {
        setIsAuthenticated(false);
        setNeedsOnboarding(false);
        return;
      }

      // Check if user needs onboarding
      const userData = JSON.parse(user);
      if (!userData.onboardingComplete) {
        setIsAuthenticated(true);
        setNeedsOnboarding(true);
        return;
      }

      // Verify token with server
      const response = await fetch(`${API_URL}/verify-token`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsAuthenticated(true);
        setNeedsOnboarding(false);
      } else {
        // Token is invalid, clear storage
        await AsyncStorage.multiRemove(['token', 'user']);
        setIsAuthenticated(false);
        setNeedsOnboarding(false);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      // On network error, allow user to continue if token exists
      const token = await AsyncStorage.getItem('token');
      const user = await AsyncStorage.getItem('user');
      if (token && user) {
        const userData = JSON.parse(user);
        setIsAuthenticated(true);
        setNeedsOnboarding(!userData.onboardingComplete);
      } else {
        setIsAuthenticated(false);
        setNeedsOnboarding(false);
      }
    }
  };

  const handleLogin = async () => {
    try {
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        if (!userData.onboardingComplete) {
          setNeedsOnboarding(true);
        } else {
          setNeedsOnboarding(false);
        }
      }
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error handling login:', error);
      showToast('Login error occurred', 'error');
    }
  };

  const handleOnboardingComplete = async () => {
    try {
      // Refresh user data from storage after onboarding completion
      const user = await AsyncStorage.getItem('user');
      if (user) {
        const userData = JSON.parse(user);
        if (userData.onboardingComplete) {
          setNeedsOnboarding(false);
          showToast('Profile setup completed!', 'success');
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.multiRemove(['token', 'user']);
      setIsAuthenticated(false);
      setCurrentScreen('dashboard');
      showToast('Logged out successfully', 'success');
    } catch (error) {
      console.error('Logout error:', error);
      showToast('Logout failed', 'error');
    }
  };

  const toggleTheme = async () => {
    try {
      const newTheme = theme === 'dark' ? 'light' : 'dark';
      setTheme(newTheme);
      await AsyncStorage.setItem('theme', newTheme);
      showToast(`Switched to ${newTheme} mode`, 'success');
    } catch (error) {
      console.error('Error saving theme:', error);
      showToast('Failed to save theme preference', 'error');
    }
  };

    const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type, visible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, visible: false }));
    }, 3000);
  }, []);

  // Global error boundary effect
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (...args) => {
      // Log errors for debugging
      originalConsoleError(...args);
      
      // Show user-friendly error messages for critical errors
      const errorMessage = args[0];
      if (typeof errorMessage === 'string') {
        if (errorMessage.includes('Network request failed')) {
          showToast('Network connection error. Please check your internet.', 'error');
        } else if (errorMessage.includes('TypeError') || errorMessage.includes('ReferenceError')) {
          showToast('An unexpected error occurred. Please restart the app.', 'error');
        }
      }
    };

    return () => {
      console.error = originalConsoleError;
    };
  }, []);

  const renderScreen = () => {
    const screenProps = { theme, showToast };
    
    try {
      switch (currentScreen) {
        case 'dashboard':
          return <Dashboard {...screenProps} />;
        case 'feed':
          return <Feed {...screenProps} />;
        case 'connect':
          return <Connect {...screenProps} />;
        case 'profile':
          return <Profile {...screenProps} theme={theme} toggleTheme={toggleTheme} onLogout={handleLogout} />;
        default:
          return <Dashboard {...screenProps} />;
      }
    } catch (error) {
      console.error('Error rendering screen:', error);
      showToast('Screen failed to load. Please try again.', 'error');
      return <Dashboard {...screenProps} />;
    }
  };

  // Show loading state while checking authentication
  if (isAuthenticated === null) {
    return (
      <SafeAreaProvider>
        <View style={[styles.container, { backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC' }]}>
          {/* Add a loading screen here if needed */}
        </View>
      </SafeAreaProvider>
    );
  }

  // Show authentication screen if not authenticated
  if (!isAuthenticated) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC' }]}>
          <Auth theme={theme} showToast={showToast} onLogin={handleLogin} />
          <Toast 
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            theme={theme}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  // Show onboarding screen if user needs to complete onboarding
  if (needsOnboarding) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC' }]}>
          <OnboardingScreen theme={theme} showToast={showToast} onComplete={handleOnboardingComplete} />
          <Toast 
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            theme={theme}
          />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? '#0F0F23' : '#F8FAFC' }]}>
        <View style={styles.content}>
          {renderScreen()}
        </View>
        <TabBar 
          currentScreen={currentScreen} 
          onScreenChange={setCurrentScreen}
          theme={theme}
        />
        <Toast 
          visible={toast.visible}
          message={toast.message}
          type={toast.type}
          theme={theme}
        />
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});

export default Main;