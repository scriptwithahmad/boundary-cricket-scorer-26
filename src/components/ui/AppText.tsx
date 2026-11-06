import React, { ReactNode } from 'react';
import { StyleProp, Text, TextStyle } from 'react-native';
import { Palette, useTheme } from '@/src/theme';
import type { Variant } from './textTypes';
import { variants } from './textVariants';

export function AppText({
  variant = 'body',
  color = 'text',
  style,
  children,
  ...rest
}: {
  variant?: Variant;
  color?: keyof Palette | (string & {});
  style?: StyleProp<TextStyle>;
  children?: ReactNode;
  numberOfLines?: number;
  accessibilityRole?: 'header';
}) {
  const { colors } = useTheme();
  const c = Object.prototype.hasOwnProperty.call(colors, color) ? colors[color as keyof Palette] : color;
  return (
    <Text {...rest} style={[variants[variant], { color: c }, style]}>
      {children}
    </Text>
  );
}
