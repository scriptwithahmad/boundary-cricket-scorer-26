import React, { ReactNode } from 'react';
import { PressableProps, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '@/src/theme';
import { haptic } from '@/src/lib/haptics';
import { APressable } from './AnimatedPressable';
import { blendButtonColor } from './blendButtonColor';

export function Tap({
  children,
  onPress,
  style,
  disabled,
  quiet,
  hapticEnabled = true,
  scaleTo = 0.96,
  gradientColors,
  ...rest
}: Omit<PressableProps, 'style' | 'children'> & {
  children?: ReactNode;
  style?: StyleProp<ViewStyle>;
  quiet?: boolean;
  hapticEnabled?: boolean;
  scaleTo?: number;
  gradientColors?: readonly [string, string, ...string[]];
}) {
  const { colors, isDark } = useTheme();
  const flatStyle = StyleSheet.flatten(style);
  const background = flatStyle?.backgroundColor;
  const filledColors = [colors.primary, colors.accent, colors.danger, colors.four, colors.six];
  const softColors = [colors.primarySoft, colors.accentSoft, colors.dangerSoft, colors.fourSoft, colors.sixSoft];
  const filledIndex = typeof background === 'string' ? filledColors.indexOf(background) : -1;
  const softIndex = typeof background === 'string' ? softColors.indexOf(background) : -1;
  const hasGradient = !disabled && typeof background === 'string' && background !== 'transparent'
    && (gradientColors || filledIndex >= 0 || softIndex >= 0 || rest.accessibilityState?.selected === true);
  const gradientEnd = typeof background === 'string'
    ? blendButtonColor(background, softIndex >= 0 ? filledColors[softIndex] : isDark ? '#FFFFFF' : '#000000', softIndex >= 0 ? 0.12 : 0.16)
    : colors.primary;
  const s = useSharedValue(1);
  const a = useAnimatedStyle(() => ({ transform: [{ scale: s.value }] }));
  return (
    <APressable
      accessibilityRole="button"
      disabled={disabled}
      onPressIn={() => {
        s.value = withTiming(scaleTo, { duration: 90 });
      }}
      onPressOut={() => {
        s.value = withSpring(1, { damping: 14, stiffness: 260 });
      }}
      onPress={(e) => {
        if (!quiet && hapticEnabled) haptic.tap();
        onPress?.(e);
      }}
      style={[style, a] as any}
      {...rest}
    >
      {hasGradient ? (
        <LinearGradient
          pointerEvents="none"
          colors={gradientColors ?? [background as string, gradientEnd]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { borderRadius: flatStyle?.borderRadius }]}
        />
      ) : null}
      {children}
    </APressable>
  );
}
