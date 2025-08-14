// mon-app-frontend/App.js
import 'react-native-gesture-handler';
import 'react-native-reanimated';

import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { trxApi } from './src/api/trx';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';
import TrackComplaintScreen from './src/screens/TrackComplaintScreen';

// Keep native splash visible until we say otherwise
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();
const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        console.log('🚀 Initializing...');
        await trxApi.get('/healthz').catch(() => {});
        // preload anything here if needed
      } finally {
        setAppIsReady(true);
      }
    })();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      console.log('🎬 Hiding native splash');
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady) return null;

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
            <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
            <Stack.Screen name="ComplaintForm" component={ComplaintFormScreen} options={{ title: 'وضع شكاية جديدة' }} />
            <Stack.Screen name="TrackComplaint" component={TrackComplaintScreen} options={{ title: 'تتبع شكاية موجودة' }} />
          </Stack.Navigator>
        </NavigationContainer>
      </View>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
