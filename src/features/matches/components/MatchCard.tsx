import React from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowUpRight } from 'lucide-react-native';
import { fonts, useTheme } from '@/src/theme';
import { TeamBadgeIcon } from '@/src/components/cricket/TeamBadgeIcon';
import { oversText, teamScore } from '@/src/engine/cricket';
import type { Match } from '@/src/types';
import { AppText, Badge, Card, LiveDot } from '@/src/components/ui';
import { Avatar } from '@/src/components/cricket/Avatar';

export const fmtDate = (t: number) =>
  new Date(t).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });

export function MatchCard({ match, index }: { match: Match; index?: number }) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const live = match.status === 'live';
  const ids = [match.teamAId, match.teamBId];
  const winner = match.result?.winnerId;
  const tossName = match.teams[match.tossWinnerId]?.name;

  if (match.status === 'completed') {
    return (
      <Card
        index={index}
        onPress={() => router.push(`/match/${match.id}` as any)}
        style={{ padding: 0, overflow: 'hidden', borderWidth: 1, borderColor: isDark ? '#FFFFFF12' : `${colors.primary}18` }}
      >
        <LinearGradient
          colors={[colors.surfaceAlt, colors.surface]}
          start={{ x: 1, y: 0 }} end={{ x: 0, y: 1 }}
          style={{ padding: 16, gap: 18 }}
        >
          <LinearGradient
            pointerEvents="none"
            colors={['transparent', `${colors.primary}70`, 'transparent']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            style={{ position: 'absolute', top: 0, left: 20, right: 20, height: 1 }}
          />
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <View style={{ backgroundColor: `${colors.primary}12`, borderRadius: 6, paddingHorizontal: 9, paddingVertical: 5 }}>
              <AppText variant="label" color="primary" style={{ fontSize: 10, letterSpacing: 1 }}>
                {match.format === 'Custom' ? `${match.overs} OV` : match.format}
              </AppText>
            </View>
            <AppText variant="caption" color="textFaint" style={{ fontSize: 10 }}>{fmtDate(match.createdAt)}</AppText>
          </View>
          {ids.map((id) => {
            const team = match.teams[id];
            const score = teamScore(match, id);
            const lost = winner != null && winner !== id;
            return (
              <View key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: `${team.color}24`, alignItems: 'center', justifyContent: 'center' }}>
                  {team.badge && team.badge !== 'initials' ? (
                    <TeamBadgeIcon badge={team.badge} size={21} color={team.color} />
                  ) : (
                    <AppText style={{ color: team.color, fontFamily: fonts.extrabold, fontSize: 11 }}>{team.short.slice(0, 2).toUpperCase()}</AppText>
                  )}
                </View>
                <AppText variant="bodyStrong" color={lost ? 'textMuted' : 'text'} numberOfLines={1} style={{ flex: 1, fontSize: 13 }}>{team.name}</AppText>
                {score ? (
                  <View style={{ alignItems: 'flex-end', gap: 2 }}>
                    <AppText color={lost ? 'textMuted' : 'text'} style={{ fontFamily: fonts.extrabold, fontSize: 23, lineHeight: 28, letterSpacing: -0.8, fontVariant: ['tabular-nums'] }}>{score.runs}/{score.wickets}</AppText>
                    <AppText variant="caption" color="textFaint" style={{ fontSize: 10, fontVariant: ['tabular-nums'] }}>{oversText(score.legal)} overs</AppText>
                  </View>
                ) : <AppText variant="caption" color="textFaint">Yet to bat</AppText>}
              </View>
            );
          })}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, borderTopWidth: 1, borderTopColor: isDark ? '#FFFFFF0B' : `${colors.primary}12`, paddingTop: 13 }}>
            <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: colors.primary, shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 5, shadowOffset: { width: 0, height: 0 } }} />
            <AppText variant="caption" color="primary" numberOfLines={2} style={{ flex: 1, fontSize: 11, fontFamily: fonts.semibold }}>{match.result?.text}</AppText>
            <ArrowUpRight size={15} color={colors.primary} />
          </View>
        </LinearGradient>
      </Card>
    );
  }

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
