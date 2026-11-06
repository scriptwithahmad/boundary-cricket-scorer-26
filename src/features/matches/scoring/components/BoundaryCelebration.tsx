import React from 'react';
import { View } from 'react-native';
import Animated, { FadeOut, ZoomIn } from 'react-native-reanimated';
import { Trophy } from 'lucide-react-native';
import { AppText } from '@/src/components/ui';
import type { useScoringController } from '../hooks/useScoringController';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'id' | 'colors' | 'celebration'>;

export function BoundaryCelebration({ controller }: { controller: Props }) {
  const { id, colors, celebration } = controller;
  return (<>{celebration ? (
    <Animated.View key={celebration.id} entering={ZoomIn.duration(220)} exiting={FadeOut.duration(180)} pointerEvents="none" style={{ marginTop: 10, padding: 12, borderRadius: 16, backgroundColor: celebration.runs === 4 ? colors.fourSoft : colors.sixSoft, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
      <Trophy size={23} color={celebration.runs === 4 ? colors.four : colors.six} />
      <AppText variant="heading" color={celebration.runs === 4 ? 'four' : 'six'}>{celebration.runs === 4 ? 'FOUR! To the boundary' : 'SIX! Over the ropes'}</AppText>
    </Animated.View>
  ) : null}</>);
}
