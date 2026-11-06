import React from 'react';
import { ConfirmSheet } from '@/src/components/ui';
import type { useScoringController } from '../hooks/useScoringController';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'id' | 'store' | 'confirmEnd' | 'setConfirmEnd' | 'm'>;

export function EndInningsConfirmation({ controller }: { controller: Props }) {
  const { id, store, confirmEnd, setConfirmEnd, m } = controller;
  return (<ConfirmSheet
    visible={confirmEnd}
    title="End this innings?"
    message="The innings will be closed with the current score. You can still undo the last ball afterwards."
    confirmLabel="End innings"
    onCancel={() => setConfirmEnd(false)}
    onConfirm={() => {
      store.endInnings(m.id);
      setConfirmEnd(false);
    }}
  />);
}
