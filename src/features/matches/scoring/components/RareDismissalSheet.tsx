import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Chip, Sheet } from '@/src/components/ui';
import { WICKET_LABEL } from '@/src/engine/cricket';
import type { useScoringController } from '../hooks/useScoringController';
import { RARE_KINDS } from '../constants';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'store' | 'inn' | 'need' | 'rareOpen' | 'setRareOpen' | 'rareKind' | 'setRareKind' | 'rareOut' | 'setRareOut' | 'rareRuns' | 'setRareRuns' | 'rareExtra' | 'setRareExtra' | 'dismissalConfirmation' | 'setDismissalConfirmation' | 'striker' | 'nonStriker' | 'name' | 'pickerBatters' | 'rareCandidates' | 'betweenDeliveries' | 'confirmRare' | 'extrasOptions'>;

export function RareDismissalSheet({ controller }: { controller: Props }) {
  const { store, inn, need, rareOpen, setRareOpen, rareKind, setRareKind, rareOut, setRareOut, rareRuns, setRareRuns, rareExtra, setRareExtra, dismissalConfirmation, setDismissalConfirmation, striker, nonStriker, name, pickerBatters, rareCandidates, betweenDeliveries, confirmRare, extrasOptions } = controller;
  return (<Sheet visible={rareOpen && dismissalConfirmation === null} onClose={() => setRareOpen(false)} title="Rare dismissals"
    footer={<Button label="Confirm dismissal" variant="danger" disabled={!rareKind || !rareOut || !rareCandidates.includes(rareOut)} onPress={() => store.confirmWickets ? setDismissalConfirmation('rare') : confirmRare()} />}>
    <View style={{ gap: 8 }}>
      {RARE_KINDS.map((kind) => (
        <Button key={kind} label={WICKET_LABEL[kind]} variant={rareKind === kind ? 'soft' : 'secondary'}
          disabled={kind === 'timedout' ? !pickerBatters.length || (!!inn.striker && !!inn.nonStriker) : kind === 'retiredout' ? !inn.striker && !inn.nonStriker : !!need}
          onPress={() => {
            setRareKind(kind);
            setRareOut(kind === 'hittwice' ? inn.striker : null);
            setRareRuns(0);
            if (kind === 'hittwice' && rareExtra !== 'nb') setRareExtra(null);
          }} />
      ))}
    </View>
    {rareKind ? <>
      <AppText variant="caption" color="textMuted">{betweenDeliveries ? 'Recorded without adding a delivery.' : 'Records this delivery and the dismissal.'} No wicket is credited to the bowler.</AppText>
      <AppText variant="label" color="textMuted">{rareKind === 'timedout' ? 'Incoming batter who is out' : 'Who is out'}</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {rareCandidates.map((pid) => <Chip key={pid} label={name(pid)} selected={rareOut === pid} onPress={() => setRareOut(pid)} />)}
      </View>
      {!betweenDeliveries ? <>
        <AppText variant="label" color="textMuted">Delivery</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          <Chip label="Normal" selected={!rareExtra} onPress={() => setRareExtra(null)} />
          {extrasOptions.filter((option) => rareKind === 'obstructing' || option.k === 'nb').map((option) => <Chip key={option.k} label={option.label} selected={rareExtra === option.k} onPress={() => setRareExtra(option.k)} />)}
        </View>
      </> : null}
      {rareKind === 'obstructing' ? <>
        <AppText variant="label" color="textMuted">Runs awarded by umpire</AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{[0, 1, 2, 3, 4, 5, 6].map((runs) => <Chip key={runs} label={String(runs)} selected={rareRuns === runs} onPress={() => setRareRuns(runs)} />)}</View>
      </> : null}
    </> : null}
  </Sheet>);
}
