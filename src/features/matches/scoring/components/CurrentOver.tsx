import React from 'react';
import { View } from 'react-native';
import { AppText } from '@/src/components/ui';
import type { useScoringController } from '../hooks/useScoringController';

import { BallChip } from './BallChip';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'id' | 'compact' | 'over' | 'overRuns'>;

export function CurrentOver({ controller }: { controller: Props }) {
  const { id, compact, over, overRuns } = controller;
  return (<View style={{ marginTop: compact ? 10 : 16, gap: compact ? 6 : 10 }}>
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <AppText variant="label" color="textMuted">
        This over
      </AppText>
      {over.length ? (
        <AppText variant="caption" color="textMuted">
          {overRuns} run{overRuns === 1 ? '' : 's'}
        </AppText>
      ) : null}
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 40 }}>
      {over.length ? (
        over.map((b) => <BallChip key={b.id} b={b} />)
      ) : (
        <AppText variant="caption" color="textFaint" style={{ paddingTop: 10 }}>
          No deliveries yet
        </AppText>
      )}
    </View>
  </View>);
}
