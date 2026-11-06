import React from 'react';
import { View } from 'react-native';
import { AppText, Card, Segmented, Chip } from '@/src/components/ui';
import type { useSettingsController } from '../hooks/useSettingsController';
import { IOSSwitch } from './IOSSwitch';
import { styles } from '../styles';

type Props = Pick<ReturnType<typeof useSettingsController>, 'colors' | 'store'>;

export function ScoringPreferences({ controller }: { controller: Props }) {
  const { colors, store } = controller;
  return (<Card style={[styles.preferencesCard, { marginTop: 12 }]}>
    {([
      ['recordShotDirections', 'Record shot directions', 'Open the wagon wheel after runs off the bat.'],
      ['confirmWickets', 'Confirm wickets', 'Ask for a final confirmation before recording a dismissal.'],
      ['boundaryCelebrations', 'Boundary celebrations', 'Celebrate fours and sixes during live scoring.'],
      ['milestoneAlerts', 'Milestone alerts', 'Show fifties, centuries and hat-trick alerts.'],
      ['showPlayerStatistics', 'Show player statistics', 'Display batting figures and bowling statistics at the crease.'],
    ] as const).map(([key, label, description], index) => (
      <React.Fragment key={key}>
        {index ? <View style={[styles.preferenceDivider, { backgroundColor: colors.border }]} /> : null}
        <View style={styles.preferenceRow}>
          <View style={styles.preferenceCopy}>
            <AppText variant="bodyStrong">{label}</AppText>
            <AppText variant="caption" color="textMuted">{description}</AppText>
          </View>
          <IOSSwitch value={store[key]} onValueChange={(enabled) => store.setMatchPreferences({ [key]: enabled })} label={label} colors={colors} />
        </View>
      </React.Fragment>
    ))}
    <View style={[styles.preferenceDivider, { backgroundColor: colors.border }]} />
    <View style={{ gap: 10 }}>
      <AppText variant="bodyStrong">Sound volume · {Math.round(store.soundVolume * 100)}%</AppText>
      <AppText variant="caption" color="textMuted">Volume for spoken score updates when Play Sound is enabled.</AppText>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {[0, 0.25, 0.5, 0.75, 1].map((volume) => <Chip key={volume} label={volume === 0 ? 'Mute' : `${volume * 100}%`} selected={store.soundVolume === volume} onPress={() => store.setMatchPreferences({ soundVolume: volume })} />)}
      </View>
    </View>
    <View style={[styles.preferenceDivider, { backgroundColor: colors.border }]} />
    <View style={{ gap: 10 }}>
      <AppText variant="bodyStrong">Scoring layout</AppText>
      <AppText variant="caption" color="textMuted">Auto fits your screen. Choose Compact or Spacious to set your preferred spacing.</AppText>
      <Segmented value={store.scoringLayout} onChange={(scoringLayout) => store.setMatchPreferences({ scoringLayout })} options={[{ label: 'Auto', value: 'auto' }, { label: 'Compact', value: 'compact' }, { label: 'Spacious', value: 'spacious' }]} />
    </View>
  </Card>);
}
