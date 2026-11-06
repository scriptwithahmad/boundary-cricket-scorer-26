import React from 'react';
import { View } from 'react-native';
import Animated, { ZoomIn } from 'react-native-reanimated';
import { AppText } from '@/src/components/ui';
import { fonts, useTheme } from '@/src/theme';
import type { Ball } from '@/src/types';

export function BallChip({ b }: { b: Ball }) {
  const { colors } = useTheme();
  let label = String(b.runs);
  let bg = colors.surfaceAlt;
  let fg = colors.text;
  if (b.wicket) {
    label = 'W';
    bg = colors.danger;
    fg = colors.onDanger;
  } else if (b.extra === 'wd') {
    label = b.extraRuns > 1 ? `${b.extraRuns - 1}WD` : 'WD';
    bg = colors.accentSoft;
    fg = colors.accent;
  } else if (b.extra === 'nb') {
    label = b.runs > 0 ? `Nb${b.runs}` : 'Nb';
    bg = colors.accentSoft;
    fg = colors.accent;
  } else if (b.extra) {
    label = `${b.extra === 'b' ? 'B' : 'Lb'}${b.extraRuns}`;
    bg = colors.accentSoft;
    fg = colors.accent;
  } else if (b.runs === 0) {
    label = '•';
    fg = colors.textFaint;
  } else if (b.runs === 4) {
    bg = colors.fourSoft;
    fg = colors.four;
  } else if (b.runs === 6) {
    bg = colors.sixSoft;
    fg = colors.six;
  }
  return (
    <Animated.View
      entering={ZoomIn.duration(220)}
      style={{ minWidth: 40, height: 40, borderRadius: 20, paddingHorizontal: 8, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <AppText variant="bodyStrong" color={fg} style={{ fontFamily: fonts.bold }}>
        {label}
      </AppText>
    </Animated.View>
  );
}
