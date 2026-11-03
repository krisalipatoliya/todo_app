
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  Image,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';

import AsyncStorage from '@react-native-async-storage/async-storage';
import {SafeAreaProvider} from 'react-native-safe-area-context';

import LoginScreen from './src/component/LoginScreen';
import MainApp from './src/MainApp';

const USER_KEY = '@todo_app_logged_in_user';

const App = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  // Splash screen and restore saved login
  useEffect(() => {
    let mounted = true;

    const restoreLogin = async () => {
      try {
        const savedUser = await AsyncStorage.getItem(USER_KEY);

        if (savedUser && mounted) {
          const parsedUser = JSON.parse(savedUser);

          if (parsedUser?.name) {
            setUser(parsedUser);
          }
        }
      } catch (error) {
        console.log('Restore login error:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    restoreLogin();

    const timer = setTimeout(() => {
      if (mounted) {
        setShowSplash(false);
      }
    }, 3000);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Login and save user
  const handleLogin = async userData => {
    try {
      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(userData),
      );

      setUser(userData);
    } catch (error) {
      console.log('Login save error:', error);
      setUser(userData);
    }
  };

  // Update profile and saved user
  const handleProfileUpdate = async updatedProfile => {
    const updatedUser = {
      ...user,
      ...updatedProfile,
    };

    try {
      await AsyncStorage.setItem(
        USER_KEY,
        JSON.stringify(updatedUser),
      );
    } catch (error) {
      console.log('Profile update error:', error);
    }

    setUser(updatedUser);
  };

  // Logout and remove saved login
  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem(USER_KEY);
      setUser(null);
    } catch (error) {
      console.log('Logout error:', error);
    }
  };

  return (
    <SafeAreaProvider>
      {showSplash || loading ? (
        <View style={styles.splash}>
          <Image
            source={require('./src/assets/app-icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          <Text style={styles.appName}>
            TODO
          </Text>

          {loading && !showSplash && (
            <ActivityIndicator
              size="small"
              color="#394B70"
              style={styles.loader}
            />
          )}
        </View>
      ) : user ? (
        <MainApp
          user={user}
          onUserUpdate={handleProfileUpdate}
          onLogout={handleLogout}
        />
      ) : (
        <LoginScreen onLogin={handleLogin} />
      )}
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  splash: {
    flex: 1,
    backgroundColor: '#F7F9FC',
    justifyContent: 'center',
    alignItems: 'center',
  },

  logo: {
    width: 160,
    height: 160,
  },

  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#394B70',
    marginTop: 20,
  },

  loader: {
    marginTop: 20,
  },
});

export default App;
