import React from 'react';
import { View } from 'react-native';

import { Check, Coins, RotateCw } from 'lucide-react-native';
import { AppText, Button, Card, Tap } from '@/src/components/ui';
import { Avatar } from '@/src/components/cricket/Avatar';
import type { useNewMatchController } from '../hooks/useNewMatchController';

type Props = Pick<ReturnType<typeof useNewMatchController>, 'colors' | 'store' | 'step' | 'format' | 'allowConsecutiveOvers' | 'teamA' | 'teamB' | 'tossWinner' | 'setTossWinner' | 'decision' | 'setDecision' | 'openCoinSheet' | 'overs' | 'bowlerLimit' | 'teamName'>;

export function TossStep({ controller }: { controller: Props }) {
  const { colors, store, step, format, allowConsecutiveOvers, teamA, teamB, tossWinner, setTossWinner, decision, setDecision, openCoinSheet, overs, bowlerLimit, teamName } = controller;
  return (step === 3 && teamA && teamB ? (
    <View style={{ gap: 16 }}>
      <Card style={{ gap: 12 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
            <Coins size={20} color={colors.primary} strokeWidth={2.2} />
          </View>
          <View style={{ flex: 1 }}>
            <AppText variant="bodyStrong">Flip for the toss</AppText>
            <AppText variant="caption" color="textMuted">One team calls heads or tails. The matching call wins.</AppText>
          </View>
        </View>
        <Button label="Flip coin" icon={RotateCw} variant="soft" onPress={openCoinSheet} />
      </Card>
      <AppText variant="label" color="textMuted">
        Who won the toss?
      </AppText>
      {[teamA, teamB].map((tid) => {
        const t = store.teams.find((x) => x.id === tid)!;
        const on = (tossWinner ?? teamA) === tid;
        return (
          <Tap
            key={tid}
            onPress={() => setTossWinner(tid)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              padding: 16,
              borderRadius: 20,
              backgroundColor: on ? colors.primarySoft : colors.surface,
              borderWidth: 1.5,
              borderColor: on ? colors.primary : colors.border,
            }}
          >
            <Avatar name={t.short} color={t.color} size={44} badge={t.badge} />
            <AppText variant="heading" style={{ flex: 1 }}>
              {t.name}
            </AppText>
            {on ? (
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                <Check size={17} color={colors.onPrimary} strokeWidth={3} />
              </View>
            ) : null}
          </Tap>
        );
      })}
      <AppText variant="label" color="textMuted" style={{ marginTop: 8 }}>
        They chose to
      </AppText>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Button label="Bat first" variant={decision === 'bat' ? 'soft' : 'secondary'} onPress={() => setDecision('bat')} />
        </View>
        <View style={{ flex: 1 }}>
          <Button label="Bowl first" variant={decision === 'bowl' ? 'soft' : 'secondary'} onPress={() => setDecision('bowl')} />
        </View>
      </View>
      <Card style={{ marginTop: 8, gap: 4 }}>
        <AppText variant="caption" color="textMuted">
          {format === 'Custom' ? `${overs}-over match` : format}
        </AppText>
        <AppText variant="caption" color="textMuted">
          Maximum {bowlerLimit} overs per bowler. {format === 'Custom' && allowConsecutiveOvers ? 'Consecutive overs allowed.' : 'Bowlers alternate overs.'}
        </AppText>
        <AppText variant="bodyStrong">
          {teamName(teamA)} v {teamName(teamB)}
        </AppText>
        <AppText variant="caption" color="textMuted">
          {teamName(tossWinner ?? teamA)} won the toss and chose to {decision}.
        </AppText>
      </Card>
    </View>
  ) : null);
}
