import React from 'react';
import { Text } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { fonts, radius, useTheme } from '@/src/theme';
import { Tap } from './Tap';

export function Chip({
  label,
  selected,
  onPress,
  icon: Icon,
  disabled,
  selectedBackgroundColor,
  selectedTextColor,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: LucideIcon;
  disabled?: boolean;
  selectedBackgroundColor?: string;
  selectedTextColor?: string;
}) {
  const { colors } = useTheme();
  const bg = selected ? selectedBackgroundColor ?? colors.primarySoft : colors.surfaceAlt;
  const fg = selected ? selectedTextColor ?? colors.primary : colors.textMuted;
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      accessibilityState={{ selected: !!selected }}
      style={{
        height: 40,
        paddingHorizontal: 16,
        borderRadius: radius.pill,
        backgroundColor: bg,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        opacity: disabled ? 0.35 : 1,
      }}
    >
      {Icon ? <Icon size={16} color={fg} strokeWidth={2.4} /> : null}
      <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: fg }}>{label}</Text>
    </Tap>
  );
}
