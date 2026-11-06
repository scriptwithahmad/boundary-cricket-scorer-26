import React from 'react';
import { Text, View } from 'react-native';
import { fonts, useTheme } from '@/src/theme';
import { Tap } from './Tap';

export function Stepper({ value, onChange, min = 1, max = 50 }: { value: number; onChange: (n: number) => void; min?: number; max?: number }) {
  const { colors } = useTheme();
  const btn = (label: string, delta: number, off: boolean) => (
    <Tap
      onPress={() => onChange(Math.min(max, Math.max(min, value + delta)))}
      disabled={off}
      accessibilityLabel={delta > 0 ? 'Increase' : 'Decrease'}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: colors.surfaceAlt,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: off ? 0.4 : 1,
      }}
    >
      <Text style={{ fontFamily: fonts.bold, fontSize: 22, color: colors.text }}>{label}</Text>
    </Tap>
  );
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
      {btn('−', -1, value <= min)}
      <Text style={{ fontFamily: fonts.extrabold, fontSize: 28, color: colors.text, minWidth: 48, textAlign: 'center', fontVariant: ['tabular-nums'] }}>
        {value}
      </Text>
      {btn('+', 1, value >= max)}
    </View>
  );
}
