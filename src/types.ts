export type Role = 'Batter' | 'Bowler' | 'All-rounder' | 'Keeper';
export const ROLES: Role[] = ['Batter', 'Bowler', 'All-rounder', 'Keeper'];

export interface Team {
  id: string;
  name: string;
  short: string;
  color: string;
  createdAt: number;
}

export interface Player {
  id: string;
  teamId: string;
  name: string;
  role: Role;
}

export type Format = 'T20' | 'ODI' | 'Custom';
export type ExtraType = 'wd' | 'nb' | 'b' | 'lb';
export type WicketKind = 'bowled' | 'caught' | 'lbw' | 'runout' | 'stumped' | 'hitwicket';

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
  id: string;
  over: number; // zero based over index
  batterId: string;
  nonStrikerId: string;
  bowlerId: string;
  runs: number; // runs off the bat
  extra?: ExtraType;
  extraRuns: number; // runs credited as extras on this delivery
  legal: boolean;
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
  name: string;
  short: string;
  color: string;
}

export interface PlayerSnap {
  name: string;
  teamId: string;
  role: Role;
}

export interface MatchResult {
  winnerId: string | null;
  text: string;
}

export interface Match {
  id: string;
  createdAt: number;
  format: Format;
  overs: number;
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
  teamAId: string;
  teamBId: string;
  squadA: string[];
  squadB: string[];
  tossWinnerId: string;
  decision: 'bat' | 'bowl';
}
