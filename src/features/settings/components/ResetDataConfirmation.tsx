import React from 'react';
import { ConfirmSheet } from '@/src/components/ui';
import type { useSettingsController } from '../hooks/useSettingsController';

type Props = Pick<ReturnType<typeof useSettingsController>, 'store' | 'confirmReset' | 'setConfirmReset' | 'setFeedback'>;

export function ResetDataConfirmation({ controller }: { controller: Props }) {
  const { store, confirmReset, setConfirmReset, setFeedback } = controller;
  return (<ConfirmSheet
    visible={confirmReset}
    title="Erase all game data?"
    message="All teams, players, matches and statistics stored on this device will be deleted permanently."
    confirmLabel="Erase everything"
    onCancel={() => setConfirmReset(false)}
    onConfirm={() => {
      store.resetAll();
      setConfirmReset(false);
      setFeedback({ text: 'All game data has been erased.', error: false });
    }}
  />);
}
