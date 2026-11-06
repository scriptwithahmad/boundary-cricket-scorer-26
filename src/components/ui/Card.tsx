import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useTheme } from '@/src/theme';
import { Tap } from './Tap';

export function Card({
  children,
  style,
  onPress,
  index,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  index?: number;
}) {
  const { colors, isDark } = useTheme();
  const base: ViewStyle = {
    backgroundColor: colors.surface,
    borderRadius: 20,
    padding: 16,
    shadowColor: isDark ? '#000000' : '#2B3A2E',
    shadowOpacity: isDark ? 0.2 : 0.035,
    shadowRadius: isDark ? 14 : 18,
    shadowOffset: { width: 0, height: isDark ? 5 : 3 },
    elevation: isDark ? 3 : 1,
  };
  const entering = index !== undefined ? FadeInDown.delay(Math.min(index, 8) * 50).duration(320) : undefined;
  if (onPress) {
    return (
      <Animated.View entering={entering}>
        <Tap onPress={onPress} style={[base, style]}>
          {children}
        </Tap>
      </Animated.View>
    );
  }
  return (
    <Animated.View entering={entering} style={[base, style]}>
      {children}
    </Animated.View>
  );
}
