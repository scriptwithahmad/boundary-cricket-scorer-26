import React, { useEffect } from 'react';
import { Image, ImageSourcePropType, StyleSheet, View } from 'react-native';
import Animated, { cancelAnimation, Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';

const layers: { source: ImageSourcePropType; delay: number; x?: number; y?: number; rotate?: number }[] = [
  { source: require("@/assets/images/logo-layers/wickets.png"), delay: 100, y: 12 },
  { source: require("@/assets/images/logo-layers/letter.png"), delay: 280, y: 8 },
  { source: require("@/assets/images/logo-layers/swoosh.png"), delay: 460, x: -16, rotate: -5 },
  { source: require("@/assets/images/logo-layers/ball.png"), delay: 640, x: 24, y: -16, rotate: 24 },
  { source: require("@/assets/images/logo-layers/wordmark.png"), delay: 820, y: 6 },
];

function LogoLayer({ layer, start, onLoad }: { layer: typeof layers[number]; start: boolean; onLoad: () => void }) {
  const reduced = useReducedMotion();
  const progress = useSharedValue(reduced ? 1 : 0);
  useEffect(() => {
    if (!start) return;
    progress.value = withDelay(reduced ? 0 : layer.delay, withTiming(1, { duration: reduced ? 0 : 700, easing: Easing.bezier(0.22, 1, 0.36, 1) }));
    return () => cancelAnimation(progress);
  }, [layer, progress, reduced, start]);
  const style = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [
      { translateX: (1 - progress.value) * (layer.x ?? 0) },
      { translateY: (1 - progress.value) * (layer.y ?? 0) },
      { rotate: `${(1 - progress.value) * (layer.rotate ?? 0)}deg` },
    ],
  }));
  return <Animated.Image source={layer.source} onLoadEnd={onLoad} fadeDuration={0} resizeMode="contain" style={[styles.layer, style]} />;
}

export function AnimatedLogo({ ready, onLoad }: { ready: boolean; onLoad: () => void }) {
  // Load the actual animated images before starting, including their first render.
  return (
    <View style={styles.logo} accessible accessibilityLabel="Boundary logo">
      <Image source={require("@/assets/images/logo-layers/background.png")} style={styles.layer} fadeDuration={0} onLoadEnd={onLoad} />
      {layers.map((layer, index) => (
        <LogoLayer key={index} layer={layer} start={ready} onLoad={onLoad} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  logo: { width: 250, height: 250 },
  layer: { position: 'absolute', width: 250, height: 250 },
});
