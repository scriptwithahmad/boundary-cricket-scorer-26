import React from 'react';
import { View } from 'react-native';

import type { useNewMatchController } from '../hooks/useNewMatchController';

type Props = Pick<ReturnType<typeof useNewMatchController>, 'step' | 'teamA' | 'teamB' | 'squadA' | 'squadB' | 'squadSection'>;

export function SquadsStep({ controller }: { controller: Props }) {
  const { step, teamA, teamB, squadA, squadB, squadSection } = controller;
  return (step === 2 ? (
    <View>
      {squadSection('A', teamA, squadA)}
      {squadSection('B', teamB, squadB)}
    </View>
  ) : null);
}
