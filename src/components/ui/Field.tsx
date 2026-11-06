import React, { useState } from 'react';
import { TextInput, TextInputProps, View } from 'react-native';
import { fonts, useTheme } from '@/src/theme';
import { AppText } from './AppText';

export function Field({ label, ...props }: TextInputProps & { label?: string }) {
  const { colors } = useTheme();
  const [focus, setFocus] = useState(false);
  return (
    <View style={{ gap: 8 }}>
      {label ? (
        <AppText variant="label" color="textMuted">
          {label}
        </AppText>
      ) : null}
      <TextInput
        placeholderTextColor={colors.textFaint}
        {...props}
        onFocus={(e) => {
          setFocus(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocus(false);
          props.onBlur?.(e);
        }}
        style={[
          {
            height: 52,
            borderRadius: 14,
            paddingHorizontal: 16,
            backgroundColor: colors.surfaceAlt,
            color: colors.text,
            fontFamily: fonts.medium,
            fontSize: 16,
            borderWidth: 1.5,
            borderColor: focus ? colors.primary : 'transparent',
          },
          props.style,
        ]}
      />
    </View>
  );
}
