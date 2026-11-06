import React from 'react';
import { View } from 'react-native';
import { Button, Screen } from '@/src/components/ui';
import { useNewMatchController } from '../hooks/useNewMatchController';
import { NewMatchHeader } from '../components/NewMatchHeader';
import { MatchSetupProgress } from '../components/MatchSetupProgress';
import { MatchSetupSteps } from '../components/MatchSetupSteps';
import { CoinTossSheet } from '../components/CoinTossSheet';

export default function NewMatch() {
  const controller = useNewMatchController();
  const { step, setStep, canNext, start } = controller;
  return (<Screen
    edges={['top', 'bottom']}
    footer={
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {step > 0 ? <Button label="Back" variant="secondary" full={false} style={{ flex: 1 }} onPress={() => setStep(step - 1)} /> : null}
        {step < 3 ? (
          <Button label="Continue" disabled={!canNext} style={{ flex: 2 }} full={false} onPress={() => setStep(step + 1)} />
        ) : (
          <Button label="Start match" variant="primary" style={{ flex: 2 }} full={false} onPress={start} />
        )}
      </View>
    }
  >
    <NewMatchHeader controller={controller} />
    <MatchSetupProgress controller={controller} />

    <MatchSetupSteps controller={controller} />

    <CoinTossSheet controller={controller} />
  </Screen>);
}
