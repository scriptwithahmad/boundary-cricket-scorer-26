import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { oversText, teamScore } from '../engine/cricket';
import type { Match } from '../types';
import { AppText, Avatar, Badge, Card, LiveDot } from './ui';

export const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export function MatchCard({ match, index }: { match: Match; index?: number }) {
  const router = useRouter();
  const live = match.status === 'live';
  const ids = [match.teamAId, match.teamBId];
  const winner = match.result?.winnerId;
  const tossName = match.teams[match.tossWinnerId]?.name;

  return (
    <Card
      index={index}
      onPress={() => router.push((live ? `/match/${match.id}/score` : `/match/${match.id}`) as any)}
      style={{ gap: 14 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Badge label={match.format === 'Custom' ? `${match.overs} ov` : match.format} tone="neutral" />
        <AppText variant="caption" color="textFaint" style={{ flex: 1 }}>
          {fmtDate(match.createdAt)}
        </AppText>
        {live ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <LiveDot />
            <AppText variant="label" color="danger">
              Live
            </AppText>
          </View>
        ) : null}
      </View>
      {ids.map((id) => {
        const t = match.teams[id];
        const s = teamScore(match, id);
        const lost = !live && winner !== undefined && winner !== null && winner !== id;
        return (
          <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, opacity: lost ? 0.6 : 1 }}>
            <Avatar name={t.short} color={t.color} size={36} badge={t.badge} />
            <AppText variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1}>
              {t.name}
            </AppText>
            {s ? (
              <View style={{ alignItems: 'flex-end' }}>
                <AppText variant="heading" style={{ fontVariant: ['tabular-nums'] }}>
                  {s.runs}/{s.wickets}
                </AppText>
                <AppText variant="caption" color="textFaint" style={{ fontVariant: ['tabular-nums'] }}>
                  {oversText(s.legal)} ov
                </AppText>
              </View>
            ) : (
              <AppText variant="caption" color="textFaint">
                Yet to bat
              </AppText>
            )}
          </View>
        );
      })}
      <AppText variant="caption" color={live ? 'textMuted' : 'primary'} numberOfLines={2}>
        {live ? `${tossName} won the toss and chose to ${match.tossDecision}` : match.result?.text}
      </AppText>
    </Card>
  );
}
