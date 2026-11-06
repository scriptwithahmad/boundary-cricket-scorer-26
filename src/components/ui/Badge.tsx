import React from 'react';
import { Text, View } from 'react-native';
import { fonts, radius, useTheme } from '@/src/theme';

export function Badge({ label, tone = 'neutral' }: { label: string; tone?: 'neutral' | 'primary' | 'accent' | 'danger' }) {
  const { colors } = useTheme();
  const m = {
    neutral: { bg: colors.surfaceAlt, fg: colors.textMuted },
    primary: { bg: colors.primarySoft, fg: colors.primary },
    accent: { bg: colors.accentSoft, fg: colors.accent },
    danger: { bg: colors.dangerSoft, fg: colors.danger },
  }[tone];
  return (
    <View style={{ backgroundColor: m.bg, borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 4 }}>
      <Text style={{ fontFamily: fonts.bold, fontSize: 11, letterSpacing: 0.6, color: m.fg, textTransform: 'uppercase' }}>{label}</Text>
    </View>
  );
}
