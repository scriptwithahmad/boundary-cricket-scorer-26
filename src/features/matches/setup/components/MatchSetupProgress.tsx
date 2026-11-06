import React from 'react';
import { View } from 'react-native';
import { ProgressBar } from '@/src/components/ui';
import type { useNewMatchController } from '../hooks/useNewMatchController';
import { STEPS } from '../constants';

type Props = Pick<ReturnType<typeof useNewMatchController>, 'step'>;

export function MatchSetupProgress({ controller }: { controller: Props }) {
  const { step } = controller;
  return (<View style={{ marginBottom: 20 }}>
    <ProgressBar value={(step + 1) / STEPS.length} />
  </View>);
}
