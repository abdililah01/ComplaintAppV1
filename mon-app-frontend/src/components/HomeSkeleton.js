// src/components/HomeSkeleton.js
import React, { useEffect, useRef } from 'react';
import { View, Animated, Easing, Dimensions, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_W = width - 32;

// Reusable shimmer block (no external libs)
function ShimmerBlock({ w, h, radius = 12 }) {
  const progress = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(progress, {
        toValue: 1,
        duration: 1200,
        easing: Easing.inOut(Easing.linear),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [progress]);

  // Width of the moving highlight band
  const bandW = Math.max(60, w * 0.6);
  const translate = progress.interpolate({
    inputRange: [-1, 1],
    outputRange: [-bandW, w + bandW],
  });

  return (
    <View style={[styles.block, { width: w, height: h, borderRadius: radius }]}>
      {/* Base grey */}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: '#E9EEF2' }]} />
      {/* Moving highlight */}
      <Animated.View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          width: bandW,
          transform: [{ translateX: translate }],
        }}
      >
        <LinearGradient
          colors={['transparent', '#F6FAFF', 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
    </View>
  );
}

export default function HomeSkeleton() {
  return (
    <View style={{ paddingHorizontal: 16, paddingTop: 12 }}>
      {/* Header stats bar */}
      <View style={styles.row}>
        <ShimmerBlock w={80} h={20} radius={8} />
        <ShimmerBlock w={80} h={20} radius={8} />
        <ShimmerBlock w={80} h={20} radius={8} />
      </View>

      {/* Welcome card */}
      <View style={{ marginBottom: 20 }}>
        <ShimmerBlock w={CARD_W} h={90} radius={16} />
      </View>

      {/* Primary card */}
      <View style={{ marginBottom: 20 }}>
        <ShimmerBlock w={CARD_W} h={170} radius={20} />
      </View>

      {/* Secondary card */}
      <ShimmerBlock w={CARD_W} h={170} radius={20} />
    </View>
  );
}

const styles = StyleSheet.create({
  block: { overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
});
