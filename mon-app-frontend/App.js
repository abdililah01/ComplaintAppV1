// mon-app-frontend/App.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';
import TrackComplaintScreen from './src/screens/TrackComplaintScreen';
import AnimatedSplash from './src/screens/AnimatedSplash';

// Do not auto-hide the native splash screen
SplashScreen.preventAutoHideAsync();

// React-Navigation & React-Query setup
const Stack = createNativeStackNavigator();
const queryClient = new QueryClient();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [animDone, setAnimDone] = useState(false);

  // Simulate any pre-loading you need (fonts, secure storage, etc.)
  useEffect(() => {
    (async () => {
      await new Promise(res => setTimeout(res, 2000)); // mock load
      setAppIsReady(true);
    })();
  }, []);

  // Hide native splash when the root view has laid out
  const onLayoutRootView = useCallback(async () => {
    if (appIsReady) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  // Still loading → keep native splash
  if (!appIsReady) return null;

  // Show animated splash once
  if (!animDone) return <AnimatedSplash onEnd={() => setAnimDone(true)} />;

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
