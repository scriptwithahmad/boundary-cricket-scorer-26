import React from 'react';
import { View } from 'react-native';
import { Trophy } from 'lucide-react-native';
import { AppText, Button, Sheet } from '@/src/components/ui';
import type { useScoringController } from '../hooks/useScoringController';
import { styles } from '../constants';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'colors' | 'store' | 'milestone' | 'setMilestone' | 'pendingShot'>;

export function MilestoneSheet({ controller }: { controller: Props }) {
  const { colors, store, milestone, setMilestone, pendingShot } = controller;
  return (<Sheet
    visible={store.milestoneAlerts && milestone !== null && pendingShot === null}
    onClose={() => setMilestone(null)}
    title={milestone?.title ?? ''}
    footer={<Button label="Continue scoring" onPress={() => setMilestone(null)} />}
  >
    <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      <View style={[styles.trophy, { backgroundColor: colors.sixSoft }]}>
        <Trophy size={28} color={colors.six} />
      </View>
      <AppText variant="bodyStrong" style={{ textAlign: 'center' }}>
        {milestone?.message}
      </AppText>
    </View>
  </Sheet>);
}
