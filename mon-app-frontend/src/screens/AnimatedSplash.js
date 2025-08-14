// src/screens/AnimatedSplash.js
import React, { useEffect, useRef } from 'react';
import { 
  Animated, 
  StyleSheet, 
  Dimensions, 
  View,
  StatusBar
} from 'react-native';

const { width, height } = Dimensions.get('window');

export default function AnimatedSplash({ onEnd }) {
  // Animation values
  const scale = useRef(new Animated.Value(0.3)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const rotate = useRef(new Animated.Value(0)).current;
  const fadeOut = useRef(new Animated.Value(1)).current;

  // Logo size - responsive to screen size
  const logoSize = Math.min(width, height) * 0.4;

  useEffect(() => {
    // Main animation sequence
    const animationSequence = Animated.sequence([
      // Phase 1: Fade in and scale up with rotation
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(scale, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
        Animated.timing(rotate, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 2: Hold for a moment
      Animated.delay(800),
      
      // Phase 3: Pulse effect
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      
      // Phase 4: Hold again
      Animated.delay(300),
      
      // Phase 5: Fade out
      Animated.timing(fadeOut, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]);

    // Start the animation
    animationSequence.start(({ finished }) => {
      if (finished && onEnd) {
        onEnd();
      }
    });

    // Cleanup function
    return () => {
      animationSequence.stop();
    };
  }, [scale, opacity, rotate, fadeOut, onEnd]);

  // Rotation interpolation
  const rotateInterpolate = rotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.View style={[styles.container, { opacity: fadeOut }]}>
      <StatusBar hidden />
      
      {/* Background gradient effect using multiple views */}
      <View style={styles.backgroundGradient} />
      
      {/* Animated logo container */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            opacity,
            transform: [
              { scale },
              { rotate: rotateInterpolate },
            ],
          },
        ]}
      >
        <Animated.Image
          source={require('../../assets/splash-cover.png')}
          style={[
            styles.logo,
            {
              width: logoSize,
              height: logoSize,
            },
          ]}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Optional: Add some decorative elements */}
      <View style={styles.decorativeElements}>
        {[...Array(6)].map((_, index) => (
          <Animated.View
            key={index}
            style={[
              styles.dot,
              {
                opacity: opacity,
                transform: [
                  {
                    scale: scale.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, 1],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F6FA',
  },
  backgroundGradient: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F3F6FA',
    // You can add a subtle gradient here using LinearGradient if needed
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  logo: {
    // Size is set dynamically in the component
  },
  decorativeElements: {
    position: 'absolute',
    bottom: height * 0.15,
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#3A4F53',
    marginHorizontal: 2,
  },
});