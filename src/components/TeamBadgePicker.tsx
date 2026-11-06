import React from 'react';
import { View } from 'react-native';
import { AppText, Avatar, Tap } from './ui';
import { TEAM_BADGES, TeamBadge, TeamBadgeIcon } from './TeamBadgeIcon';
import { useTheme } from '../theme';

export function TeamBadgePicker({ value, onChange, color, name, showLabel = true, plainIcons = false }: { value: TeamBadge; onChange: (value: TeamBadge) => void; color: string; name: string; showLabel?: boolean; plainIcons?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      {showLabel ? <AppText variant="label" color="textMuted">Team badge</AppText> : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {TEAM_BADGES.map((badge) => (
          <Tap key={badge} onPress={() => onChange(badge)} accessibilityLabel={`${badge} badge`} accessibilityRole="radio" accessibilityState={{ checked: value === badge }} style={{ padding: 4, borderRadius: 30, borderWidth: 2, borderColor: value === badge ? colors.text : 'transparent' }}>
            {plainIcons ? <View style={{ width: 40, height: 40, alignItems: 'center', justifyContent: 'center' }}>
              {badge === 'initials' ? <AppText style={{ color, fontSize: 16 }}>{name || 'XI'}</AppText> : <TeamBadgeIcon badge={badge} size={26} color={color} />}
            </View> : <Avatar name={name || 'XI'} color={color} size={40} badge={badge} />}
          </Tap>
        ))}
      </View>
    </View>
  );
}
