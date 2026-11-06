import { useKeepAwake } from 'expo-keep-awake';

export function ScoringKeepAwake() {
  useKeepAwake('live-match-scoring', { suppressDeactivateWarnings: true });
  return null;
}
