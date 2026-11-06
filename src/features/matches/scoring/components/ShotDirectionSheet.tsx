import React from 'react';
import { AppText, Button, Sheet } from '@/src/components/ui';
import { WagonWheel } from '@/src/features/matches/components/WagonWheel';
import type { useScoringController } from '../hooks/useScoringController';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'pendingShot' | 'shotAngle' | 'setShotAngle' | 'shotDistance' | 'setShotDistance' | 'name' | 'saveShot'>;

export function ShotDirectionSheet({ controller }: { controller: Props }) {
  const { pendingShot, shotAngle, setShotAngle, shotDistance, setShotDistance, name, saveShot } = controller;
  return (<Sheet visible={pendingShot !== null} onClose={() => saveShot(true)} title="Shot direction"
    subtitle={pendingShot ? `${name(pendingShot.batterId)} · ${pendingShot.input.runs} run${pendingShot.input.runs === 1 ? '' : 's'} off the bat` : undefined}
    footer={<><Button label="Save shot & continue" disabled={shotAngle === undefined} onPress={() => saveShot()} /><Button label="Skip direction" variant="ghost" onPress={() => saveShot(true)} /></>}>
    <AppText variant="caption" color="textMuted">Tap where the ball was played. Straight down the ground is at the bottom.</AppText>
    <WagonWheel shots={[]} angle={shotAngle} distance={shotDistance} onSelect={(angle, distance) => { setShotAngle(angle); setShotDistance(distance); }} />
  </Sheet>);
}
