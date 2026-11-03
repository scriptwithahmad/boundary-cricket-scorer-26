import React, { useMemo, useState } from 'react';
import { View } from 'react-native';
import { useRouter } from 'expo-router';
import { Crown, TrendingUp } from 'lucide-react-native';
import { AppText, Avatar, Card, EmptyState, Screen, ScreenHeader, Segmented, SectionHeader, Tap } from '@/src/components/ui';
import { useStore } from '@/src/store';
import { useTheme } from '@/src/theme';
import { battingAvg, economy, oversText, strikeRate, Career } from '@/src/engine/cricket';
import { LinearGradient } from 'expo-linear-gradient';

type Tab = 'batting' | 'bowling';

export default function Stats() {
  const router = useRouter();
  const { colors } = useTheme();
  const store = useStore();
  const [tab, setTab] = useState<Tab>('batting');

  const all = useMemo(() => Object.values(store.careers).filter((c) => c.matches > 0), [store.careers]);
  const list = useMemo(() => {
    const l =
      tab === 'batting'
        ? all.filter((c) => c.balls > 0).sort((a, b) => b.runs - a.runs || b.balls - a.balls)
        : all
            .filter((c) => c.bowlBalls > 0)
            .sort((a, b) => b.wickets - a.wickets || a.bowlRuns / a.bowlBalls - b.bowlRuns / b.bowlBalls);
    return l;
  }, [all, tab]);

  const color = (c: Career) => store.teams.find((t) => t.id === c.teamId)?.color;
  const top = list[0];

  return (
    <Screen>
      <ScreenHeader title="Statistics" subtitle="Career numbers across every match" />
      <Segmented<Tab>
        value={tab}
        onChange={setTab}
        options={[
          { label: 'Batting', value: 'batting' },
          { label: 'Bowling', value: 'bowling' },
        ]}
      />

      {list.length === 0 ? (
        <EmptyState icon={TrendingUp} title="No stats yet" text="Score a few balls and the leaderboards will build themselves." />
      ) : (
        <>
          {top ? (
            <Tap onPress={() => router.push(`/player/${top.id}` as any)} style={{ marginTop: 20 }}>
              <LinearGradient colors={[colors.heroA, colors.heroB]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 20, gap: 16 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Crown size={16} color={colors.onHeroMuted} />
                  <AppText variant="label" color={colors.onHeroMuted}>
                    {tab === 'batting' ? 'Top run-scorer' : 'Top wicket-taker'}
                  </AppText>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                  <Avatar name={top.name} color={color(top)} size={56} />
                  <View style={{ flex: 1 }}>
                    <AppText variant="heading" color={colors.onHero} numberOfLines={1}>
                      {top.name}
                    </AppText>
                    <AppText variant="caption" color={colors.onHeroMuted}>
                      {tab === 'batting'
                        ? `HS ${top.highest}${top.highestNotOut ? '*' : ''} · SR ${strikeRate(top.runs, top.balls)}`
                        : `Econ ${economy(top.bowlRuns, top.bowlBalls)} · Best ${top.bestW}/${top.bestR}`}
                    </AppText>
                  </View>
                  <AppText variant="display" color={colors.onHero} style={{ fontVariant: ['tabular-nums'] }}>
                    {tab === 'batting' ? top.runs : top.wickets}
                  </AppText>
                </View>
              </LinearGradient>
            </Tap>
          ) : null}

          <SectionHeader title="Leaderboard" />
          <View style={{ gap: 8 }}>
            {list.map((c, i) => (
              <Card key={c.id} index={i} onPress={() => router.push(`/player/${c.id}` as any)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <AppText variant="bodyStrong" color={i < 3 ? 'primary' : 'textFaint'} style={{ width: 22, fontVariant: ['tabular-nums'] }}>
                  {i + 1}
                </AppText>
                <Avatar name={c.name} color={color(c)} size={40} />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyStrong" numberOfLines={1}>
                    {c.name}
                  </AppText>
                  <AppText variant="caption" color="textMuted" style={{ fontVariant: ['tabular-nums'] }}>
                    {tab === 'batting'
                      ? `${c.innings} inns · Avg ${battingAvg(c)} · SR ${strikeRate(c.runs, c.balls)}`
                      : `${oversText(c.bowlBalls)} ov · Econ ${economy(c.bowlRuns, c.bowlBalls)}`}
                  </AppText>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <AppText variant="title" style={{ fontVariant: ['tabular-nums'] }}>
                    {tab === 'batting' ? c.runs : c.wickets}
                  </AppText>
                  <AppText variant="label" color="textFaint">
                    {tab === 'batting' ? 'Runs' : 'Wkts'}
                  </AppText>
                </View>
              </Card>
            ))}
          </View>
        </>
      )}
    </Screen>
  );
}
