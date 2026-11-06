import React from 'react';
import { Text, View } from 'react-native';
import { fonts, radius, useTheme } from '@/src/theme';
import { Tap } from './Tap';

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T }[];
  value: T;
  onChange: (v: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={{ flexDirection: 'row', backgroundColor: colors.surfaceAlt, borderRadius: radius.pill, padding: 4 }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Tap
            key={o.value}
            onPress={() => onChange(o.value)}
            scaleTo={0.97}
            accessibilityState={{ selected: active }}
            style={{
              flex: 1,
              height: 38,
              borderRadius: radius.pill,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: active ? colors.primarySoft : 'transparent',
            }}
          >
            <Text style={{ fontFamily: fonts.semibold, fontSize: 14, color: active ? colors.primary : colors.textMuted }}>
              {o.label}
            </Text>
          </Tap>
        );
      })}
    </View>
  );
}
