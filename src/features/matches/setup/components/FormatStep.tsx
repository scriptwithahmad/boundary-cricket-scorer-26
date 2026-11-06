import React from 'react';
import { View } from 'react-native';

import { AppText, Card, Chip, Stepper, Tap } from '@/src/components/ui';

import type { useNewMatchController } from '../hooks/useNewMatchController';

type Props = Pick<ReturnType<typeof useNewMatchController>, 'colors' | 'step' | 'format' | 'setFormat' | 'customOvers' | 'setCustomOvers' | 'customBowlerLimit' | 'setCustomBowlerLimit' | 'allowConsecutiveOvers' | 'setAllowConsecutiveOvers' | 'overs' | 'bowlerLimit' | 'formats'>;

export function FormatStep({ controller }: { controller: Props }) {
  const { colors, step, format, setFormat, customOvers, setCustomOvers, customBowlerLimit, setCustomBowlerLimit, allowConsecutiveOvers, setAllowConsecutiveOvers, overs, bowlerLimit, formats } = controller;
  return (step === 0 ? (
    <View style={{ gap: 12 }}>
      {formats.map((x) => {
        const on = format === x.f;
        return (
          <Tap
            key={x.f}
            onPress={() => setFormat(x.f)}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 16,
              padding: 18,
              borderRadius: 22,
              backgroundColor: on ? colors.primarySoft : colors.surface,
              borderWidth: 1.5,
              borderColor: on ? colors.primary : colors.border,
            }}
          >
            <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: on ? colors.primary : colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
              <x.icon size={22} color={on ? colors.onPrimary : colors.textMuted} strokeWidth={2.4} />
            </View>
            <View style={{ flex: 1 }}>
              <AppText variant="heading">{x.title}</AppText>
              <AppText variant="caption" color="textMuted">
                {x.sub}
              </AppText>
            </View>
          </Tap>
        );
      })}
      {format === 'Custom' ? (
        <Card style={{ gap: 12, alignItems: 'center' }}>
          <AppText variant="label" color="textMuted">
            Overs per innings
          </AppText>
          <Stepper value={customOvers} onChange={setCustomOvers} min={1} max={50} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            {[5, 8, 10, 15, 30].map((o) => (
              <Chip key={o} label={`${o}`} selected={customOvers === o} onPress={() => setCustomOvers(o)} />
            ))}
          </View>
        </Card>
      ) : null}
      {format === 'Custom' ? (
        <Card style={{ gap: 12, alignItems: 'center' }}>
          <AppText variant="label" color="textMuted">Maximum overs per bowler</AppText>
          <Stepper value={bowlerLimit} onChange={setCustomBowlerLimit} min={1} max={overs} />
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <Chip label="Automatic" selected={customBowlerLimit === null} onPress={() => setCustomBowlerLimit(null)} />
            <Chip label="No limit" selected={customBowlerLimit === overs} onPress={() => setCustomBowlerLimit(overs)} />
          </View>
          <AppText variant="caption" color="textMuted">Allow the same bowler to bowl consecutive overs?</AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Chip label="No" selected={!allowConsecutiveOvers} onPress={() => setAllowConsecutiveOvers(false)} />
            <Chip label="Yes" selected={allowConsecutiveOvers} onPress={() => setAllowConsecutiveOvers(true)} />
          </View>
        </Card>
      ) : null}
      <AppText variant="caption" color="textMuted" style={{ textAlign: 'center', marginTop: 4 }}>
        Each bowler can bowl up to {bowlerLimit} over{bowlerLimit === 1 ? '' : 's'}.
      </AppText>
    </View>
  ) : null);
}
