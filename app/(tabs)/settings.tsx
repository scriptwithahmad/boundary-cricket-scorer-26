import React, { useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Download, Mail, MessageCircle, Moon, Smartphone, Sun, Trash2, Upload } from 'lucide-react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Directory, File } from 'expo-file-system';
import {
  AppText,
  Button,
  Card,
  ConfirmSheet,
  Screen,
  ScreenHeader,
  SectionHeader,
  Tap,
} from '@/src/components/ui';
import { useStore } from '@/src/store';
import { useTheme } from '@/src/theme';
import type { Palette, ThemeMode } from '@/src/theme';
import type { AppData, Match, Player, Team } from '@/src/types';

type Backup = { version: 1; exportedAt: string; data: AppData };

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isTeam(value: unknown): value is Team {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.short === 'string' &&
    typeof value.color === 'string' &&
    typeof value.createdAt === 'number'
  );
}

function isPlayer(value: unknown): value is Player {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.teamId === 'string' &&
    typeof value.name === 'string' &&
    ['Batter', 'Bowler', 'All-rounder', 'Keeper'].includes(String(value.role))
  );
}

function isMatch(value: unknown): value is Match {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.createdAt === 'number' &&
    ['T20', 'ODI', 'Custom'].includes(String(value.format)) &&
    typeof value.overs === 'number' &&
    typeof value.teamAId === 'string' &&
    typeof value.teamBId === 'string' &&
    isRecord(value.squads) &&
    isRecord(value.teams) &&
    isRecord(value.players) &&
    typeof value.tossWinnerId === 'string' &&
    (value.tossDecision === 'bat' || value.tossDecision === 'bowl') &&
    Array.isArray(value.innings) &&
    value.innings.every(
      (innings) =>
        isRecord(innings) &&
        typeof innings.battingTeamId === 'string' &&
        typeof innings.bowlingTeamId === 'string' &&
        Array.isArray(innings.balls) &&
        (innings.status === 'live' || innings.status === 'done'),
    ) &&
    (value.status === 'live' || value.status === 'completed')
  );
}

function parseBackup(text: string): AppData {
  let backup: unknown;
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }

  if (
    !isRecord(backup) ||
    backup.version !== 1 ||
    !isRecord(backup.data) ||
    !Array.isArray(backup.data.teams) ||
    !Array.isArray(backup.data.players) ||
    !Array.isArray(backup.data.matches) ||
    !backup.data.teams.every(isTeam) ||
    !backup.data.players.every(isPlayer) ||
    !backup.data.matches.every(isMatch)
  ) {
    throw new Error('This file is not a valid Boundary game data backup.');
  }

  const teams = backup.data.teams;
  const players = backup.data.players;
  if (players.some((player) => !teams.some((team) => team.id === player.teamId))) {
    throw new Error('This backup contains players without a matching team.');
  }

  return { teams, players, matches: backup.data.matches };
}

function backupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `boundary-game-data-${timestamp}.json`;
}

const appearanceOptions: {
  label: string;
  value: ThemeMode;
  icon: typeof Smartphone;
}[] = [
  { label: 'System', value: 'system', icon: Smartphone },
  { label: 'Light', value: 'light', icon: Sun },
  { label: 'Dark', value: 'dark', icon: Moon },
];

