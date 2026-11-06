import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AppData, Match, NewMatchConfig, Player, Role, Team } from '../types';
import {
  applyBall,
  BallInput,
  careerStats,
  Career,
  createMatch as buildMatch,
  endInnings,
  setCrease,
  setPlayerOfMatch as choosePlayerOfMatch,
  startNextInnings,
  swapStrike,
  uid,
  undoBall,
} from '../engine/cricket';
import { darkColors } from '../theme';

const KEY = 'boundary:data:v1';
const PREFERENCES_KEY = 'boundary:preferences:v1';

interface AppPreferences {
  keepScreenAwake: boolean;
  hapticVibration: boolean;
  playSound: boolean;
}

const defaultPreferences: AppPreferences = { keepScreenAwake: true, hapticVibration: true, playSound: false };

interface StoreApi extends AppData {
  careers: Record<string, Career>;
  keepScreenAwake: boolean;
  hapticVibration: boolean;
  playSound: boolean;
  setKeepScreenAwake: (enabled: boolean) => void;
  setHapticVibration: (enabled: boolean) => void;
  setPlaySound: (enabled: boolean) => void;
  addTeam: (name: string, short: string, color: string, badge?: Team['badge']) => Team;
  updateTeam: (id: string, patch: Partial<Pick<Team, 'name' | 'short' | 'color' | 'badge'>>) => void;
  deleteTeam: (id: string) => void;
  addPlayer: (teamId: string, name: string, role: Role, photoUri?: string) => void;
  updatePlayer: (id: string, patch: Partial<Pick<Player, 'name' | 'role' | 'photoUri'>>) => void;
  deletePlayer: (id: string) => void;
  seedDemo: () => void;
  createMatch: (cfg: NewMatchConfig) => string;
  setCrease: (matchId: string, patch: { striker?: string | null; nonStriker?: string | null; bowler?: string | null }) => void;
  score: (matchId: string, input: BallInput) => void;
  undo: (matchId: string) => void;
  swapStrike: (matchId: string) => void;
  nextInnings: (matchId: string) => void;
  endInnings: (matchId: string) => void;
  setPlayerOfMatch: (matchId: string, playerId: string) => void;
  deleteMatch: (matchId: string) => void;
  replaceData: (data: AppData) => void;
  resetAll: () => void;
}

const Ctx = createContext<StoreApi | null>(null);
const empty: AppData = { teams: [], players: [], matches: [] };

export const makeShort = (name: string) => {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return '';
  if (words.length === 1) return words[0].slice(0, 3).toUpperCase();
  return words
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase();
};

