import React from 'react';
import { View } from 'react-native';
import { X } from 'lucide-react-native';
import { AppText, IconButton } from '@/src/components/ui';
import type { useNewMatchController } from '../hooks/useNewMatchController';

type Props = Pick<ReturnType<typeof useNewMatchController>, 'router' | 'step'>;

export function NewMatchHeader({ controller }: { controller: Props }) {
  const { router, step } = controller;
  return (<View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 8 }}>
    <View style={{ flex: 1 }}>
      <AppText variant="label" color="primary">
        Step {step + 1} of 4
      </AppText>
      <AppText variant="title">{['Choose a format', 'Pick the sides', 'Select the XI', 'The toss'][step]}</AppText>
    </View>
    <IconButton icon={X} label="Close" onPress={() => router.back()} />
  </View>);
}
