import React from 'react';
import { View } from 'react-native';
import { ClipboardList, MoreHorizontal } from 'lucide-react-native';
import { IconButton, ScreenHeader } from '@/src/components/ui';
import type { useScoringController } from '../hooks/useScoringController';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'id' | 'router' | 'setInsightsOpen' | 'm' | 'inningsNo'>;

export function ScoringHeader({ controller }: { controller: Props }) {
  const { id, router, setInsightsOpen, m, inningsNo } = controller;
  return (<ScreenHeader
    title={`${m.teams[m.teamAId].short} v ${m.teams[m.teamBId].short}`}
    subtitle={`${m.format === 'Custom' ? `${m.overs} overs` : m.format} · ${inningsNo === 1 ? '1st' : '2nd'} innings`}
    back
    right={
      <View style={{ flexDirection: 'row', gap: 8 }}>
        <IconButton icon={ClipboardList} label="Full scorecard" onPress={() => router.push(`/match/${m.id}` as any)} />
        <IconButton icon={MoreHorizontal} label="Match insights and options" onPress={() => setInsightsOpen(true)} />
      </View>
    }
  />);
}
