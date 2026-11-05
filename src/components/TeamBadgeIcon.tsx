import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const TEAM_BADGES = ['initials', 'bat', 'ball', 'wickets', 'helmet', 'trophy'] as const;
export type TeamBadge = typeof TEAM_BADGES[number];

export function TeamBadgeIcon({ badge, size = 24, color = '#08130D' }: { badge: string; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {badge === 'bat' ? <><Path d="m20 4 3 3-7 8-3-3z" /><Path d="m13 12 4 4-9 12-5-5z" /><Path d="m6 21 5 5" /></> : null}
      {badge === 'ball' ? <><Circle cx={16} cy={16} r={12} /><Path d="M10 5c11 5 1 17 12 22M7 8c11 5 1 17 12 22" strokeDasharray="2 3" /></> : null}
      {badge === 'wickets' ? <><Path d="M9 10v17m7-17v17m7-17v17M7 6h8m2 0h8M6 28h20" /></> : null}
      {badge === 'helmet' ? <><Path d="M5 19v-4a11 11 0 0 1 22 0v4H5Zm0 0 3 7h12m7-7-4 9H13v-9m7 0v9m-7-5h12" /></> : null}
      {badge === 'trophy' ? <><Path d="M10 5h12v8a6 6 0 0 1-12 0V5Zm0 3H5v4a6 6 0 0 0 7 6m10-10h5v4a6 6 0 0 1-7 6m-4 1v7m-6 2h12" /><Rect x={11} y={26} width={10} height={2} rx={1} /></> : null}
    </Svg>
  );
}
