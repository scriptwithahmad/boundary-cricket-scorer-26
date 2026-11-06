export type Role = 'Batter' | 'Bowler' | 'All-rounder' | 'Keeper';
export const ROLES: Role[] = ['Batter', 'Bowler', 'All-rounder', 'Keeper'];

export interface Team {
  captainId?: string;
  badge?: import('./teamBadge').TeamBadge;
  id: string;
  name: string;
  short: string;
  color: string;
  createdAt: number;
}

export interface Player {
  photoUri?: string;
  id: string;
  teamId: string;
  name: string;
  role: Role;
}

export type Format = 'T20' | 'ODI' | 'Custom';
export type ExtraType = 'wd' | 'nb' | 'b' | 'lb';
export type WicketKind = 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket' | 'timedout' | 'hittwice' | 'retiredout' | 'obstructing';

export interface Wicket {
  kind: WicketKind;
  playerOutId: string;
  fielderId?: string;
}

export interface CreaseState {
  striker: string | null;
  nonStriker: string | null;
  bowler: string | null;
  lastOverBowler: string | null;
}

export interface Ball {
  shotAngle?: number; // Degrees clockwise from the top of the field.
  shotDistance?: number; // Fraction of the field radius, from 0 to 1.
  id: string;
  over: number; // zero based over index
  batterId: string;
  nonStrikerId: string;
  bowlerId: string;
  runs: number; // runs off the bat
  extra?: ExtraType;
  extraRuns: number; // runs credited as extras on this delivery
  legal: boolean;
  noDelivery?: boolean; // dismissal recorded between deliveries
  wicket?: Wicket;
  prev: CreaseState;
}

export interface Innings extends CreaseState {
  battingTeamId: string;
  bowlingTeamId: string;
  balls: Ball[];
  target?: number;
  status: 'live' | 'done';
  endReason?: string;
}

export interface TeamSnap {
  badge?: import('./teamBadge').TeamBadge;
  name: string;
  short: string;
  color: string;
}

export interface PlayerSnap {
  photoUri?: string;
  name: string;
  teamId: string;
  role: Role;
}

export interface MatchResult {
  winnerId: string | null;
  text: string;
  playerOfMatchId?: string;
}

export interface Match {
  id: string;
  createdAt: number;
  format: Format;
  overs: number;
  bowlerOversLimit?: number;
  allowConsecutiveOvers?: boolean;
  teamAId: string;
  teamBId: string;
  squads: Record<string, string[]>;
  teams: Record<string, TeamSnap>;
  players: Record<string, PlayerSnap>;
  tossWinnerId: string;
  tossDecision: 'bat' | 'bowl';
  innings: Innings[];
  status: 'live' | 'completed';
  result?: MatchResult;
}

export interface AppData {
  teams: Team[];
  players: Player[];
  matches: Match[];
}

export interface NewMatchConfig {
  format: Format;
  overs: number;
  bowlerOversLimit?: number;
  allowConsecutiveOvers?: boolean;
  teamAId: string;
  teamBId: string;
  squadA: string[];
  squadB: string[];
  tossWinnerId: string;
  decision: 'bat' | 'bowl';
}
