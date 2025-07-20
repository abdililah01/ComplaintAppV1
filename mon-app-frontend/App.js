// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';
import TrackComplaintScreen from './src/screens/TrackComplaintScreen';

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: {
                        // ====================================================================
                        // MISE À JOUR DE LA COULEUR DU HEADER
                        // ====================================================================
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
    );
}