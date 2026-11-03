import React from 'react';
import { View } from 'react-native';
import { TEAM_COLORS, useTheme } from '../theme';
import { Tap } from './ui';

export function ColorPicker({ value, onChange }: { value: string; onChange: (c: string) => void }) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
      {TEAM_COLORS.map((c) => (
        <Tap
          key={c}
          onPress={() => onChange(c)}
          accessibilityLabel={`Colour ${c}`}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: c,
            borderWidth: 3,
            borderColor: value === c ? colors.text : 'transparent',
          }}
        />
      ))}
    </View>
  );
}
