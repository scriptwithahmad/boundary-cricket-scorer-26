import React from 'react';
import type { AppData, Match, Player, Team } from '@/src/types';

export type Backup = { version: 1; exportedAt: string; data: AppData };

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

export function isTeam(value: unknown): value is Team {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    typeof value.short === 'string' &&
    typeof value.color === 'string' &&
    typeof value.createdAt === 'number'
  );
}

export function isPlayer(value: unknown): value is Player {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.teamId === 'string' &&
    typeof value.name === 'string' &&
    ['Batter', 'Bowler', 'All-rounder', 'Keeper'].includes(String(value.role))
  );
}

export function isMatch(value: unknown): value is Match {
  return (
    isRecord(value) &&
    typeof value.id === 'string' &&
    typeof value.createdAt === 'number' &&
    ['T20', 'ODI', 'Custom'].includes(String(value.format)) &&
    typeof value.overs === 'number' &&
    typeof value.teamAId === 'string' &&
    typeof value.teamBId === 'string' &&
    isRecord(value.squads) &&
    isRecord(value.teams) &&
    isRecord(value.players) &&
    typeof value.tossWinnerId === 'string' &&
    (value.tossDecision === 'bat' || value.tossDecision === 'bowl') &&
    Array.isArray(value.innings) &&
    value.innings.every(
      (innings) =>
        isRecord(innings) &&
        typeof innings.battingTeamId === 'string' &&
        typeof innings.bowlingTeamId === 'string' &&
        Array.isArray(innings.balls) &&
        (innings.status === 'live' || innings.status === 'done'),
    ) &&
    (value.status === 'live' || value.status === 'completed')
  );
}

export function parseBackup(text: string): AppData {
  let backup: unknown;
  try {
    backup = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }

  if (
    !isRecord(backup) ||
    backup.version !== 1 ||
    !isRecord(backup.data) ||
    !Array.isArray(backup.data.teams) ||
    !Array.isArray(backup.data.players) ||
    !Array.isArray(backup.data.matches) ||
    !backup.data.teams.every(isTeam) ||
    !backup.data.players.every(isPlayer) ||
    !backup.data.matches.every(isMatch)
  ) {
    throw new Error('This file is not a valid Boundary game data backup.');
  }

  const teams = backup.data.teams;
  const players = backup.data.players;
  if (players.some((player) => !teams.some((team) => team.id === player.teamId))) {
    throw new Error('This backup contains players without a matching team.');
  }

  return {
    teams,
    players,
    matches: backup.data.matches,
  };
}

export function backupFilename() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  return `boundary-game-data-${timestamp}.json`;
}
