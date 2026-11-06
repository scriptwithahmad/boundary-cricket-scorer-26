import React, { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { AnimatedLogo } from './AnimatedLogo';

export function StartupScreen({ ready, onFinish, onLayout }: { ready: boolean; onFinish: () => void; onLayout: () => Promise<void> }) {
  const reduced = useReducedMotion();
  const [loadedImages, setLoadedImages] = useState(0);
  const [imageWaitExpired, setImageWaitExpired] = useState(false);
  const imageReady = loadedImages >= 6 || imageWaitExpired;
  useEffect(() => {
    // A failed asset request must never keep Expo Go behind the splash forever.
    const timer = setTimeout(() => setImageWaitExpired(true), 4000);
    return () => clearTimeout(timer);
  }, []);
  const imageLoaded = useCallback(() => setLoadedImages((count) => count + 1), []);
  const [laidOut, setLaidOut] = useState(false);
  const [started, setStarted] = useState(false);
  const [displayComplete, setDisplayComplete] = useState(false);
  const reveal = useSharedValue(reduced ? 1 : 0);
  const opacity = useSharedValue(1);
  useEffect(() => {
    if (!laidOut || !imageReady) return;
    let cancelled = false;
    let frame: number | undefined;
    // Keep every logo layer at its initial state until the native splash is gone.
    void onLayout().then(() => {
      if (cancelled) return;
      frame = requestAnimationFrame(() => {
        frame = requestAnimationFrame(() => {
          if (!cancelled) setStarted(true);
        });
      });
    });
    return () => {
      cancelled = true;
      if (frame !== undefined) cancelAnimationFrame(frame);
    };
  }, [imageReady, laidOut, onLayout]);
  useEffect(() => {
    if (!started) return;
    reveal.value = withTiming(1, { duration: reduced ? 0 : 400, easing: Easing.out(Easing.cubic) });
    const timer = setTimeout(() => setDisplayComplete(true), reduced ? 400 : 2300);
    return () => clearTimeout(timer);
  }, [started, reduced, reveal]);
  useEffect(() => {
    if (!ready || !displayComplete) return;
    opacity.value = withTiming(0, { duration: reduced ? 0 : 400 });
    const timer = setTimeout(onFinish, reduced ? 0 : 400);
    return () => clearTimeout(timer);
  }, [ready, displayComplete, reduced, opacity, onFinish]);
  const screenStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));
  const logoStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  const taglineStyle = useAnimatedStyle(() => ({ opacity: reveal.value }));
  return (
    <Animated.View onLayout={() => setLaidOut(true)} style={[styles.screen, screenStyle]} accessibilityLabel="Boundary is loading" accessibilityViewIsModal>
      <View style={styles.content}>
        <Animated.View style={logoStyle}>
          <AnimatedLogo ready={started} onLoad={imageLoaded} />
        </Animated.View>
        <Animated.Text style={[styles.tagline, taglineStyle]}>YOUR GAME. YOUR STORY.</Animated.Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: { position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 100, backgroundColor: '#020907', alignItems: 'center', justifyContent: 'center' },
  content: { alignItems: 'center', width: '100%' },
  tagline: { marginTop: 30, color: '#D4E4D9', fontSize: 11, letterSpacing: 3 },
});
