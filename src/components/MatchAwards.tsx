import React, { useState } from 'react';
import { View } from 'react-native';
import { Award, CircleDot, Shield, Target, Trophy } from 'lucide-react-native';
import type { LucideIcon } from 'lucide-react-native';
import { AppText, Button, Card, PlayerRow, Sheet } from './ui';
import { matchAwards } from '../engine/cricket';
import type { Match } from '../types';
import { useStore } from '../store';
import { useTheme } from '../theme';

export function MatchAwards({ match }: { match: Match }) {
  const { colors } = useTheme();
  const store = useStore();
  const [pickerOpen, setPickerOpen] = useState(false);
  const awards = matchAwards(match);
  const playerOfMatchId = match.result?.playerOfMatchId ?? awards.playerOfMatchId;
  const participantIds = [...(match.squads[match.teamAId] ?? []), ...(match.squads[match.teamBId] ?? [])];
  const playerName = (id: string | null) => (id ? match.players[id]?.name ?? 'Player' : 'Not available');

  const awardRow = (label: string, id: string | null, figure: string, Icon: LucideIcon) => (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
      <Icon size={16} color={colors.primary} strokeWidth={2.2} />
      <View style={{ flex: 1 }}>
        <AppText variant="caption" color="textMuted">{label}</AppText>
        <AppText variant="bodyStrong" numberOfLines={1}>{playerName(id)}</AppText>
      </View>
      <AppText variant="caption" color="textMuted">{id ? figure : '—'}</AppText>
    </View>
  );

  return (
    <>
      <Card style={{ marginTop: 16, gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Trophy size={18} color={colors.six} />
          <AppText variant="heading">Match awards</AppText>
        </View>

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Award size={20} color={colors.six} />
          <View style={{ flex: 1 }}>
            <AppText variant="caption" color="textMuted">Player of the Match</AppText>
            <AppText variant="bodyStrong" numberOfLines={1}>{playerName(playerOfMatchId)}</AppText>
          </View>
          <Button label="Change" size="sm" variant="secondary" full={false} onPress={() => setPickerOpen(true)} />
        </View>

        {[match.teamAId, match.teamBId].map((teamId) => {
          const teamAwards = awards.teams[teamId];
          return (
            <View key={teamId} style={{ gap: 12 }}>
              <View style={{ height: 1, backgroundColor: colors.border }} />
              <AppText variant="label" color="textMuted">{match.teams[teamId]?.name ?? 'Team'}</AppText>
              {awardRow('Best Batsman', teamAwards.batsmanId, `${teamAwards.batsmanRuns} runs`, Target)}
              {awardRow(
                'Best Bowler',
                teamAwards.bowlerId,
                `${teamAwards.bowlerWickets} wickets · ${teamAwards.bowlerRuns} runs`,
                CircleDot,
              )}
              {awardRow(
                'Best Fielder',
                teamAwards.fielderId,
                `${teamAwards.fieldingDismissals} dismissal${teamAwards.fieldingDismissals === 1 ? '' : 's'}`,
                Shield,
              )}
            </View>
          );
        })}
      </Card>

      <Sheet
        visible={pickerOpen}
        onClose={() => setPickerOpen(false)}
        title="Change Player of the Match"
        subtitle="Choose a player from either team."
      >
        <View style={{ gap: 8 }}>
          {participantIds.map((playerId) => (
            <PlayerRow
              key={playerId}
              name={playerName(playerId)}
              sub={match.teams[match.players[playerId]?.teamId]?.name ?? 'Team'}
              color={match.teams[match.players[playerId]?.teamId]?.color}
              selected={playerId === playerOfMatchId}
              onPress={() => {
                store.setPlayerOfMatch(match.id, playerId);
                setPickerOpen(false);
              }}
            />
          ))}
        </View>
      </Sheet>
    </>
  );
}
