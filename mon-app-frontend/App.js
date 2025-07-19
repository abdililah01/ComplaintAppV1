// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import HomeScreen from './src/screens/HomeScreen';
import ComplaintFormScreen from './src/screens/ComplaintFormScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
      <NavigationContainer>
        <Stack.Navigator
            // Options globales pour tous les écrans
            screenOptions={{
              headerStyle: {
                backgroundColor: '#1e3a8a', // Professional blue header
              },
              headerTintColor: '#ffffff', // Texte et flèche de retour en blanc
              headerTitleStyle: {
                fontWeight: 'bold',
              },
            }}
        >
          {/* Définition de l'écran d'accueil */}
          <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ headerShown: false }} // On cache la barre de navigation sur l'accueil
          />
          {/* Définition de l'écran du formulaire */}
          <Stack.Screen
              name="ComplaintForm"
              component={ComplaintFormScreen}
              options={{ title: 'وضع شكاية جديدة' }} // Titre dans la barre de navigation
          />
        </Stack.Navigator>
      </NavigationContainer>
  );
}