import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { AnimatedLogo } from './AnimatedLogo';

export function StartupScreen({ ready, onFinish, onLayout }: { ready: boolean; onFinish: () => void; onLayout: () => void }) {
  const reduced = useReducedMotion();
  const [loadedImages, setLoadedImages] = useState(0);
  const imageReady = loadedImages >= 6;
  const imageLoaded = useCallback(() => setLoadedImages((count) => count + 1), []);
  const [displayComplete, setDisplayComplete] = useState(false);
  const reveal = useSharedValue(reduced ? 1 : 0);
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (!imageReady) return;
    reveal.value = withTiming(1, { duration: reduced ? 0 : 750, easing: Easing.out(Easing.cubic) });
    const timer = setTimeout(() => setDisplayComplete(true), reduced ? 1200 : 3400);
    return () => clearTimeout(timer);
  }, [imageReady, reduced, reveal]);
  useEffect(() => {
    if (!ready || !displayComplete) return;
    opacity.value = withTiming(0, { duration: reduced ? 0 : 400 });
    const timer = setTimeout(onFinish, reduced ? 0 : 400);
    return () => clearTimeout(timer);
  }, [ready, displayComplete, reduced, opacity, onFinish]);
  const screenStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  return (
    <Animated.View onLayout={onLayout} style={[styles.screen, screenStyle]} accessibilityLabel="Boundary is loading" accessibilityViewIsModal>
      <View style={styles.content}>
        <Animated.View style={logoStyle}>
          <AnimatedLogo ready={imageReady} onLoad={imageLoaded} />
        </Animated.View>
        <Text style={styles.tagline}>YOUR GAME. YOUR STORY.</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100, backgroundColor: '#020907', alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', width: '100%' },
  tagline: { marginTop: 30, color: '#D4E4D9', fontSize: 11, letterSpacing: 3 },
});
