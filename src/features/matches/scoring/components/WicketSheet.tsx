import React from 'react';
import { View } from 'react-native';
import { AppText, Button, Chip, Sheet } from '@/src/components/ui';
import { WICKET_LABEL } from '@/src/engine/cricket';
import type { useScoringController } from '../hooks/useScoringController';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'store' | 'inn' | 'extra' | 'wicketOpen' | 'setWicketOpen' | 'wKind' | 'setWKind' | 'wOut' | 'setWOut' | 'wFielder' | 'setWFielder' | 'wRuns' | 'setWRuns' | 'dismissalConfirmation' | 'setDismissalConfirmation' | 'striker' | 'nonStriker' | 'name' | 'kinds' | 'confirmWicket' | 'bowlers' | 'hint'>;

export function WicketSheet({ controller }: { controller: Props }) {
  const { store, inn, extra, wicketOpen, setWicketOpen, wKind, setWKind, wOut, setWOut, wFielder, setWFielder, wRuns, setWRuns, dismissalConfirmation, setDismissalConfirmation, striker, nonStriker, name, kinds, confirmWicket, bowlers, hint } = controller;
  return (<Sheet
    visible={wicketOpen && dismissalConfirmation === null}
    onClose={() => setWicketOpen(false)}
    title="Wicket"
    subtitle={extra ? hint[extra].split(' — ')[0] + ' delivery' : `${name(inn.striker)} on strike`}
    footer={<Button label="Confirm wicket" variant="danger" disabled={!wKind} onPress={() => store.confirmWickets ? setDismissalConfirmation('regular') : confirmWicket()} />}
  >
    <View style={{ gap: 8 }}>
      <AppText variant="label" color="textMuted">
        How out
      </AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {kinds.map((k) => (
          <Chip
            key={k}
            label={WICKET_LABEL[k]}
            selected={wKind === k}
            selectedBackgroundColor="#F5D2D6"
            selectedTextColor="#971B29"
            onPress={() => setWKind(k)}
          />
        ))}
      </View>
    </View>
    {wKind === 'runout' ? (
      <>
        <View style={{ gap: 8 }}>
          <AppText variant="label" color="textMuted">
            Who is out
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label={name(inn.striker)} selected={wOut === 'striker'} onPress={() => setWOut('striker')} />
            <Chip label={name(inn.nonStriker)} selected={wOut === 'nonStriker'} onPress={() => setWOut('nonStriker')} />
          </View>
        </View>
        <View style={{ gap: 8 }}>
          <AppText variant="label" color="textMuted">
            Runs completed
          </AppText>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {[0, 1, 2, 3].map((r) => (
              <Chip key={r} label={String(r)} selected={wRuns === r} onPress={() => setWRuns(r)} />
            ))}
          </View>
        </View>
      </>
    ) : null}
    {wKind === 'caught' || wKind === 'stumped' || wKind === 'runout' ? (
      <View style={{ gap: 8 }}>
        <AppText variant="label" color="textMuted">
          {wKind === 'stumped' ? 'Keeper' : 'Fielder'} (optional)
        </AppText>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {bowlers.map((pid) => (
            <Chip
              key={pid}
              label={name(pid)}
              selected={wFielder === pid}
              selectedBackgroundColor="#F5D2D6"
              selectedTextColor="#971B29"
              onPress={() => setWFielder(wFielder === pid ? null : pid)}
            />
          ))}
        </View>
      </View>
    ) : null}
  </Sheet>);
}
