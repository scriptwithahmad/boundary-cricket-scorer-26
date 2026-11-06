import React from 'react';
import { ConfirmSheet } from '@/src/components/ui';
import type { useSettingsController } from '../hooks/useSettingsController';

type Props = Pick<ReturnType<typeof useSettingsController>, 'pendingImport' | 'setPendingImport' | 'confirmImport'>;

export function ImportDataConfirmation({ controller }: { controller: Props }) {
  const { pendingImport, setPendingImport, confirmImport } = controller;
  return (<ConfirmSheet
    visible={pendingImport !== null}
    title="Replace game data?"
    message="Importing this backup replaces all teams, players and matches currently stored on this device."
    confirmLabel="Import and replace"
    onCancel={() => setPendingImport(null)}
    onConfirm={confirmImport}
  />);
}
