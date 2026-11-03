import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useColorScheme, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'system' | 'light' | 'dark';

export interface Palette {
  bg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  onPrimary: string;
  primarySoft: string;
  accent: string;
  onAccent: string;
  accentSoft: string;
  danger: string;
  onDanger: string;
  dangerSoft: string;
  four: string;
  fourSoft: string;
  six: string;
  sixSoft: string;
  overlay: string;
  heroA: string;
  heroB: string;
  onHero: string;
  onHeroMuted: string;
}

export const darkColors: Palette = {
  bg: '#080F0C',
  surface: '#0F1915',
  surfaceAlt: '#16241E',
  border: '#1F322A',
  text: '#EDF4EE',
  textMuted: '#9DB2A5',
  textFaint: '#7A9185',
  primary: '#52E08C',
  onPrimary: '#032312',
  primarySoft: '#12301F',
  accent: '#FF7A3D',
  onAccent: '#2A0E00',
  accentSoft: '#3A1D0F',
  danger: '#FF5C66',
  onDanger: '#2B0508',
  dangerSoft: '#3A1519',
  four: '#4DA8FF',
  fourSoft: '#122A44',
  six: '#F6C244',
  sixSoft: '#3A2E0E',
  overlay: 'rgba(0,0,0,0.6)',
  heroA: '#14693C',
  heroB: '#0A3A22',
  onHero: '#F2FBF4',
  onHeroMuted: '#A9D4B8',
};

export const lightColors: Palette = {
  bg: '#F3F0E6',
  surface: '#FCFBF7',
  surfaceAlt: '#E9E5D8',
  border: '#DAD5C4',
  text: '#13201A',
  textMuted: '#4F6056',
  textFaint: '#6E7D73',
  primary: '#12703A',
  onPrimary: '#F2FBF4',
  primarySoft: '#DCEFE0',
  accent: '#D9531A',
  onAccent: '#FFF4EC',
  accentSoft: '#F8E1D3',
  danger: '#C92A35',
  onDanger: '#FFF1F1',
  dangerSoft: '#F7DADC',
  four: '#1B63C4',
  fourSoft: '#D8E6F8',
  six: '#9A6200',
  sixSoft: '#F6E7C3',
  overlay: 'rgba(10,20,14,0.45)',
  heroA: '#14693C',
  heroB: '#0A3A22',
  onHero: '#F2FBF4',
  onHeroMuted: '#A9D4B8',
};

export const fonts = {
  regular: 'PlusJakartaSans_400Regular',
  medium: 'PlusJakartaSans_500Medium',
  semibold: 'PlusJakartaSans_600SemiBold',
  bold: 'PlusJakartaSans_700Bold',
  extrabold: 'PlusJakartaSans_800ExtraBold',
};

export const radius = { sm: 8, md: 12, lg: 16, xl: 24, pill: 999 };
export const TEAM_COLORS = ['#34C77B', '#FF7A3D', '#4DA8FF', '#F6C244', '#B58CFF', '#FF6E98', '#2EC4C4', '#E3DFCF'];

interface ThemeCtx {
  colors: Palette;
  isDark: boolean;
  mode: ThemeMode;
  setMode: (m: ThemeMode) => void;
}

const Ctx = createContext<ThemeCtx | null>(null);
const KEY = 'boundary:theme';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const system = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((v) => {
        if (v === 'light' || v === 'dark' || v === 'system') setModeState(v);
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    AsyncStorage.setItem(KEY, m).catch(() => {});
  }, []);

  const isDark = mode === 'system' ? system !== 'light' : mode === 'dark';
  const value = useMemo(
    () => ({ colors: isDark ? darkColors : lightColors, isDark, mode, setMode }),
    [isDark, mode, setMode],
  );

  if (!ready) return <View style={{ flex: 1, backgroundColor: darkColors.bg }} />;
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useTheme() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useTheme must be used inside ThemeProvider');
  return v;
}
