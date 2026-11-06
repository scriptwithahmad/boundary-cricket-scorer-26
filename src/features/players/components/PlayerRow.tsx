import React, { ReactNode } from 'react';
import { View } from 'react-native';
import { useTheme } from '@/src/theme';
import { TeamBadgeIcon } from '@/src/components/cricket/TeamBadgeIcon';
import { AppText } from '@/src/components/ui/AppText';
import { Tap } from '@/src/components/ui/Tap';
import { Avatar } from '@/src/components/cricket/Avatar';

export function PlayerRow({
  name,
  sub,
  trailing,
  onPress,
  color,
  disabled,
  selected,
  captain,
}: {
  name: string;
  sub?: string;
  trailing?: ReactNode;
  onPress?: () => void;
  color?: string;
  disabled?: boolean;
  selected?: boolean;
  captain?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Tap
      onPress={onPress}
      disabled={disabled || !onPress}
      scaleTo={0.98}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        padding: 12,
        borderRadius: 16,
        backgroundColor: selected || captain ? colors.primarySoft : colors.surfaceAlt,
        borderWidth: captain ? 1 : 0,
        borderColor: captain ? `${colors.primary}70` : 'transparent',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <Avatar name={name} color={color} size={40} />
      <View style={{ flex: 1 }}>
        {captain ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 }}>
            <TeamBadgeIcon badge="crown" size={13} color={colors.primary} />
            <AppText variant="label" color="primary" style={{ fontSize: 9, letterSpacing: 1.2 }}>CAPTAIN</AppText>
          </View>
        ) : null}
        <AppText variant="bodyStrong" numberOfLines={1} color="text">
          {name}
        </AppText>
        {sub ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            {['Batter', 'Bowler', 'Keeper', 'All-rounder'].includes(sub) ? (
              <TeamBadgeIcon badge={sub === 'Batter' ? 'bat' : sub === 'Bowler' ? 'ball' : sub === 'Keeper' ? 'gloves' : 'all-rounder'} size={15} color={colors.textMuted} />
            ) : null}
            <AppText variant="caption" color="textMuted" numberOfLines={1}>
              {sub}
            </AppText>
          </View>
        ) : null}
      </View>
      {trailing}
    </Tap>
  );
}
