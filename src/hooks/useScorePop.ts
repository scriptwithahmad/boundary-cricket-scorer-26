import { useEffect } from 'react';
import { useAnimatedStyle, useSharedValue, withSequence, withSpring, withTiming } from 'react-native-reanimated';

export function useScorePop(key: string | number) {
  const s = useSharedValue(1);
  useEffect(() => {
    s.value = withSequence(withTiming(1.07, { duration: 90 }), withSpring(1, { damping: 10, stiffness: 220 }));
  }, [key, s]);
  return useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
}
