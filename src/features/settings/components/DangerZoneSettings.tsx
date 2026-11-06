import React from 'react';
import { View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { AppText, Button, Card } from '@/src/components/ui';
import type { useSettingsController } from '../hooks/useSettingsController';
import { styles } from '../styles';

type Props = Pick<ReturnType<typeof useSettingsController>, 'setConfirmReset'>;

export function DangerZoneSettings({ controller }: { controller: Props }) {
  const { setConfirmReset } = controller;
  return (<Card style={styles.dangerCard}>
    <View style={styles.dangerCopy}>
      <AppText variant="bodyStrong">Erase all game data</AppText>
      <AppText variant="caption" color="textMuted">
        Permanently remove all teams, players and matches from this device.
      </AppText>
    </View>
    <Button label="Erase all game data" icon={Trash2} variant="danger" onPress={() => setConfirmReset(true)} />
  </Card>);
}
