import React from 'react';
import { View } from 'react-native';
import { Download, Upload } from 'lucide-react-native';
import { AppText, Button, Card } from '@/src/components/ui';
import type { useSettingsController } from '../hooks/useSettingsController';
import { styles } from '../styles';

type Props = Pick<ReturnType<typeof useSettingsController>, 'colors' | 'store' | 'feedback' | 'exportData' | 'importData'>;

export function DataSettings({ controller }: { controller: Props }) {
  const { colors, store, feedback, exportData, importData } = controller;
  return (<Card style={styles.dataCard}>
    <View style={styles.counts}>
      {[
        { label: 'Teams', count: store.teams.length },
        { label: 'Players', count: store.players.length },
        { label: 'Matches', count: store.matches.length },
      ].map(({ label, count }) => (
        <View key={label} style={[styles.count, { backgroundColor: colors.surfaceAlt }]}>
          <AppText variant="heading" style={styles.countNumber}>{count}</AppText>
          <AppText variant="caption" color="textMuted">{label}</AppText>
        </View>
      ))}
    </View>
    <AppText variant="caption" color="textMuted">
      Export your teams, players and matches to a JSON file, or import a backup to replace the data on this device.
    </AppText>
    <Button label="Export game data" icon={Download} onPress={exportData} />
    <Button label="Import game data" icon={Upload} variant="secondary" onPress={importData} />
    {feedback ? (
      <AppText variant="caption" color={feedback.error ? 'danger' : 'primary'}>
        {feedback.text}
      </AppText>
    ) : null}
  </Card>);
}
