import React from 'react';
import { Swords } from 'lucide-react-native';
import { EmptyState, Screen, ScreenHeader } from '@/src/components/ui';
import { useScoringController } from './hooks/useScoringController';
import { KeepAwakeController } from './components/KeepAwakeController';
import { ScoringHeader } from './components/ScoringHeader';
import { Scoreboard } from './components/Scoreboard';
import { BoundaryCelebration } from './components/BoundaryCelebration';
import { CreaseTable } from './components/CreaseTable';
import { CurrentOver } from './components/CurrentOver';
import { ScoringControls } from './components/ScoringControls';
import { CompletedMatchAwards } from './components/CompletedMatchAwards';
import { ScoringInsights } from './components/ScoringInsights';
import { PlayerPickerSheet } from './components/PlayerPickerSheet';
import { RareDismissalSheet } from './components/RareDismissalSheet';
import { WicketSheet } from './components/WicketSheet';
import { ShotDirectionSheet } from './components/ShotDirectionSheet';
import { MilestoneSheet } from './components/MilestoneSheet';
import { WicketConfirmation } from './components/WicketConfirmation';
import { EndInningsConfirmation } from './components/EndInningsConfirmation';

export default function ScoreScreen() {
  const controller = useScoringController();
  if (!controller) return ((
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Match" back />
      <EmptyState icon={Swords} title="Match not found" text="This match may have been deleted." />
    </Screen>
  ));
  const { setAvailableHeight, compact } = controller;
  return (<Screen
    edges={['top', 'bottom']}
    fillContent
    onLayout={({ nativeEvent }) => setAvailableHeight(nativeEvent.layout.height)}
    contentStyle={{ paddingBottom: compact ? 10 : 24 }}
  >
    <KeepAwakeController controller={controller} />
    <ScoringHeader controller={controller} />

    {/* Scoreboard */}
    <Scoreboard controller={controller} />

    <BoundaryCelebration controller={controller} />

    {/* Crease */}
    <CreaseTable controller={controller} />

    {/* This over */}
    <CurrentOver controller={controller} />

    {/* Controls */}
    <ScoringControls controller={controller} />

    <CompletedMatchAwards controller={controller} />

    <ScoringInsights controller={controller} />

    {/* Picker sheet */}
    <PlayerPickerSheet controller={controller} />

    {/* Wicket sheet */}
    <RareDismissalSheet controller={controller} />
    <WicketSheet controller={controller} />

    <ShotDirectionSheet controller={controller} />

    <MilestoneSheet controller={controller} />

    <WicketConfirmation controller={controller} />

    <EndInningsConfirmation controller={controller} />
  </Screen>);
}
