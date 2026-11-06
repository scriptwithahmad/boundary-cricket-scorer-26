import React from 'react';
import { View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { Target } from 'lucide-react-native';
import { AppText, Badge, Card, EmptyState, Screen, ScreenHeader, SectionHeader } from '@/src/components/ui';
import { Avatar } from '@/src/components/cricket/Avatar';
import { useStore } from '@/src/store';
import { battingAvg, economy, oversText, strikeRate } from '@/src/engine/cricket';
import { WagonWheel } from '@/src/features/matches/components/WagonWheel';

function Stat({ label, value, hero }: { label: string; value: string | number; hero?: boolean }) {
  return (
    <View style={{ width: '33.33%', paddingVertical: 12, gap: 2 }}>
      <AppText variant={hero ? 'title' : 'heading'} style={{ fontVariant: ['tabular-nums'] }}>
        {value}
      </AppText>
      <AppText variant="caption" color="textMuted">
        {label}
      </AppText>
    </View>
  );
}

export default function PlayerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const store = useStore();
  const player = store.players.find((p) => p.id === id);
  const c = store.careers[id as string];
  const team = player ? store.teams.find((t) => t.id === player.teamId) : undefined;
  const shots = store.matches.flatMap((match) => match.innings.flatMap((innings) => innings.balls.filter((ball) => ball.batterId === id && ball.runs > 0 && Number.isFinite(ball.shotAngle))));

  if (!player && !c) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader title="Player" back />
        <EmptyState icon={Target} title="Player not found" text="This player may have been removed." />
      </Screen>
    );
  }
  const name = player?.name ?? c.name;
  const role = player?.role ?? c.role;

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title="Player profile" back />
      <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
        <Avatar name={name} color={team?.color} size={72} />
        <View style={{ flex: 1, gap: 6 }}>
          <AppText variant="title" numberOfLines={2}>
            {name}
          </AppText>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            <Badge label={role} tone="primary" />
            {team ? <Badge label={team.name} /> : null}
          </View>
        </View>
      </Card>

      <SectionHeader title="Wagon wheel" />
      <Card style={{ gap: 12 }}>
        <AppText variant="caption" color="textMuted">{shots.length ? `${shots.length} recorded shots · ${shots.reduce((sum, shot) => sum + shot.runs, 0)} runs · All matches` : 'No shot directions recorded yet. Add runs in a match and select the shot direction.'}</AppText>
        <WagonWheel shots={shots} />
        <AppText variant="caption" color="textFaint">Only deliveries with a recorded direction are shown. Straight down the ground is at the bottom.</AppText>
      </Card>

      {!c || c.matches === 0 ? (
        <EmptyState icon={Target} title="No stats yet" text="Play a match with this player and their batting, bowling and fielding numbers will appear here." />
      ) : (
        <>
          <SectionHeader title="Batting" />
          <Card style={{ flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8 }}>
            <Stat hero label="Runs" value={c.runs} />
            <Stat hero label="Average" value={battingAvg(c)} />
            <Stat hero label="Strike rate" value={strikeRate(c.runs, c.balls)} />
            <Stat label="Matches" value={c.matches} />
            <Stat label="Innings" value={c.innings} />
            <Stat label="Highest" value={`${c.highest}${c.highestNotOut ? '*' : ''}`} />
            <Stat label="Fours" value={c.fours} />
            <Stat label="Sixes" value={c.sixes} />
            <Stat label="50s / 100s" value={`${c.fifties} / ${c.hundreds}`} />
          </Card>

          <SectionHeader title="Bowling" />
          <Card style={{ flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8 }}>
            <Stat hero label="Wickets" value={c.wickets} />
            <Stat hero label="Economy" value={economy(c.bowlRuns, c.bowlBalls)} />
            <Stat hero label="Best" value={c.bestW > 0 ? `${c.bestW}/${c.bestR}` : '-'} />
            <Stat label="Overs" value={oversText(c.bowlBalls)} />
            <Stat label="Runs given" value={c.bowlRuns} />
            <Stat label="Maidens" value={c.maidens} />
          </Card>

          <SectionHeader title="Fielding" />
          <Card style={{ flexDirection: 'row', flexWrap: 'wrap', paddingVertical: 8 }}>
            <Stat label="Catches" value={c.catches} />
            <Stat label="Stumpings" value={c.stumpings} />
            <Stat label="Ducks" value={c.ducks} />
          </Card>
        </>
      )}
    </Screen>
  );
}
