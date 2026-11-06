import React from 'react';
import { View } from 'react-native';
import { AppText, Card } from '@/src/components/ui';
import type { useSettingsController } from '../hooks/useSettingsController';
import { IOSSwitch } from './IOSSwitch';
import { styles } from '../styles';

type Props = Pick<ReturnType<typeof useSettingsController>, 'colors' | 'store'>;

export function MatchExperienceSettings({ controller }: { controller: Props }) {
  const { colors, store } = controller;
  return (<Card style={styles.preferencesCard}>
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceCopy}>
        <AppText variant="bodyStrong">Keep screen awake</AppText>
        <AppText variant="caption" color="textMuted">
          Prevents display sleep during live match scoring.
        </AppText>
      </View>
      <IOSSwitch
        value={store.keepScreenAwake}
        onValueChange={store.setKeepScreenAwake}
        label="Keep screen awake"
        colors={colors}
      />
    </View>
    <View style={[styles.preferenceDivider, { backgroundColor: colors.border }]} />
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceCopy}>
        <AppText variant="bodyStrong">Haptic Vibration</AppText>
        <AppText variant="caption" color="textMuted">
          Vibrates your phone when you tap a scoring button.
        </AppText>
      </View>
      <IOSSwitch
        value={store.hapticVibration}
        onValueChange={store.setHapticVibration}
        label="Haptic vibration"
        colors={colors}
      />
    </View>
    <View style={[styles.preferenceDivider, { backgroundColor: colors.border }]} />
    <View style={styles.preferenceRow}>
      <View style={styles.preferenceCopy}>
        <AppText variant="bodyStrong">Play Sound</AppText>
        <AppText variant="caption" color="textMuted">
          Speaks score updates as you record deliveries.
        </AppText>
      </View>
      <IOSSwitch
        value={store.playSound}
        onValueChange={store.setPlaySound}
        label="Play Sound"
        colors={colors}
      />
    </View>
  </Card>);
}
