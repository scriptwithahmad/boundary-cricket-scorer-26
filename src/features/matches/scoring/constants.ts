import { StyleSheet } from 'react-native';
import type { WicketKind } from '@/src/types';

export const ALL_KINDS: WicketKind[] = ['bowled', 'caught', 'lbw', 'runout', 'stumped', 'hitwicket'];

export const RARE_KINDS = ['timedout', 'hittwice', 'retiredout', 'obstructing'] as const;

export type RareKind = typeof RARE_KINDS[number];

export const cols = StyleSheet.create({
  n: { width: 34, textAlign: 'right', fontVariant: ['tabular-nums'] },
  w: { width: 48, textAlign: 'right', fontVariant: ['tabular-nums'] },
});

export const styles = StyleSheet.create({
  board: { borderRadius: 28, padding: 22, gap: 8, overflow: 'hidden' },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 4 },
  divider: { height: 1, marginVertical: 8 },
  trophy: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});
