// mon-app-frontend/App.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// IMPORTANT: Import trxApi early to trigger the debug logs
import { trxApi } from './src/api/trx';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';
import TrackComplaintScreen from './src/screens/TrackComplaintScreen';
import AnimatedSplash from './src/screens/AnimatedSplash';

// Prevent auto-hide of the native splash screen
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// Configure React-Query client with no retry on queries
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [animDone, setAnimDone] = useState(false);

  // Health check effect - runs once when app loads
  useEffect(() => {
    console.log('🚀 App component mounted, running TRX health check...');
    
    trxApi
      .get('/healthz')
      .then(res => {
        console.log('🏥 TRX /healthz SUCCESS:', res.data);
        console.log('📡 Response status:', res.status);
        console.log('🔗 Used baseURL:', trxApi.defaults.baseURL);
      })
      .catch(err => {
        console.error('❌ TRX health-check FAILED:', err.message);
        if (err.response) {
          console.error('📤 Response status:', err.response.status);
          console.error('📤 Response data:', err.response.data);
        } else if (err.request) {
          console.error('📡 No response received - network issue?');
          console.error('🔗 Attempted URL:', trxApi.defaults.baseURL + '/healthz');
        }
      });
  }, []);

  // Simulate preloading (fonts, secure storage, etc.)
  useEffect(() => {
    (async () => {
      console.log('⏳ Simulating app initialization...');
      await new Promise((res) => setTimeout(res, 2000));
      console.log('✅ App initialization complete');
      setAppIsReady(true);
    })();
  }, []);

  // Hide native splash once the root view layout is done
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      console.log('🎬 Hiding native splash screen');
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // While loading, keep native splash
  if (!appIsReady) {
    console.log('⌛ App not ready yet, showing native splash');
    return null;
  }

  // Show animated splash once
  if (!animDone) {
    console.log('🎨 Showing animated splash screen');
    return <AnimatedSplash onEnd={() => setAnimDone(true)} />;
  }

  console.log('🏠 Rendering main navigation');
  return (
    <QueryClientProvider client={queryClient}>
      <View style={styles.container} onLayout={onLayoutRootView}>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Home"
            screenOptions={{
              headerStyle: { backgroundColor: '#3A4F53' },
              headerTintColor: '#fff',
              headerTitleStyle: { fontWeight: 'bold' },
              headerTitleAlign: 'center',
            }}
          >
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ComplaintForm"
              component={ComplaintFormScreen}
              options={{ title: 'وضع شكاية جديدة' }}
            />
            <Stack.Screen
              name="TrackComplaint"
              component={TrackComplaintScreen}
              options={{ title: 'تتبع شكاية موجودة' }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});