// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';
import TrackComplaintScreen from './src/screens/TrackComplaintScreen'; // 1. Importer le nouvel écran

const Stack = createNativeStackNavigator();

export default function App() {
    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerStyle: { backgroundColor: '#1e3a8a' },
                    headerTintColor: '#ffffff',
                    headerTitleStyle: { fontWeight: 'bold' },
                    headerTitleAlign: 'center', // Centre le titre pour un look plus moderne
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
                {/* 2. Ajouter le nouvel écran à la pile de navigation */}
                <Stack.Screen
                    name="TrackComplaint"
                    component={TrackComplaintScreen}
                    options={{ title: 'تتبع شكاية موجودة' }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}