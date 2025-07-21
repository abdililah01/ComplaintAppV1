// App.js
import React, { useEffect, useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Écrans de l'app
import HomeScreen from './src/screens/HomeScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';
import TrackComplaintScreen from './src/screens/TrackComplaintScreen';

// Splash animé
import AnimatedSplash from './src/screens/AnimatedSplash';

// Ne pas auto‐cacher le splash natif
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {
    const [appIsReady, setAppIsReady] = useState(false);
    const [animDone, setAnimDone] = useState(false);

    // Pré‐chargement (fonts, data, etc.)
    useEffect(() => {
        (async () => {
            try {
                // Simule un chargement
                await new Promise(res => setTimeout(res, 2000));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
            }
        })();
    }, []);

    // Une fois prêt, on cache le splash natif
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);

    if (!appIsReady) {
        return null; // reste sur splash natif
    }

    if (!animDone) {
        return <AnimatedSplash onEnd={() => setAnimDone(true)} />;
    }

    return (
        <View style={styles.container} onLayout={onLayoutRootView}>
            <NavigationContainer>
                <Stack.Navigator
                    initialRouteName="Home"
                    screenOptions={{
                        headerStyle: { backgroundColor: '#3A4F53' },
                        headerTintColor: '#fff',
                        headerTitleStyle: { fontWeight: 'bold' },
                        headerTitleAlign: 'center'
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
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 }
});
