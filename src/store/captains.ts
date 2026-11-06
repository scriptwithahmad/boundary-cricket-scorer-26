import type { AppData } from '../types';

export function assignCaptains(data: AppData): AppData {
  return {
    ...data,
    teams: data.teams.map((team) => {
      const squad = data.players.filter((player) => player.teamId === team.id);
      const captainId = squad.some((player) => player.id === team.captainId)
        ? team.captainId : squad[0]?.id;
      return captainId === team.captainId ? team : { ...team, captainId };
    }),
  };
}
