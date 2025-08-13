// src/screens/AnimatedSplash.js
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

export default function AnimatedSplash({ onEnd }) {
  const scale = useRef(new Animated.Value(0.8)).current;
  const fade = useRef(new Animated.Value(1)).current;

  const { width, height } = Dimensions.get('window');
  const size = Math.min(width, height) * 0.5;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1, friction: 6, useNativeDriver: true }),
      Animated.timing(fade, { toValue: 0, duration: 400, useNativeDriver: true })
    ]).start(onEnd);
  }, []);

  return (
    <Animated.View style={[styles.overlay, { opacity: fade }]}>
      <LinearGradient
        colors={['#ffffff', '#f5f7fb']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Animated.Image
        source={require('../../assets/new-splash.png')}
        resizeMode="contain"
        style={{ width: size, height: size, transform: [{ scale }] }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center'
  }
});
