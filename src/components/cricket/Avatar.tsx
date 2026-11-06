import React from 'react';
import { Text, View } from 'react-native';
import { fonts, useTheme } from '@/src/theme';
import { TeamBadgeIcon } from '@/src/components/cricket/TeamBadgeIcon';

export function Avatar({ name, color, size = 44, badge }: { name: string; color?: string; size?: number; badge?: string }) {
  const { colors } = useTheme();
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: color ?? colors.primarySoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {badge && badge !== 'initials' ? <TeamBadgeIcon badge={badge} size={size * 0.62} color={color ? '#08130D' : colors.primary} /> : <Text style={{ fontFamily: fonts.extrabold, fontSize: size * 0.36, color: color ? '#08130D' : colors.primary }}>{initials}</Text>}
    </View>
  );
}
