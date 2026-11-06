import { styles } from '../styles';
import React, { useEffect, useRef, useState } from 'react';
import { View } from 'react-native';
import { Moon, Smartphone, Sun } from 'lucide-react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText, Tap } from '@/src/components/ui';
import type { Palette, ThemeMode } from '@/src/theme';

export const appearanceOptions: {
  label: string;
  value: ThemeMode;
  icon: typeof Smartphone;
}[] = [
    { label: 'System', value: 'system', icon: Smartphone },
    { label: 'Light', value: 'light', icon: Sun },
    { label: 'Dark', value: 'dark', icon: Moon },
  ];

export function AppearanceTabs({
  colors,
  mode,
  setMode,
}: {
  colors: Palette;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const previousMode = useRef(mode);
  const reduceMotion = useReducedMotion();
  const selectedIndex = appearanceOptions.findIndex((option) => option.value === mode);
  const segmentWidth = Math.max(0, (trackWidth - 12) / appearanceOptions.length);
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  useEffect(() => {
    if (previousMode.current === mode) return;
    previousMode.current = mode;
    const nextPosition = selectedIndex * segmentWidth;
    indicatorX.value = reduceMotion
      ? nextPosition
      : withTiming(nextPosition, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [indicatorX, mode, reduceMotion, segmentWidth, selectedIndex]);

  return (
    <View
      style={[styles.appearance, { backgroundColor: colors.surface }]}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        setTrackWidth(width);
        indicatorX.value = selectedIndex * Math.max(0, (width - 12) / appearanceOptions.length);
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.appearanceIndicator,
          { width: segmentWidth, backgroundColor: colors.primarySoft },
          indicatorStyle,
        ]}
      />
      <View style={styles.appearanceTabs}>
        {appearanceOptions.map(({ label, value, icon: Icon }) => {
          const selected = mode === value;
          return (
            <Tap
              key={value}
              onPress={() => setMode(value)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              style={styles.appearanceTab}
            >
              <Icon size={17} color={selected ? colors.primary : colors.textMuted} strokeWidth={2.2} />
              <AppText
                variant="bodyStrong"
                color={selected ? 'primary' : 'textMuted'}
                style={styles.appearanceTabLabel}
                numberOfLines={1}
              >
                {label}
              </AppText>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}
