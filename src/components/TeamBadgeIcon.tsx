import React from 'react';
import Svg, { Circle, Path, Rect } from 'react-native-svg';

export const TEAM_BADGES = ['initials', 'bat', 'ball', 'wickets', 'helmet', 'trophy', 'bails', 'lion', 'wolf'] as const;
export type TeamBadge = typeof TEAM_BADGES[number];

export function TeamBadgeIcon({ badge, size = 24, color = '#08130D' }: { badge: string; size?: number; color?: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 32 32" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      {badge === 'bat' ? <><Path d="m20 4 3 3-7 8-3-3z" /><Path d="m13 12 4 4-9 12-5-5z" /><Path d="m6 21 5 5" /></> : null}
      {badge === 'ball' ? <><Circle cx={16} cy={16} r={12} /><Path d="M10 5c11 5 1 17 12 22M7 8c11 5 1 17 12 22" strokeDasharray="2 3" /></> : null}
      {badge === 'wickets' ? <><Path d="M9 10v17m7-17v17m7-17v17M7 6h8m2 0h8M6 28h20" /></> : null}
      {badge === 'helmet' ? <><Path d="M5 19v-4a11 11 0 0 1 22 0v4H5Zm0 0 3 7h12m7-7-4 9H13v-9m7 0v9m-7-5h12" /></> : null}
      {badge === 'trophy' ? <><Path d="M10 5h12v8a6 6 0 0 1-12 0V5Zm0 3H5v4a6 6 0 0 0 7 6m10-10h5v4a6 6 0 0 1-7 6m-4 1v7m-6 2h12" /><Rect x={11} y={26} width={10} height={2} rx={1} /></> : null}
      {badge === 'bails' ? <>
        <Path d="M3 12h3m8 0h3M15 20h3m8 0h3" />
        <Rect x={6} y={9} width={8} height={6} rx={1.5} />
        <Rect x={18} y={17} width={8} height={6} rx={1.5} />
      </> : null}
      {badge === 'lion' ? <>
        <Path d="m16 3 4 2 5 1 1 5 3 5-3 5-1 5-5 1-4 2-4-2-5-1-1-5-3-5 3-5 1-5 5-1Z" />
        <Path d="M11 10 9 9v5m12-4 2-1v5M10 13c0-4 12-4 12 0v6c0 4-4 6-6 6s-6-2-6-6Z" />
        <Path d="M12 15h1m6 0h1m-6 4h4l-2 2Zm2 2v2m-3 0 3 1 3-1" />
      </> : null}
      {badge === 'wolf' ? <>
        <Path d="m6 4 8 6h4l8-6-1 11 3 5-6 3-6 6-6-6-6-3 3-5Z" />
        <Path d="m9 10 3 3m11-3-3 3M10 17l3 1m9-1-3 1m-7 5 2-3h4l2 3m-6-1h4l-2 3Z" />
      </> : null}
    </Svg>
  );
}
