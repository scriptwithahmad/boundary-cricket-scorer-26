import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

const layers: { source: ImageSourcePropType; delay: number; x?: number; y?: number; rotate?: number }[] = [
  { source: require('../../assets/images/logo-layers/wickets.png'), delay: 100, y: 22 },
  { source: require('../../assets/images/logo-layers/letter.png'), delay: 350, y: 10 },
  { source: require('../../assets/images/logo-layers/swoosh.png'), delay: 650, x: -24, rotate: -8 },
  { source: require('../../assets/images/logo-layers/ball.png'), delay: 950, x: 40, y: -28, rotate: 40 },
  { source: require('../../assets/images/logo-layers/wordmark.png'), delay: 1250, y: 8 },
];

function LogoLayer({ layer, start }: { layer: typeof layers[number]; start: boolean }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);
  const shimmer = useSharedValue(1);
  useEffect(() => {
    if (!start) return;
    progress.value = withDelay(reduced ? 0 : layer.delay, withTiming(1, { duration: reduced ? 0 : 650, easing: Easing.out(Easing.cubic) }));
    if (!reduced && layer === layers[2]) {
      shimmer.value = withDelay(1500, withRepeat(withTiming(0.72, { duration: 900, easing: Easing.inOut(Easing.cubic) }), -1, true));
    }
    return () => { cancelAnimation(progress); cancelAnimation(shimmer); };
  }, [layer, progress, reduced, shimmer, start]);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value * shimmer.value,
    transform: [
      { translateX: (1 - progress.value) * (layer.x ?? 0) },
      { translateY: (1 - progress.value) * (layer.y ?? 0) },
      { rotate: `${(1 - progress.value) * (layer.rotate ?? 0)}deg` },
    ],
  }));
  return <Animated.Image source={layer.source} resizeMode="contain" style={[styles.layer, style]} />;
}

export function AnimatedLogo({ ready, onLoad }: { ready: boolean; onLoad: () => void }) {
  // Hidden copies preload all layers before the reveal begins.
  return (
    <View style={styles.logo} accessible accessibilityLabel="Boundary logo">
      <Image source={require('../../assets/images/logo-layers/background.png')} style={styles.layer} onLoadEnd={onLoad} />
      {layers.map((layer, index) => (
        <React.Fragment key={index}>
          <Image source={layer.source} style={styles.preload} onLoadEnd={onLoad} />
          <LogoLayer layer={layer} start={ready} />
        </React.Fragment>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { width: 250, height: 250 },
  layer: { position: 'absolute', width: 250, height: 250 },
  preload: { position: 'absolute', width: 1, height: 1, opacity: 0 },
});
