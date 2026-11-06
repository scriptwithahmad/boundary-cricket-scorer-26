import React from 'react';
import { View } from 'react-native';

import { Swords, Users } from 'lucide-react-native';
import { AppText, Button, EmptyState } from '@/src/components/ui';

import type { useNewMatchController } from '../hooks/useNewMatchController';

type Props = Pick<ReturnType<typeof useNewMatchController>, 'router' | 'store' | 'step' | 'teamA' | 'teamB' | 'teamsReady' | 'teamPicker'>;

export function TeamsStep({ controller }: { controller: Props }) {
  const { router, store, step, teamA, teamB, teamsReady, teamPicker } = controller;
  return (step === 1 ? (
    store.teams.length < 2 ? (
      <EmptyState icon={Users} title="You need two teams" text="Create teams in the Teams tab, or load two ready-made demo teams to try things out.">
        <Button label="Load demo teams" icon={Swords} onPress={() => store.seedDemo()} />
        <Button
          label="Go to Teams"
          variant="secondary"
          onPress={() => {
            router.back();
            router.push('/teams' as any);
          }}
        />
      </EmptyState>
    ) : (
      <View>
        {teamPicker('A')}
        {teamPicker('B')}
        {teamA && teamB && !teamsReady ? (
          <AppText variant="caption" color="danger" style={{ marginTop: 12 }}>
            Each team needs at least 2 players. Add players from the Teams tab.
          </AppText>
        ) : null}
      </View>
    )
  ) : null);
}
