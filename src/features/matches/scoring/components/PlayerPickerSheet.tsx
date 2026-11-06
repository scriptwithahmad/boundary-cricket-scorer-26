import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Sheet } from '@/src/components/ui';
import { PlayerRow } from '@/src/features/players/components/PlayerRow';
import { oversText } from '@/src/engine/cricket';
import type { useScoringController } from '../hooks/useScoringController';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'inn' | 'pickerOpen' | 'pickerTarget' | 'm' | 'batTeam' | 'bowlTeam' | 'name' | 'limit' | 'bowlerOvers' | 'pickerBatters' | 'pickerBowlers' | 'openRare' | 'closePlayerPicker' | 'selectPlayer'>;

export function PlayerPickerSheet({ controller }: { controller: Props }) {
  const { inn, pickerOpen, pickerTarget, m, batTeam, bowlTeam, name, limit, bowlerOvers, pickerBatters, pickerBowlers, openRare, closePlayerPicker, selectPlayer } = controller;
  return (<Sheet
    visible={pickerOpen && pickerTarget !== null}
    onClose={closePlayerPicker}
    title={pickerTarget === 'bowler' ? 'Select bowler' : pickerTarget === 'striker' ? 'Select striker' : 'Select non-striker'}
    subtitle={
      pickerTarget === 'bowler'
        ? `${bowlTeam.name} · max ${limit} over${limit === 1 ? '' : 's'} each${inn.lastOverBowler && !m.allowConsecutiveOvers ? ' · last over’s bowler is resting' : ''}`
        : `${batTeam.name} · next in`
    }
    footer={pickerTarget !== 'bowler' && inn.balls.some((ball) => ball.wicket || ball.noDelivery) ? <Button label="Record a timed out dismissal" variant="secondary" onPress={openRare} /> : undefined}
  >
    <View style={{ gap: 8 }}>
      {pickerTarget === 'bowler' ? (
        pickerBowlers.length ? pickerBowlers.map((pid) => {
          const s = bowlerOvers(pid);
          const rested = !m.allowConsecutiveOvers && pid === inn.lastOverBowler;
          const maxed = (s?.balls ?? 0) >= limit * 6;
          return (
            <PlayerRow
              key={pid}
              name={name(pid)}
              sub={m.players[pid]?.role}
              color={bowlTeam.color}
              disabled={rested || maxed}
              onPress={() => selectPlayer(pid)}
              trailing={
                <AppText variant="caption" color="textMuted" style={{ fontVariant: ['tabular-nums'] }}>
                  {rested ? 'Rested' : maxed ? 'Quota done' : s ? `${oversText(s.balls)}-${s.maidens}-${s.runs}-${s.wickets}` : 'Fresh'}
                </AppText>
              }
            />
          );
        }) : <AppText variant="caption" color="textMuted">No other eligible bowlers are available.</AppText>
      ) : pickerBatters.length ? (
        pickerBatters.map((pid) => (
          <PlayerRow
            key={pid}
            name={name(pid)}
            sub={m.players[pid]?.role}
            color={batTeam.color}
            onPress={() => selectPlayer(pid)}
          />
        ))
      ) : (
        <AppText variant="caption" color="textMuted">No other eligible batters are available.</AppText>
      )}
    </View>
  </Sheet>);
}
