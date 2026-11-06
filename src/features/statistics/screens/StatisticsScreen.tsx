import React, { useMemo, useState } from 'react';
import { TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Check, Crown, Search, SlidersHorizontal, TrendingUp, Users, X } from 'lucide-react-native';
import { TeamBadgeIcon } from '@/src/components/cricket/TeamBadgeIcon';
import type { Team } from '@/src/types';
import { AppText, Button, Card, EmptyState, IconButton, Screen, ScreenHeader, Segmented, SectionHeader, Sheet, Tap } from '@/src/components/ui';
import { Avatar } from '@/src/components/cricket/Avatar';
import { useStore } from '@/src/store';
import { fonts, useTheme } from '@/src/theme';
import { battingAvg, economy, oversText, strikeRate, Career } from '@/src/engine/cricket';
import { LinearGradient } from 'expo-linear-gradient';

type Tab = 'batting' | 'bowling';

export default function Stats() {
  const router = useRouter();
  const { colors } = useTheme();
  const store = useStore();
  const [tab, setTab] = useState<Tab>('batting');
  const [query, setQuery] = useState('');
  const [teamIds, setTeamIds] = useState<string[]>([]);
  const [filterOpen, setFilterOpen] = useState(false);
  const selectedTeams = useMemo(() => store.teams.filter((team) => teamIds.includes(team.id)), [store.teams, teamIds]);
  const activeTeamIds = useMemo(() => selectedTeams.map((team) => team.id), [selectedTeams]);
  const filtered = Boolean(query.trim() || activeTeamIds.length);

  const all = useMemo(() => Object.values(store.careers).filter((c) => c.matches > 0), [store.careers]);
  const list = useMemo(() => {
    const candidates = all.filter((career) =>
      (!activeTeamIds.length || activeTeamIds.includes(career.teamId)) &&
      career.name.toLocaleLowerCase().includes(query.trim().toLocaleLowerCase()));
    const l =
      tab === 'batting'
        ? candidates.filter((c) => c.balls > 0).sort((a, b) => b.runs - a.runs || b.balls - a.balls)
        : candidates
          .filter((c) => c.bowlBalls > 0)
          .sort((a, b) => b.wickets - a.wickets || a.bowlRuns / a.bowlBalls - b.bowlRuns / b.bowlBalls);
    return l;
  }, [all, tab, activeTeamIds, query]);

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

      <View style={{ marginTop: 16, gap: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: colors.surfaceAlt, borderRadius: 14, paddingLeft: 13, paddingRight: 5, minHeight: 46 }}>
            <Search size={18} color={colors.textFaint} />
            <TextInput
              accessibilityLabel="Search players by name"
              placeholder="Search players"
              placeholderTextColor={colors.textFaint}
              value={query} onChangeText={setQuery}
              autoCorrect={false} autoCapitalize="none" returnKeyType="search"
              style={{ flex: 1, minWidth: 0, paddingVertical: 12, color: colors.text, fontFamily: fonts.regular, fontSize: 13 }}
            />
            {query ? <IconButton icon={X} label="Clear player search" size={34} onPress={() => setQuery('')} /> : null}
          </View>
          <IconButton icon={SlidersHorizontal} label="Filter players by team" tone={activeTeamIds.length ? 'primary' : 'plain'} size={46} onPress={() => setFilterOpen(true)} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {selectedTeams.map((selectedTeam) => (
            <Tap key={selectedTeam.id} onPress={() => setTeamIds((ids) => ids.filter((id) => id !== selectedTeam.id))} style={{ flexDirection: 'row', alignSelf: 'flex-start', alignItems: 'center', gap: 8, backgroundColor: colors.primarySoft, borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 }} accessibilityLabel={`Clear ${selectedTeam.name} team filter`}>
              <AppText variant="caption" color="primary">{selectedTeam.name}</AppText>
              <X size={13} color={colors.primary} />
            </Tap>
          ))}
          {filtered ? (
            <Tap onPress={() => { setTeamIds([]); setQuery(''); }} accessibilityLabel="Clear all statistics filters" style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 10, paddingVertical: 8, minHeight: 36 }}>
              <X size={14} color={colors.primary} />
              <AppText variant="caption" color="primary" style={{ fontFamily: fonts.semibold }}>Clear filters</AppText>
            </Tap>
          ) : null}
        </View>
      </View>

      {list.length === 0 ? (
        <EmptyState icon={filtered ? Search : TrendingUp} title={filtered ? 'No matching players' : 'No stats yet'} text={filtered ? `No ${tab} statistics match these filters. Try another name or team.` : 'Score a few balls and the leaderboards will build themselves.'}>
          {filtered ? <Button label="Clear filters" variant="soft" onPress={() => { setQuery(''); setTeamIds([]); }} /> : null}
        </EmptyState>
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
      <Sheet visible={filterOpen} onClose={() => setFilterOpen(false)} title="Filter by team" subtitle="Select one or more teams. Applies to batting and bowling." footer={<Button label="Done" onPress={() => setFilterOpen(false)} />}>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {([null, ...store.teams] as (Team | null)[]).map((team) => {
            const selected = team ? activeTeamIds.includes(team.id) : activeTeamIds.length === 0;
            const iconColor = selected ? colors.primary : team?.color ?? colors.textMuted;
            return (
              <Tap key={team?.id ?? 'all'} onPress={() => setTeamIds((ids) => team ? (ids.includes(team.id) ? ids.filter((id) => id !== team.id) : [...ids, team.id]) : [])} accessibilityLabel={`${team ? 'Toggle' : 'Show'} ${team?.name ?? 'All teams'}`} accessibilityState={{ selected }} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 11, minHeight: 44, maxWidth: '100%', borderRadius: 24, backgroundColor: selected ? colors.primarySoft : colors.surfaceAlt, borderWidth: 1, borderColor: selected ? `${colors.primary}70` : 'transparent' }}>
                {team ? (
                  team.badge && team.badge !== 'initials' ? <TeamBadgeIcon badge={team.badge} size={19} color={iconColor} /> : (
                    <View style={{ width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', backgroundColor: `${team.color}24` }}>
                      <AppText style={{ fontSize: 9, fontFamily: fonts.bold }} color={iconColor}>{team.short.slice(0, 3)}</AppText>
                    </View>
                  )
                ) : <Users size={18} color={iconColor} />}
                <AppText variant="caption" color={selected ? 'primary' : 'text'} style={{ fontFamily: fonts.semibold, flexShrink: 1 }}>{team?.name ?? 'All teams'}</AppText>
                {selected ? <Check size={15} color={colors.primary} /> : null}
              </Tap>
            );
          })}
        </View>
      </Sheet>
    </Screen>
  );
}
