import React from 'react';
import { MatchAwards } from '@/src/features/matches/components/MatchAwards';
import type { useScoringController } from '../hooks/useScoringController';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'match' | 'm' | 'live'>;

export function CompletedMatchAwards({ controller }: { controller: Props }) {
  const { match, m, live } = controller;
  return (<>{!live ? <MatchAwards match={m} /> : null}</>);
}
