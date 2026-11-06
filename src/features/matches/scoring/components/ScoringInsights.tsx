import React from 'react';
import { MatchInsightsSheet } from '@/src/features/matches/components/MatchInsightsSheet';
import type { useScoringController } from '../hooks/useScoringController';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'id' | 'router' | 'match' | 'insightsOpen' | 'setInsightsOpen' | 'm'>;

export function ScoringInsights({ controller }: { controller: Props }) {
  const { id, router, match, insightsOpen, setInsightsOpen, m } = controller;
  return (<MatchInsightsSheet
    match={m}
    visible={insightsOpen}
    onClose={() => setInsightsOpen(false)}
    onLeaveScoring={() => {
      setInsightsOpen(false);
      router.replace(`/match/${m.id}` as any);
    }}
  />);
}
