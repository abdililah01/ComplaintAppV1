// mon-app-frontend/App.js
import 'react-native-gesture-handler'; // keep this first
import 'react-native-reanimated';

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import TRX API early to trigger the debug logs
import { trxApi } from './src/api/trx';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';
import TrackComplaintScreen from './src/screens/TrackComplaintScreen';

// Keep native splash visible until we say otherwise
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

// React Query client
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: false } },
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  // Health check (runs once)
  useEffect(() => {
    console.log('🚀 App mounted, running TRX /healthz ...');
    trxApi
      .get('/healthz')
      .then(res => {
        console.log('🏥 TRX /healthz OK:', res.data);
        console.log('📡 Status:', res.status);
        console.log('🔗 baseURL:', trxApi.defaults.baseURL);
      })
      .catch(err => {
        console.error('❌ TRX health-check FAILED:', err.message);
        if (err.response) {
          console.error('📤 Status:', err.response.status);
          console.error('📤 Data:', err.response.data);
        } else if (err.request) {
          console.error('📡 No response. Tried:', trxApi.defaults.baseURL + '/healthz');
        }
      });
  }, []);

  // Simulate preloading (fonts/assets/secure storage/etc.)
  useEffect(() => {
    (async () => {
      console.log('⏳ Initializing app ...');
      // TODO: preload fonts/assets here if needed
      await new Promise(res => setTimeout(res, 800));
      console.log('✅ Initialization done');
      setAppIsReady(true);
    })();
  }, []);

  // Hide native splash once root view layout is done and app is ready
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      console.log('🎬 Hiding native splash');
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // While loading, keep native splash by returning null
  if (!appIsReady) {
    console.log('⌛ App not ready yet: showing native splash');
    return null;
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
