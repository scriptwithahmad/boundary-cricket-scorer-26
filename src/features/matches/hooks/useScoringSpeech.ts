import { useEffect, useRef } from 'react';
import * as Speech from 'expo-speech';
import { ballRuns, currentInnings, totals, WICKET_LABEL } from '@/src/engine/cricket';
import type { Match } from '@/src/types';

export function scoringAnnouncement(match: Match): string {
  const innings = currentInnings(match);
  const ball = innings.balls[innings.balls.length - 1];
  if (!ball) return '';
  const total = totals(innings);
  const parts: string[] = [];
  if (ball.wicket) {
    const player = match.players[ball.wicket.playerOutId]?.name;
    parts.push(`${player ?? 'Batter'} out. ${WICKET_LABEL[ball.wicket.kind]}.`);
  }
  if (ball.extra) {
    const labels = { wd: 'Wide', nb: 'No ball', b: 'Byes', lb: 'Leg byes' };
    const runs = ballRuns(ball);
    parts.push(`${labels[ball.extra]}. ${runs} run${runs === 1 ? '' : 's'}.`);
  } else if (!ball.noDelivery && !ball.wicket) {
    parts.push(ball.runs === 0 ? 'Dot ball.' : ball.runs === 4 ? 'Four!' : ball.runs === 6 ? 'Six!' : `${ball.runs} run${ball.runs === 1 ? '' : 's'}.`);
  } else if (ball.runs > 0) {
    parts.push(`${ball.runs} run${ball.runs === 1 ? '' : 's'}.`);
  }
  parts.push(`${total.runs} for ${total.wickets}.`);
  if (match.status === 'completed' && match.result) parts.push(match.result.text);
  else if (innings.status === 'done') parts.push('End of innings.');
  else if (ball.legal && total.legal % 6 === 0) parts.push('Over complete.');
  return parts.join(' ');
}

export function useScoringSpeech(match: Match | undefined, enabled: boolean, volume = 1) {
  const previous = useRef<{ matchId: string; innings: number; count: number; lastId?: string } | null>(null);
  useEffect(() => {
    const innings = match ? currentInnings(match) : undefined;
    const last = innings?.balls[innings.balls.length - 1];
    const before = previous.current;
    previous.current = match && innings ? {
      matchId: match.id, innings: match.innings.length, count: innings.balls.length, lastId: last?.id,
    } : null;
    // Only announce newly recorded events, never history on mount, undo, or enabling sound.
    const appended = match && innings && last && before && before.matchId === match.id &&
      before.innings === match.innings.length && innings.balls.length > before.count && last.id !== before.lastId;
    let cancelled = false;
    // Replace pending speech so quick scoring cannot leave a queue of stale updates.
    void Speech.stop().then(() => {
      if (!cancelled && enabled && volume > 0 && appended) {
        Speech.speak(scoringAnnouncement(match), { language: 'en', volume, onError: () => { } });
      }
    }).catch(() => { });
    return () => {
      cancelled = true;
      void Speech.stop().catch(() => { });
    };
  }, [match, enabled, volume]);
}