function AppearanceTabs({
  colors,
  mode,
  setMode,
}: {
  colors: Palette;
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}) {
  const [trackWidth, setTrackWidth] = useState(0);
  const indicatorX = useSharedValue(0);
  const previousMode = useRef(mode);
  const reduceMotion = useReducedMotion();
  const selectedIndex = appearanceOptions.findIndex((option) => option.value === mode);
  const segmentWidth = Math.max(0, (trackWidth - 12) / appearanceOptions.length);
  const indicatorStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: indicatorX.value }],
  }));

  useEffect(() => {
    if (previousMode.current === mode) return;
    previousMode.current = mode;
    const nextPosition = selectedIndex * segmentWidth;
    indicatorX.value = reduceMotion
      ? nextPosition
      : withTiming(nextPosition, { duration: 220, easing: Easing.out(Easing.cubic) });
  }, [indicatorX, mode, reduceMotion, segmentWidth, selectedIndex]);

  return (
    <View
      style={[styles.appearance, { backgroundColor: colors.surface }]}
      onLayout={(event) => {
        const width = event.nativeEvent.layout.width;
        setTrackWidth(width);
        indicatorX.value = selectedIndex * Math.max(0, (width - 12) / appearanceOptions.length);
      }}
    >
      <Animated.View
        pointerEvents="none"
        style={[
          styles.appearanceIndicator,
          { width: segmentWidth, backgroundColor: colors.primarySoft },
          indicatorStyle,
        ]}
      />
      <View style={styles.appearanceTabs}>
        {appearanceOptions.map(({ label, value, icon: Icon }) => {
          const selected = mode === value;
          return (
            <Tap
              key={value}
              onPress={() => setMode(value)}
              accessibilityRole="tab"
              accessibilityLabel={label}
              accessibilityState={{ selected }}
              style={styles.appearanceTab}
            >
              <Icon size={17} color={selected ? colors.primary : colors.textMuted} strokeWidth={2.2} />
              <AppText
                variant="bodyStrong"
                color={selected ? 'primary' : 'textMuted'}
                style={styles.appearanceTabLabel}
                numberOfLines={1}
              >
                {label}
              </AppText>
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

function IOSSwitch({
  value,
  onValueChange,
  label,
  colors,
}: {
  value: boolean;
  onValueChange: (value: boolean) => void;
  label: string;
  colors: Palette;
}) {
  const progress = useSharedValue(value ? 1 : 0);
  const reduceMotion = useReducedMotion();
  const thumbStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: progress.value * 16 }],
  }));

  useEffect(() => {
    progress.value = reduceMotion ? (value ? 1 : 0) : withTiming(value ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, reduceMotion, value]);

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityLabel={label}
      accessibilityState={{ checked: value }}
      onPress={() => onValueChange(!value)}
      hitSlop={8}
      style={[
        styles.iosSwitch,
        {
          backgroundColor: value ? colors.primary : colors.surfaceAlt,
          borderColor: value ? colors.primary : colors.border,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.iosSwitchThumb,
          { backgroundColor: '#FFFFFF' },
          thumbStyle,
        ]}
      />
    </Pressable>
  );
}

export default function SettingsScreen() {
  const { colors, mode, setMode } = useTheme();
  const store = useStore();
  const [confirmReset, setConfirmReset] = useState(false);
  const [pendingImport, setPendingImport] = useState<AppData | null>(null);
  const [feedback, setFeedback] = useState<{ text: string; error: boolean } | null>(null);

  const openContact = async (url: string, fallback: string) => {
    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Could not open contact link', fallback);
    }
  };

  const exportData = async () => {
    const data: AppData = {
      teams: store.teams,
      players: store.players,
      matches: store.matches,
    };
    const backup: Backup = { version: 1, exportedAt: new Date().toISOString(), data };
    const content = JSON.stringify(backup, null, 2);
    const filename = backupFilename();

    try {
      if (Platform.OS === 'web') {
        const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        window.setTimeout(() => URL.revokeObjectURL(url), 0);
      } else {
        const directory = await Directory.pickDirectoryAsync();
        const file = directory.createFile(filename, 'application/json');
        await file.write(content);
      }
      setFeedback({ text: `Backup saved as ${filename}.`, error: false });
    } catch (error) {
      setFeedback({
        text: `Could not export game data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: true,
      });
    }
  };

  const importData = async () => {
    try {
      let text: string | null;
      if (Platform.OS === 'web') {
        text = await new Promise((resolve, reject) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json,application/json';
          input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) {
              resolve(null);
              return;
            }
            try {
              resolve(await file.text());
            } catch (error) {
              reject(error);
            }
          };
          input.oncancel = () => resolve(null);
          input.click();
        });
      } else {
        const selection = await File.pickFileAsync({ mimeTypes: ['application/json'] });
        text = selection.canceled ? null : await selection.result.text();
      }

      if (text === null) return;
      setPendingImport(parseBackup(text));
      setFeedback(null);
    } catch (error) {
      setFeedback({
        text: `Could not import game data: ${error instanceof Error ? error.message : 'Unknown error'}`,
        error: true,
      });
    }
  };

  const confirmImport = () => {
    if (!pendingImport) return;
    store.replaceData(pendingImport);
    setPendingImport(null);
    setFeedback({ text: 'Game data imported successfully.', error: false });
  };

  return (
    <Screen>
      <ScreenHeader title="Settings" subtitle="Appearance, backup and data" />

      <SectionHeader title="Appearance" />
      <AppearanceTabs colors={colors} mode={mode} setMode={setMode} />

      <SectionHeader title="Match experience" />
      <Card style={styles.preferencesCard}>
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
      </Card>

      <SectionHeader title="Data" />
      <Card style={styles.dataCard}>
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
      </Card>

      <SectionHeader title="Contact us" />
      <Card style={styles.dataCard}>
        <AppText variant="caption" color="textMuted">
          Share your reviews, report bugs, or get help with issues via WhatsApp or email.
        </AppText>
        <Button
          label="WhatsApp: 0309-9968433"
          icon={MessageCircle}
          variant="secondary"
          onPress={() => openContact('https://wa.me/923099968433', 'Contact us on WhatsApp at 0309-9968433.')}
        />
        <Button
          label="scriptwithahmad@gmail.com"
          icon={Mail}
          variant="secondary"
          onPress={() => openContact('mailto:scriptwithahmad@gmail.com?subject=Boundary%20feedback%20or%20issue', 'Email us at scriptwithahmad@gmail.com.')}
        />
      </Card>

      <SectionHeader title="Danger zone" />
      <Card style={styles.dangerCard}>
        <View style={styles.dangerCopy}>
          <AppText variant="bodyStrong">Erase all game data</AppText>
          <AppText variant="caption" color="textMuted">
            Permanently remove all teams, players and matches from this device.
          </AppText>
        </View>
        <Button label="Erase all game data" icon={Trash2} variant="danger" onPress={() => setConfirmReset(true)} />
      </Card>

      <ConfirmSheet
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
      />
      <ConfirmSheet
        visible={pendingImport !== null}
        title="Replace game data?"
        message="Importing this backup replaces all teams, players and matches currently stored on this device."
        confirmLabel="Import and replace"
        onCancel={() => setPendingImport(null)}
        onConfirm={confirmImport}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  appearance: { padding: 6, borderRadius: 18, overflow: 'hidden' },
  appearanceIndicator: { position: 'absolute', top: 6, bottom: 6, left: 6, borderRadius: 12 },
  appearanceTabs: { flexDirection: 'row' },
  appearanceTab: { minWidth: 0, minHeight: 48, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, borderRadius: 12 },
  appearanceTabLabel: { fontSize: 13 },
  preferencesCard: { gap: 12 },
  preferenceRow: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12 },
  preferenceCopy: { flex: 1, gap: 2 },
  preferenceDivider: { height: StyleSheet.hairlineWidth },
  iosSwitch: {
    width: 44,
    height: 26,
    padding: 2,
    borderRadius: 13,
    borderWidth: 1,
    justifyContent: 'center',
  },
  iosSwitchThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
  },
  dataCard: { gap: 12 },
  counts: { flexDirection: 'row', gap: 8 },
  count: { flex: 1, minHeight: 58, justifyContent: 'center', paddingHorizontal: 10, borderRadius: 12, gap: 1 },
  countNumber: { fontVariant: ['tabular-nums'] },
  dangerCard: { gap: 14 },
  dangerCopy: { gap: 4 },
});