const DEMO: { name: string; short: string; color: string; players: [string, Role][] }[] = [
  {
    name: 'Harbour Hawks',
    short: 'HAW',
    color: '#34C77B',
    players: [
      ['Arjun Rao', 'Batter'],
      ['Liam Fletcher', 'Batter'],
      ['Vikram Shah', 'Keeper'],
      ['Noah Bennett', 'All-rounder'],
      ['Dev Malhotra', 'All-rounder'],
      ['Sam Whitaker', 'Batter'],
      ['Imran Qureshi', 'Bowler'],
      ['Kabir Nair', 'Bowler'],
      ['Tom Hargreave', 'Bowler'],
      ['Rohan Iyer', 'Bowler'],
      ['Jack Mercer', 'Bowler'],
    ],
  },
  {
    name: 'Ridge Rangers',
    short: 'RGR',
    color: '#FF7A3D',
    players: [
      ['Aman Kapoor', 'Batter'],
      ['Ethan Cole', 'Batter'],
      ['Yash Verma', 'Keeper'],
      ['Oliver Grant', 'All-rounder'],
      ['Siddharth Menon', 'All-rounder'],
      ['Harry Doyle', 'Batter'],
      ['Faisal Ahmed', 'Bowler'],
      ['Nikhil Joshi', 'Bowler'],
      ['Charlie Ross', 'Bowler'],
      ['Tarun Bhatt', 'Bowler'],
      ['Max Holloway', 'Bowler'],
    ],
  },
];

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(empty);
  const [ready, setReady] = useState(false);
  const [preferences, setPreferences] = useState(defaultPreferences);
  const [preferencesReady, setPreferencesReady] = useState(false);
  const ref = useRef(data);
  ref.current = data;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const p = JSON.parse(raw);
          setData({ teams: p.teams ?? [], players: p.players ?? [], matches: p.matches ?? [] });
        } catch {}
      })
      .catch(() => {})
      .finally(() => setReady(true));
  }, []);

  useEffect(() => {
    AsyncStorage.getItem(PREFERENCES_KEY)
      .then((raw) => {
        if (!raw) return;
        try {
          const parsed: unknown = JSON.parse(raw);
          if (typeof parsed !== 'object' || parsed === null) return;
          const saved = parsed as Partial<AppPreferences>;
          setPreferences({
            keepScreenAwake: typeof saved.keepScreenAwake === 'boolean' ? saved.keepScreenAwake : defaultPreferences.keepScreenAwake,
            hapticVibration: typeof saved.hapticVibration === 'boolean' ? saved.hapticVibration : true,
            playSound: typeof saved.playSound === 'boolean' ? saved.playSound : defaultPreferences.playSound,
          });
        } catch {}
      })
      .catch(() => {})
      .finally(() => setPreferencesReady(true));
  }, []);

  useEffect(() => {
    if (!preferencesReady) return;
    AsyncStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences)).catch(() => {});
  }, [preferences, preferencesReady]);

  useEffect(() => {
    if (!ready) return;
    const t = setTimeout(() => {
      AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
    }, 250);
    return () => clearTimeout(t);
  }, [data, ready]);

  const careers = useMemo(() => careerStats(data.matches), [data.matches]);

  const api = useMemo<StoreApi>(() => {
    const mutate = (id: string, fn: (m: Match) => Match) =>
      setData((d) => ({ ...d, matches: d.matches.map((m) => (m.id === id ? fn(m) : m)) }));
    return {
      ...data,
      careers,
      ...preferences,
      setKeepScreenAwake: (enabled) => setPreferences((current) => ({ ...current, keepScreenAwake: enabled })),
      setHapticVibration: (enabled) => setPreferences((current) => ({ ...current, hapticVibration: enabled })),
      setPlaySound: (enabled) => setPreferences((current) => ({ ...current, playSound: enabled })),
      addTeam: (name, short, color, badge) => {
        const team: Team = { id: uid(), name: name.trim(), short: short.trim().toUpperCase() || makeShort(name), color, badge, createdAt: Date.now() };
        setData((d) => ({ ...d, teams: [...d.teams, team] }));
        return team;
      },
      updateTeam: (id, patch) => setData((d) => ({ ...d, teams: d.teams.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),
      deleteTeam: (id) =>
        setData((d) => ({ ...d, teams: d.teams.filter((t) => t.id !== id), players: d.players.filter((p) => p.teamId !== id) })),
      addPlayer: (teamId, name, role) =>
        setData((d) => ({ ...d, players: [...d.players, { id: uid(), teamId, name: name.trim(), role }] })),
      updatePlayer: (id, patch) => setData((d) => ({ ...d, players: d.players.map((p) => (p.id === id ? { ...p, ...patch } : p)) })),
      deletePlayer: (id) => setData((d) => ({ ...d, players: d.players.filter((p) => p.id !== id) })),
      seedDemo: () =>
        setData((d) => {
          const teams = [...d.teams];
          const players = [...d.players];
          DEMO.forEach((t) => {
            const id = uid();
            teams.push({ id, name: t.name, short: t.short, color: t.color, createdAt: Date.now() });
            t.players.forEach(([name, role]) => players.push({ id: uid(), teamId: id, name, role }));
          });
          return { ...d, teams, players };
        }),
      createMatch: (cfg) => {
        const m = buildMatch(cfg, ref.current.teams, ref.current.players);
        setData((d) => ({ ...d, matches: [m, ...d.matches] }));
        return m.id;
      },
      setCrease: (id, patch) => mutate(id, (m) => setCrease(m, patch)),
      score: (id, input) => mutate(id, (m) => applyBall(m, input)),
      undo: (id) => mutate(id, undoBall),
      swapStrike: (id) => mutate(id, swapStrike),
      nextInnings: (id) => mutate(id, startNextInnings),
      endInnings: (id) => mutate(id, endInnings),
      setPlayerOfMatch: (id, playerId) => mutate(id, (m) => choosePlayerOfMatch(m, playerId)),
      deleteMatch: (id) => setData((d) => ({ ...d, matches: d.matches.filter((m) => m.id !== id) })),
      replaceData: (replacement) => setData(replacement),
      resetAll: () => setData(empty),
    };
  }, [data, careers, preferences]);

  if (!ready || !preferencesReady) return <View style={{ flex: 1, backgroundColor: darkColors.bg }} />;
  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useStore() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useStore must be used inside StoreProvider');
  return v;
}
