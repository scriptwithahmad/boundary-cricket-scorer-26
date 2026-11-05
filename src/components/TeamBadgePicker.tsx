import React from 'react';
import { View } from 'react-native';
import { AppText, Avatar, Tap } from './ui';
import { TEAM_BADGES, TeamBadge } from './TeamBadgeIcon';
import { useTheme } from '../theme';

export function TeamBadgePicker({ value, onChange, color, name }: { value: TeamBadge; onChange: (value: TeamBadge) => void; color: string; name: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ gap: 10 }}>
      <AppText variant="label" color="textMuted">Team badge</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {TEAM_BADGES.map((badge) => (
          <Tap key={badge} onPress={() => onChange(badge)} accessibilityLabel={`${badge} badge`} accessibilityRole="radio" accessibilityState={{ checked: value === badge }} style={{ padding: 4, borderRadius: 30, borderWidth: 2, borderColor: value === badge ? colors.text : 'transparent' }}>
            <Avatar name={name || 'XI'} color={color} size={40} badge={badge} />
          </Tap>
        ))}
      </View>
    </View>
  );
}
