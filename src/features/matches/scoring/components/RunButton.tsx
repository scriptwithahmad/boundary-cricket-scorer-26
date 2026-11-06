import React from 'react';
import { AppText, Tap } from '@/src/components/ui';
import { fonts, useTheme } from '@/src/theme';

export function RunButton({
  value,
  onPress,
  hapticEnabled,
  compact = false,
}: {
  value: number;
  onPress: () => void;
  hapticEnabled: boolean;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const bg = value === 4 ? colors.fourSoft : value === 6 ? colors.sixSoft : colors.surfaceAlt;
  const fg = value === 4 ? colors.four : value === 6 ? colors.six : colors.text;
  return (
    <Tap
      onPress={onPress}
      hapticEnabled={hapticEnabled}
      accessibilityLabel={`${value} run${value === 1 ? '' : 's'}`}
      scaleTo={0.92}
      style={{ flex: 1, height: compact ? 52 : 68, borderRadius: compact ? 18 : 22, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <AppText variant="title" color={fg} style={{ fontSize: 28, fontFamily: fonts.extrabold }}>
        {value}
      </AppText>
    </Tap>
  );
}
