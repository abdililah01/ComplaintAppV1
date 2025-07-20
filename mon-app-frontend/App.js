// App.js
import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as SplashScreen from 'expo-splash-screen';

// Importation des écrans de l'application
import HomeScreen from './src/screens/HomeScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';
import TrackComplaintScreen from './src/screens/TrackComplaintScreen';

// Cette ligne est cruciale : elle empêche le splash screen natif de disparaître automatiquement.
SplashScreen.preventAutoHideAsync();

const Stack = createNativeStackNavigator();

export default function App() {

    // Ce "hook" gère le moment où le splash screen doit être masqué.
    useEffect(() => {
        const prepareApp = async () => {
            try {
                // Ici, on pourrait charger des polices, des données initiales, vérifier une connexion, etc.
                // Pour l'instant, nous simulons simplement un petit temps de chargement pour un effet fluide.
                await new Promise(resolve => setTimeout(resolve, 2000)); // Attend 2 secondes
            } catch (e) {
                console.warn(e);
            } finally {
                // Une fois que l'application est prête, on masque le splash screen.
                await SplashScreen.hideAsync();
            }
        };

        prepareApp();
    }, []);

    return (
        <NavigationContainer>
            <Stack.Navigator
                // L'écran initial est maintenant "Home". Le splash est géré au-dessus.
                initialRouteName="Home"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#3A4F53', // Vert ardoise foncé
                    },
                    headerTintColor: '#FFFFFF',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                    headerTitleAlign: 'center',
                }}
            >
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }} // Le header est caché sur l'écran d'accueil
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
    );
}