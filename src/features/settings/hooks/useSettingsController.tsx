import React, { useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { Directory, File } from 'expo-file-system';
import { useStore } from '@/src/store';
import { useTheme } from '@/src/theme';
import type { AppData } from '@/src/types';
import type { Backup } from '../utils/backup';
import { parseBackup } from '../utils/backup';
import { backupFilename } from '../utils/backup';

export function useSettingsController() {
  const { colors, mode, setMode, isDark, themeColor, setThemeColor } = useTheme();
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


  return {
    colors,
    mode,
    setMode,
    isDark,
    themeColor,
    setThemeColor,
    store,
    confirmReset,
    setConfirmReset,
    pendingImport,
    setPendingImport,
    feedback,
    setFeedback,
    openContact,
    exportData,
    importData,
    confirmImport,
  };
}
