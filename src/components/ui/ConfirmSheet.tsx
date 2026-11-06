import React from 'react';
import { AppText } from './AppText';
import { Button } from './Button';
import { Sheet } from './Sheet';

export function ConfirmSheet({
  visible,
  title,
  message,
  confirmLabel = 'Delete',
  onConfirm,
  onCancel,
}: {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Sheet
      visible={visible}
      onClose={onCancel}
      title={title}
      footer={
        <>
          <Button label={confirmLabel} variant="danger" onPress={onConfirm} />
          <Button label="Cancel" variant="secondary" onPress={onCancel} />
        </>
      }
    >
      <AppText variant="body" color="textMuted">
        {message}
      </AppText>
    </Sheet>
  );
}
