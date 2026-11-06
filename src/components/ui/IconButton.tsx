import React from 'react';
import { View } from 'react-native';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/src/theme';
import { Tap } from './Tap';

export function IconButton({
  icon: Icon,
  onPress,
  label,
  tone = 'plain',
  size = 44,
  disabled,
}: {
  icon: LucideIcon;
  onPress?: () => void;
  label: string;
  tone?: 'plain' | 'primary' | 'danger';
  size?: number;
  disabled?: boolean;
}) {
  const { colors } = useTheme();
  const bg = tone === 'primary' ? colors.primary : tone === 'danger' ? colors.dangerSoft : colors.surfaceAlt;
  const fg = tone === 'primary' ? colors.onPrimary : tone === 'danger' ? colors.danger : colors.text;
  return (
    <Tap
      onPress={onPress}
      disabled={disabled}
      accessibilityLabel={label}
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <View pointerEvents="none" style={{ position: 'relative', zIndex: 1 }}>
        <Icon size={20} color={fg} strokeWidth={2.2} />
      </View>
    </Tap>
  );
}
