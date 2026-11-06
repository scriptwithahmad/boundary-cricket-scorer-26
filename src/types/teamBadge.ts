export const TEAM_BADGES = ['initials', 'bat', 'ball', 'wickets', 'helmet', 'trophy', 'bails', 'lion', 'wolf'] as const;
export type TeamBadge = typeof TEAM_BADGES[number];
