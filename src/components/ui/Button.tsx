import React from 'react';
import { StyleProp, Text, ViewStyle } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { fonts, radius, useTheme } from '@/src/theme';
import { blendButtonColor } from './blendButtonColor';
import { Tap } from './Tap';
import type { BtnVariant } from './buttonTypes';

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  icon: Icon,
  disabled,
  style,
  full = true,
}: {
  label: string;
  onPress?: () => void;
  variant?: BtnVariant;
  size?: 'sm' | 'md' | 'lg';
  icon?: LucideIcon;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
}) {
  const { colors, isDark } = useTheme();
  const map: Record<BtnVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    accent: { bg: colors.accent, fg: colors.onAccent },
    secondary: { bg: colors.surfaceAlt, fg: colors.text },
    ghost: { bg: 'transparent', fg: colors.text, border: colors.border },
    danger: { bg: colors.danger, fg: colors.onDanger },
    soft: { bg: colors.primarySoft, fg: colors.primary },
  };
  const v = map[variant];
  const gradient: readonly [string, string] | undefined = variant === 'ghost' ? undefined
    : variant === 'secondary'
      ? [colors.surfaceAlt, colors.primarySoft]
      : variant === 'soft'
        ? [blendButtonColor(colors.primarySoft, colors.surface, 0.5), colors.primarySoft]
        : [v.bg, blendButtonColor(v.bg, isDark ? '#FFFFFF' : '#000000', isDark ? 0.32 : 0.26)];
  const h = size === 'lg' ? 56 : size === 'sm' ? 38 : 48;
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      gradientColors={gradient}
      style={[
        {
          height: h,
          paddingHorizontal: size === 'sm' ? 16 : 24,
          borderRadius: radius.pill,
          backgroundColor: v.bg,
          borderWidth: v.border ? 1 : 0,
          borderColor: v.border,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          opacity: disabled ? 0.4 : 1,
          alignSelf: full ? 'stretch' : 'flex-start',
        },
        style,
      ]}
    >
      {Icon ? <Icon size={size === 'sm' ? 16 : 20} color={v.fg} strokeWidth={2.4} /> : null}
      <Text style={{ fontFamily: fonts.bold, fontSize: size === 'sm' ? 14 : 16, color: v.fg }}>{label}</Text>
    </Tap>
  );
}
