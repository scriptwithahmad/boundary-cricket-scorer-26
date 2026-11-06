import React from 'react';
import { ConfirmSheet } from '@/src/components/ui';
import { WICKET_LABEL } from '@/src/engine/cricket';
import type { useScoringController } from '../hooks/useScoringController';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'inn' | 'rareKind' | 'rareOut' | 'wKind' | 'wOut' | 'dismissalConfirmation' | 'setDismissalConfirmation' | 'striker' | 'nonStriker' | 'name' | 'confirmWicket' | 'confirmRare'>;

export function WicketConfirmation({ controller }: { controller: Props }) {
  const { inn, rareKind, rareOut, wKind, wOut, dismissalConfirmation, setDismissalConfirmation, striker, nonStriker, name, confirmWicket, confirmRare } = controller;
  return (<ConfirmSheet visible={dismissalConfirmation !== null} title="Record this wicket?"
    message={dismissalConfirmation === 'rare' ? `${name(rareOut)}: ${rareKind ? WICKET_LABEL[rareKind] : 'dismissed'}.` : `${name(wOut === 'nonStriker' ? inn.nonStriker : inn.striker)}: ${wKind ? WICKET_LABEL[wKind] : 'dismissed'}.`}
    confirmLabel="Record wicket" onCancel={() => setDismissalConfirmation(null)}
    onConfirm={() => { const kind = dismissalConfirmation; setDismissalConfirmation(null); if (kind === 'rare') confirmRare(); else confirmWicket(); }} />);
}
