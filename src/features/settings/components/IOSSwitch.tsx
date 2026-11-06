import { styles } from '../styles';
import React, { useEffect } from 'react';
import { Pressable, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import type { Palette } from '@/src/theme';

export function IOSSwitch({
  value,
  onValueChange,
  label,
  colors,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  colors: Palette;
}) {
  const progress = useSharedValue(value ? 1 : 0);
  const reduceMotion = useReducedMotion();
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 16 }],
  }));

  useEffect(() => {
    progress.value = reduceMotion ? (value ? 1 : 0) : withTiming(value ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, reduceMotion, value]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      style={[
        styles.iosSwitch,
        {
          backgroundColor: value ? colors.primary : colors.surfaceAlt,
          borderColor: value ? colors.primary : colors.border,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.iosSwitchThumb,
          { backgroundColor: '#FFFFFF' },
          thumbStyle,
        ]}
      />
    </Pressable>
  );
}
