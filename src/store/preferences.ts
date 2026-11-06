export interface AppPreferences {
  keepScreenAwake: boolean;
  hapticVibration: boolean;
  playSound: boolean;
  recordShotDirections: boolean;
  confirmWickets: boolean;
  boundaryCelebrations: boolean;
  milestoneAlerts: boolean;
  showPlayerStatistics: boolean;
  soundVolume: number;
  scoringLayout: 'auto' | 'compact' | 'spacious';
}

export const defaultPreferences: AppPreferences = {
  keepScreenAwake: true, hapticVibration: true, playSound: false,
  recordShotDirections: true, confirmWickets: true, boundaryCelebrations: true,
  milestoneAlerts: true, showPlayerStatistics: true, soundVolume: 1, scoringLayout: 'auto',
};

export function normalizePreferences(value: unknown): AppPreferences {
  const result = { ...defaultPreferences };
  if (!value || typeof value !== 'object') return result;
  const saved = value as Record<string, unknown>;
  for (const key of Object.keys(defaultPreferences) as (keyof AppPreferences)[]) {
    if (key === 'soundVolume') {
      if (typeof saved[key] === 'number' && Number.isFinite(saved[key])) result[key] = Math.max(0, Math.min(1, saved[key]));
    } else if (key === 'scoringLayout') {
      if (saved[key] === 'auto' || saved[key] === 'compact' || saved[key] === 'spacious') result[key] = saved[key];
    } else if (typeof saved[key] === 'boolean') result[key] = saved[key];
  }
  return result;
}
