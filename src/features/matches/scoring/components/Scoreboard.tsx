import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Animated from 'react-native-reanimated';
import { AppText } from '@/src/components/ui';
import { oversText } from '@/src/engine/cricket';
import type { useScoringController } from '../hooks/useScoringController';
import { styles } from '../constants';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'colors' | 'compact' | 'inn' | 't' | 'pop' | 'm' | 'batTeam' | 'name' | 'crr' | 'ballsLeft' | 'need2' | 'rrr'>;

export function Scoreboard({ controller }: { controller: Props }) {
  const { colors, compact, inn, t, pop, m, batTeam, name, crr, ballsLeft, need2, rrr } = controller;
  return (<LinearGradient colors={[colors.heroA, colors.heroB]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.board, compact && { padding: 14, gap: 4, borderRadius: 22 }]}>
    <View style={[styles.ring, { width: 220, height: 220, right: -80, top: -90 }]} />
    <View style={[styles.ring, { width: 120, height: 120, right: -20, top: -30 }]} />
    <AppText variant="label" color={colors.onHeroMuted}>
      {batTeam.name} batting
    </AppText>
    <Animated.View style={[{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }, pop]}>
      <AppText variant="score" color={colors.onHero} style={compact ? { fontSize: 44, lineHeight: 48 } : undefined}>
        {t.runs}/{t.wickets}
      </AppText>
      <AppText variant="heading" color={colors.onHeroMuted} style={{ paddingBottom: 8, fontVariant: ['tabular-nums'] }}>
        {oversText(t.legal)} / {m.overs}
      </AppText>
    </Animated.View>
    <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
      <View>
        <AppText variant="label" color={colors.onHeroMuted}>
          CRR
        </AppText>
        <AppText variant="bodyStrong" color={colors.onHero}>
          {crr}
        </AppText>
      </View>
      {inn.target !== undefined ? (
        <>
          <View>
            <AppText variant="label" color={colors.onHeroMuted}>
              Target
            </AppText>
            <AppText variant="bodyStrong" color={colors.onHero}>
              {inn.target}
            </AppText>
          </View>
          <View>
            <AppText variant="label" color={colors.onHeroMuted}>
              RRR
            </AppText>
            <AppText variant="bodyStrong" color={colors.onHero}>
              {rrr}
            </AppText>
          </View>
        </>
      ) : null}
    </View>
    {inn.target !== undefined && inn.status === 'live' ? (
      <AppText variant="bodyStrong" color={colors.onHero}>
        Need {Math.max(0, need2)} from {ballsLeft} ball{ballsLeft === 1 ? '' : 's'}
      </AppText>
    ) : null}
  </LinearGradient>);
}
