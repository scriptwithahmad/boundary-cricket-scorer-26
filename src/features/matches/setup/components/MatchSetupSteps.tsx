import { FormatStep } from './FormatStep';
import { TeamsStep } from './TeamsStep';
import { SquadsStep } from './SquadsStep';
import { TossStep } from './TossStep';
import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import type { useNewMatchController } from '../hooks/useNewMatchController';

type Props = Pick<ReturnType<typeof useNewMatchController>, 'router' | 'colors' | 'store' | 'step' | 'format' | 'setFormat' | 'customOvers' | 'setCustomOvers' | 'customBowlerLimit' | 'setCustomBowlerLimit' | 'allowConsecutiveOvers' | 'setAllowConsecutiveOvers' | 'teamA' | 'teamB' | 'squadA' | 'squadB' | 'tossWinner' | 'setTossWinner' | 'decision' | 'setDecision' | 'openCoinSheet' | 'overs' | 'bowlerLimit' | 'teamName' | 'teamsReady' | 'formats' | 'squadSection' | 'teamPicker'>;

export function MatchSetupSteps({ controller }: { controller: Props }) {
  const { step } = controller;
  return (<Animated.View key={step} entering={FadeInDown.duration(300)}>
    <FormatStep controller={controller} />

    <TeamsStep controller={controller} />

    <SquadsStep controller={controller} />

    <TossStep controller={controller} />
  </Animated.View>);
}
