import React, { useCallback, useEffect, useState } from 'react';
import { AppState, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useKeepAwake } from 'expo-keep-awake';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { ArrowLeftRight, ClipboardList, Flag, MoreHorizontal, MoreVertical, Swords, Trophy, Undo2, UserPlus } from 'lucide-react-native';
import {
  AppText,
  Button,
  Card,
  Chip,
  ConfirmSheet,
  EmptyState,
  IconButton,
  PlayerRow,
  Screen,
  ScreenHeader,
  Sheet,
  Tap,
  useScorePop,
} from '@/src/components/ui';
import { useStore } from '@/src/store';
import { fonts, useTheme } from '@/src/theme';
import {
  battingCard,
  bowlerOverLimit,
  bowlingCard,
  bowlerCreditedWicket,
  currentInnings,
  economy,
  lastOverBalls,
  needOf,
  oversText,
  strikeRate,
  totals,
  ballRuns,
  WICKET_LABEL,
  battingOrder,
} from '@/src/engine/cricket';
import type { Ball, ExtraType, WicketKind } from '@/src/types';
import { haptic } from '@/src/lib/haptics';
import { useScoringSpeech } from '@/src/lib/useScoringSpeech';
import { MatchAwards } from '@/src/components/MatchAwards';
import { MatchInsightsSheet } from '@/src/components/MatchInsightsSheet';

const ALL_KINDS: WicketKind[] = ['bowled', 'caught', 'lbw', 'runout', 'stumped', 'hitwicket'];
const RARE_KINDS = ['timedout', 'hittwice', 'retiredout', 'obstructing'] as const;
type RareKind = typeof RARE_KINDS[number];

function ScoringKeepAwake() {
  useKeepAwake('live-match-scoring', { suppressDeactivateWarnings: true });
  return null;
}

function BallChip({ b }: { b: Ball }) {
  const { colors } = useTheme();
  let label = String(b.runs);
  let bg = colors.surfaceAlt;
  let fg = colors.text;
  if (b.wicket) {
    label = 'W';
    bg = colors.danger;
    fg = colors.onDanger;
  } else if (b.extra === 'wd') {
    label = b.extraRuns > 1 ? `${b.extraRuns - 1}WD` : 'WD';
    bg = colors.accentSoft;
    fg = colors.accent;
  } else if (b.extra === 'nb') {
    label = b.runs > 0 ? `Nb${b.runs}` : 'Nb';
    bg = colors.accentSoft;
    fg = colors.accent;
  } else if (b.extra) {
    label = `${b.extra === 'b' ? 'B' : 'Lb'}${b.extraRuns}`;
    bg = colors.accentSoft;
    fg = colors.accent;
  } else if (b.runs === 0) {
    label = '•';
    fg = colors.textFaint;
  } else if (b.runs === 4) {
    bg = colors.fourSoft;
    fg = colors.four;
  } else if (b.runs === 6) {
    bg = colors.sixSoft;
    fg = colors.six;
  }
  return (
    <Animated.View
      entering={ZoomIn.duration(220)}
      style={{ minWidth: 40, height: 40, borderRadius: 20, paddingHorizontal: 8, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <AppText variant="bodyStrong" color={fg} style={{ fontFamily: fonts.bold }}>
        {label}
      </AppText>
    </Animated.View>
  );
}

function RunButton({
  value,
  onPress,
  hapticEnabled,
  compact = false,
}: {
  value: number;
  onPress: () => void;
  hapticEnabled: boolean;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const bg = value === 4 ? colors.fourSoft : value === 6 ? colors.sixSoft : colors.surfaceAlt;
  const fg = value === 4 ? colors.four : value === 6 ? colors.six : colors.text;
  return (
    <Tap
      onPress={onPress}
      hapticEnabled={hapticEnabled}
      accessibilityLabel={`${value} run${value === 1 ? '' : 's'}`}
      scaleTo={0.92}
      style={{ flex: 1, height: compact ? 52 : 68, borderRadius: compact ? 18 : 22, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}
    >
      <AppText variant="title" color={fg} style={{ fontSize: 28, fontFamily: fonts.extrabold }}>
        {value}
      </AppText>
    </Tap>
  );
}

const cols = StyleSheet.create({
  n: { width: 34, textAlign: 'right', fontVariant: ['tabular-nums'] },
  w: { width: 48, textAlign: 'right', fontVariant: ['tabular-nums'] },
});

export default function ScoreScreen() {
  const { height: viewportHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  // Window dimensions can include system bars in standalone edge-to-edge builds.
  // Measure the actual safe-area viewport so Expo Go and release use the same budget.
  // The spacious cards and keypad together need about 850dp, plus chase/hint text.
  const compact = (availableHeight ?? viewportHeight - insets.top - insets.bottom) < 900;
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const store = useStore();
  const [isFocused, setIsFocused] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const match = store.matches.find((m) => m.id === id);
  useScoringSpeech(match, store.playSound && isFocused && appActive);
  const inn = match ? currentInnings(match) : undefined;
  const t = inn ? totals(inn) : undefined;
  const need = match ? needOf(match) : null;

  const [extra, setExtra] = useState<ExtraType | null>(null);
  const [wicketOpen, setWicketOpen] = useState(false);
  const [rareOpen, setRareOpen] = useState(false);
  const [rareKind, setRareKind] = useState<RareKind | null>(null);
  const [rareOut, setRareOut] = useState<string | null>(null);
  const [rareRuns, setRareRuns] = useState(0);
  const [rareExtra, setRareExtra] = useState<ExtraType | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<'striker' | 'nonStriker' | 'bowler' | null>(null);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [wKind, setWKind] = useState<WicketKind | null>(null);
  const [wOut, setWOut] = useState<'striker' | 'nonStriker'>('striker');
  const [wFielder, setWFielder] = useState<string | null>(null);
  const [wRuns, setWRuns] = useState(0);
  const [milestone, setMilestone] = useState<{ title: string; message: string } | null>(null);
  const [insightsOpen, setInsightsOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      setIsFocused(true);
      return () => setIsFocused(false);
    }, []),
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => setAppActive(state === 'active'));
    return () => subscription.remove();
  }, []);

  const pop = useScorePop(t?.runs ?? 0);

  useEffect(() => {
    if (!need) return;
    setPickerTarget(need);
    setPickerOpen(true);
  }, [need, inn?.balls.length, match?.innings.length]);

  if (!match || !inn || !t) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader title="Match" back />
        <EmptyState icon={Swords} title="Match not found" text="This match may have been deleted." />
      </Screen>
    );
  }

  const m = match;
  const batTeam = m.teams[inn.battingTeamId];
  const bowlTeam = m.teams[inn.bowlingTeamId];
  const bat = battingCard(inn);
  const bowl = bowlingCard(inn);
  const striker = bat.find((b) => b.id === inn.striker);
  const nonStriker = bat.find((b) => b.id === inn.nonStriker);
  const bowlerStat = bowl.find((b) => b.id === inn.bowler);
  const name = (pid: string | null) => (pid ? m.players[pid]?.name ?? 'Player' : '—');
  const hasPlayedBall = (playerId: string) =>
    inn.balls.some((ball) => ball.batterId === playerId || ball.nonStrikerId === playerId);
  const currentOverStarted = inn.balls.some((ball) => !ball.noDelivery && ball.over === Math.floor(t.legal / 6));
  const canChangeBowler = m.status === 'live' && inn.status === 'live' && !!inn.bowler && !currentOverStarted;
  const openPlayerPicker = (target: 'striker' | 'nonStriker' | 'bowler') => {
    setPickerTarget(target);
    setPickerOpen(true);
  };
  const over = lastOverBalls(inn);
  const overRuns = over.reduce((s, b) => s + ballRuns(b), 0);
  const crr = t.legal ? ((t.runs / t.legal) * 6).toFixed(2) : '0.00';
  const ballsLeft = m.overs * 6 - t.legal;
  const need2 = inn.target !== undefined ? inn.target - t.runs : 0;
  const rrr = inn.target !== undefined && ballsLeft > 0 ? ((need2 / ballsLeft) * 6).toFixed(2) : '-';
  const inningsNo = m.innings.length;
  const live = m.status === 'live';
  const live1Done = live && inn.status === 'done';
  const limit = bowlerOverLimit(m);

  const onRun = (r: number) => {
    const batterRuns = bat.find((stat) => stat.id === inn.striker)?.runs ?? 0;
    const reached = [50, 100, 150, 200].find((score) => batterRuns < score && batterRuns + r >= score);
    store.score(m.id, { runs: r, extra: extra ?? undefined });
    if (store.hapticVibration && (r === 4 || r === 6)) haptic.impact();
    if (reached !== undefined) {
      setMilestone({
        title: reached === 50 ? 'Half-century!' : reached === 100 ? 'Century!' : `${reached} runs!`,
        message: `Congratulations to ${name(inn.striker)} on reaching ${reached} runs!`,
      });
    }
    setExtra(null);
  };

  const kinds: WicketKind[] = extra === 'wd' ? ['stumped', 'runout', 'hitwicket'] : extra ? ['runout'] : ALL_KINDS;
  const openWicket = () => {
    setWKind(extra ? kinds[0] === 'runout' ? 'runout' : null : null);
    setWOut('striker');
    setWFielder(null);
    setWRuns(0);
    setWicketOpen(true);
  };
  const confirmWicket = () => {
    if (!wKind) return;
    const creditedWicket = bowlerCreditedWicket(wKind);
    let previousWickets = 0;
    for (const ball of inn.balls.slice().reverse()) {
      if (ball.noDelivery) continue;
      if (ball.bowlerId !== inn.bowler || !ball.wicket || !bowlerCreditedWicket(ball.wicket.kind)) break;
      previousWickets++;
      if (previousWickets === 2) break;
    }
    store.score(m.id, {
      runs: wKind === 'runout' ? wRuns : 0,
      extra: extra ?? undefined,
      wicket: {
        kind: wKind,
        playerOutId: wKind === 'runout' && wOut === 'nonStriker' ? inn.nonStriker! : inn.striker!,
        fielderId: wFielder ?? undefined,
      },
    });
    if (store.hapticVibration) haptic.warning();
    if (creditedWicket && previousWickets >= 2) {
      setMilestone({
        title: 'Hat-trick!',
        message: `Incredible! ${name(inn.bowler)} has taken three wickets in three consecutive balls.`,
      });
    } else if (creditedWicket && previousWickets === 1) {
      setMilestone({
        title: 'On a hat-trick ball!',
        message: `${name(inn.bowler)} has taken wickets on two consecutive balls. The next delivery is the hat-trick ball!`,
      });
    }
    setExtra(null);
    setWicketOpen(false);
  };

  const batted = battingOrder(inn);
  const eligibleBatters = (m.squads[inn.battingTeamId] ?? []).filter((pid) => !batted.includes(pid));
  const bowlerOvers = (pid: string) => bowl.find((b) => b.id === pid);
  const bowlers = m.squads[inn.bowlingTeamId] ?? [];
  const pickerBatters = eligibleBatters.filter((pid) => pid !== inn.striker && pid !== inn.nonStriker);
  const pickerBowlers = bowlers.filter((pid) => pid !== inn.bowler);
  const openRare = () => {
    setRareKind(null);
    setRareOut(null);
    setRareRuns(0);
    setRareExtra(extra);
    setPickerOpen(false);
    setRareOpen(true);
  };
  const rareCandidates = rareKind === 'timedout' ? pickerBatters :
    rareKind === 'hittwice' ? [inn.striker].filter((pid): pid is string => !!pid) :
    [inn.striker, inn.nonStriker].filter((pid): pid is string => !!pid);
  const betweenDeliveries = rareKind === 'timedout' || rareKind === 'retiredout';
  const confirmRare = () => {
    if (!rareKind || !rareOut || !rareCandidates.includes(rareOut)) return;
    store.score(m.id, {
      runs: rareKind === 'obstructing' ? rareRuns : 0,
      extra: betweenDeliveries ? undefined : rareExtra ?? undefined,
      wicket: { kind: rareKind, playerOutId: rareOut },
    });
    if (store.hapticVibration) haptic.warning();
    setExtra(null);
    setRareOpen(false);
  };
  const closePlayerPicker = () => {
    setPickerOpen(false);
    setPickerTarget(null);
  };
  const selectPlayer = (playerId: string) => {
    if (pickerTarget === 'bowler') {
      store.setCrease(m.id, { bowler: playerId });
    } else if (pickerTarget === 'striker') {
      store.setCrease(m.id, { striker: playerId });
    } else if (pickerTarget === 'nonStriker') {
      store.setCrease(m.id, { nonStriker: playerId });
    }
    closePlayerPicker();
  };

  const extrasOptions: { k: ExtraType; label: string }[] = [
    { k: 'wd', label: 'Wide' },
    { k: 'nb', label: 'No ball' },
    { k: 'b', label: 'Bye' },
    { k: 'lb', label: 'Leg bye' },
  ];
  const hint: Record<ExtraType, string> = {
    wd: 'Wide — tap the extra runs run (0 for a plain wide)',
    nb: 'No ball — tap the runs hit off the bat',
    b: 'Byes — tap the runs run',
    lb: 'Leg byes — tap the runs run',
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      fillContent
      onLayout={({ nativeEvent }) => setAvailableHeight(nativeEvent.layout.height)}
      contentStyle={{ paddingBottom: compact ? 10 : 24 }}
    >
      {store.keepScreenAwake && live && isFocused && appActive ? <ScoringKeepAwake /> : null}
      <ScreenHeader
        title={`${m.teams[m.teamAId].short} v ${m.teams[m.teamBId].short}`}
        subtitle={`${m.format === 'Custom' ? `${m.overs} overs` : m.format} · ${inningsNo === 1 ? '1st' : '2nd'} innings`}
        back
        right={
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <IconButton icon={ClipboardList} label="Full scorecard" onPress={() => router.push(`/match/${m.id}` as any)} />
            <IconButton icon={MoreHorizontal} label="Match insights and options" onPress={() => setInsightsOpen(true)} />
          </View>
        }
      />

      {/* Scoreboard */}
      <LinearGradient colors={[colors.heroA, colors.heroB]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.board, compact && { padding: 14, gap: 4, borderRadius: 22 }]}>
        <View style={[styles.ring, { width: 220, height: 220, right: -80, top: -90 }]} />
        <View style={[styles.ring, { width: 120, height: 120, right: -20, top: -30 }]} />
        <AppText variant="label" color={colors.onHeroMuted}>
          {batTeam.name} batting
        </AppText>
        <Animated.View style={[{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }, pop]}>
          <AppText variant="score" color={colors.onHero} style={compact ? { fontSize: 44, lineHeight: 48 } : undefined}>
            {t.runs}/{t.wickets}
          </AppText>
          <AppText variant="heading" color={colors.onHeroMuted} style={{ paddingBottom: 8, fontVariant: ['tabular-nums'] }}>
            {oversText(t.legal)} / {m.overs}
          </AppText>
        </Animated.View>
        <View style={{ flexDirection: 'row', gap: 20, flexWrap: 'wrap' }}>
          <View>
            <AppText variant="label" color={colors.onHeroMuted}>
              CRR
            </AppText>
            <AppText variant="bodyStrong" color={colors.onHero}>
              {crr}
            </AppText>
          </View>
          {inn.target !== undefined ? (
            <>
              <View>
                <AppText variant="label" color={colors.onHeroMuted}>
                  Target
                </AppText>
                <AppText variant="bodyStrong" color={colors.onHero}>
                  {inn.target}
                </AppText>
              </View>
              <View>
                <AppText variant="label" color={colors.onHeroMuted}>
                  RRR
                </AppText>
                <AppText variant="bodyStrong" color={colors.onHero}>
                  {rrr}
                </AppText>
              </View>
            </>
          ) : null}
        </View>
        {inn.target !== undefined && inn.status === 'live' ? (
          <AppText variant="bodyStrong" color={colors.onHero}>
            Need {Math.max(0, need2)} from {ballsLeft} ball{ballsLeft === 1 ? '' : 's'}
          </AppText>
        ) : null}
      </LinearGradient>

      {/* Crease */}
      <Card style={{ marginTop: compact ? 10 : 16, gap: compact ? 2 : 4, padding: compact ? 12 : 16 }}>
        <View style={[styles.tableRow, compact && { paddingVertical: 3 }]}>
          <AppText variant="label" color="textFaint" style={{ flex: 1 }}>
            Batter
          </AppText>
          {['R', 'B', '4s', '6s'].map((h) => (
            <AppText key={h} variant="label" color="textFaint" style={cols.n}>
              {h}
            </AppText>
          ))}
          <AppText variant="label" color="textFaint" style={cols.w}>
            SR
          </AppText>
        </View>
        {[
          { s: striker, strike: true },
          { s: nonStriker, strike: false },
        ].map(({ s, strike }, i) => (
          <View key={i} style={styles.tableRow}>
            <View style={{ flex: 1 }}>
              {s && live && inn.status === 'live' && !hasPlayedBall(s.id) ? (
                <Tap
                  onPress={() => openPlayerPicker(strike ? 'striker' : 'nonStriker')}
                  accessibilityLabel={`Change ${strike ? 'striker' : 'non-striker'} ${name(s.id)}`}
                  accessibilityHint="Opens the player picker"
                >
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                    {strike ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary }} /> : null}
                    <AppText variant="bodyStrong" numberOfLines={1} color={strike ? 'primary' : 'text'}>
                      {name(s.id)}
                    </AppText>
                  </View>
                </Tap>
              ) : (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                  {s && strike ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary }} /> : null}
                  <AppText variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1} color={!s ? 'textFaint' : strike ? 'primary' : 'text'}>
                    {s ? name(s.id) : 'Waiting…'}
                  </AppText>
                </View>
              )}
            </View>
            <AppText variant="bodyStrong" style={cols.n}>
              {s?.runs ?? '-'}
            </AppText>
            <AppText variant="caption" color="textMuted" style={cols.n}>
              {s?.balls ?? '-'}
            </AppText>
            <AppText variant="caption" color="four" style={cols.n}>
              {s?.fours ?? '-'}
            </AppText>
            <AppText variant="caption" color="six" style={cols.n}>
              {s?.sixes ?? '-'}
            </AppText>
            <AppText variant="caption" color="textMuted" style={cols.w}>
              {s ? strikeRate(s.runs, s.balls) : '-'}
            </AppText>
          </View>
        ))}
        <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: compact ? 4 : 8 }]} />
        <View style={styles.tableRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="label" color="textFaint">
              Bowler · {bowlTeam.short}
            </AppText>
            {inn.bowler && canChangeBowler ? (
              <Tap
                onPress={() => openPlayerPicker('bowler')}
                accessibilityLabel={`Change bowler ${name(inn.bowler)}`}
                accessibilityHint="Opens the bowler picker"
              >
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {name(inn.bowler)}
                </AppText>
              </Tap>
            ) : (
              <AppText variant="bodyStrong" numberOfLines={1} color={inn.bowler ? 'text' : 'textFaint'}>
                {inn.bowler ? name(inn.bowler) : 'Waiting…'}
              </AppText>
            )}
          </View>
          <View style={{ alignItems: 'flex-end', marginLeft: 12 }} accessibilityLabel={`${bowlerStat?.runs ?? 0} runs conceded, ${bowlerStat?.wickets ?? 0} wickets, ${oversText(bowlerStat?.balls ?? 0)} overs`}>
            <AppText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>
              {bowlerStat?.runs ?? 0}/{bowlerStat?.wickets ?? 0}{' '}
              <AppText variant="caption" color="textMuted">({oversText(bowlerStat?.balls ?? 0)})</AppText>
            </AppText>
            <AppText variant="caption" color="textMuted" style={{ fontVariant: ['tabular-nums'] }}>
              Econ {economy(bowlerStat?.runs ?? 0, bowlerStat?.balls ?? 0)}
            </AppText>
          </View>
        </View>
      </Card>

      {/* This over */}
      <View style={{ marginTop: compact ? 10 : 16, gap: compact ? 6 : 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <AppText variant="label" color="textMuted">
            This over
          </AppText>
          {over.length ? (
            <AppText variant="caption" color="textMuted">
              {overRuns} run{overRuns === 1 ? '' : 's'}
            </AppText>
          ) : null}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, minHeight: 40 }}>
          {over.length ? (
            over.map((b) => <BallChip key={b.id} b={b} />)
          ) : (
            <AppText variant="caption" color="textFaint" style={{ paddingTop: 10 }}>
              No deliveries yet
            </AppText>
          )}
        </View>
      </View>

      {/* Controls */}
      <View style={{ marginTop: live && inn.status === 'live' ? 'auto' : 0 }}>
      <Animated.View entering={FadeInDown.duration(300)} style={{ marginTop: compact ? 12 : 24, gap: compact ? 8 : 12 }}>
        {!live ? (
          <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 24 }}>
            <View style={[styles.trophy, { backgroundColor: colors.sixSoft }]}>
              <Trophy size={28} color={colors.six} />
            </View>
            <AppText variant="label" color="textMuted">
              Full time
            </AppText>
            <AppText variant="title" style={{ textAlign: 'center' }}>
              {m.result?.text}
            </AppText>
            <View style={{ alignSelf: 'stretch', gap: 8, marginTop: 8 }}>
              <Button label="View scorecard" icon={ClipboardList} onPress={() => router.replace(`/match/${m.id}` as any)} />
              <Button label="Undo last ball" variant="secondary" icon={Undo2} onPress={() => store.undo(m.id)} />
            </View>
          </Card>
        ) : live1Done ? (
          <Card style={{ gap: 12 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Flag size={18} color={colors.accent} />
              <AppText variant="label" color="accent">
                Innings break · {inn.endReason}
              </AppText>
            </View>
            <AppText variant="title">
              {batTeam.name} {t.runs}/{t.wickets}
            </AppText>
            <AppText variant="body" color="textMuted">
              {bowlTeam.name} need {t.runs + 1} to win from {m.overs} overs.
            </AppText>
            <Button label="Start 2nd innings" variant="primary" onPress={() => store.nextInnings(m.id)} />
            <Button label="Undo last ball" variant="secondary" icon={Undo2} onPress={() => store.undo(m.id)} />
          </Card>
        ) : need ? (
          <Card style={{ gap: 12 }}>
            <AppText variant="bodyStrong">
              {need === 'bowler' ? 'Over complete — pick the next bowler' : need === 'striker' ? 'Pick the striker' : 'Pick the non-striker'}
            </AppText>
            <Button
              label={need === 'bowler' ? 'Select bowler' : 'Select batter'}
              icon={UserPlus}
              onPress={() => openPlayerPicker(need)}
            />
            <Button label="Undo last ball" variant="secondary" icon={Undo2} disabled={!inn.balls.length} onPress={() => store.undo(m.id)} />
          </Card>
        ) : (
          <>
            {extra ? (
              <AppText variant="caption" color="accent">
                {hint[extra]}
              </AppText>
            ) : null}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, alignItems: 'center' }}>
              {extrasOptions.map((e) => (
                <Tap key={e.k} accessibilityRole="button" accessibilityLabel={e.label} accessibilityState={{ selected: extra === e.k }} onPress={() => setExtra(extra === e.k ? null : e.k)} style={{ flexGrow: 1, flexBasis: 'auto', paddingHorizontal: 12, height: 40, borderRadius: 20, backgroundColor: extra === e.k ? colors.primarySoft : colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                  <AppText variant="caption" style={{ color: extra === e.k ? colors.primary : colors.textMuted }}>{e.label}</AppText>
                </Tap>
              ))}
              <IconButton icon={MoreVertical} label="Rare dismissals" size={40} onPress={openRare} />
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[0, 1, 2, 3].map((r) => (
                <RunButton key={r} compact={compact} value={r} onPress={() => onRun(r)} hapticEnabled={store.hapticVibration} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[4, 5, 6].map((r) => (
                <RunButton key={r} compact={compact} value={r} onPress={() => onRun(r)} hapticEnabled={store.hapticVibration} />
              ))}
              <Tap
                onPress={openWicket}
                hapticEnabled={store.hapticVibration}
                accessibilityLabel="Wicket"
                scaleTo={0.92}
                style={{ flex: 1, height: compact ? 52 : 68, borderRadius: compact ? 18 : 22, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' }}
              >
                <AppText variant="title" color="onDanger" style={{ fontFamily: fonts.extrabold, fontSize: 24 }}>
                  OUT
                </AppText>
              </Tap>
            </View>
            <View style={{ flexDirection: 'row', gap: 8, marginTop: compact ? 0 : 4 }}>
              <View style={{ flex: 1 }}>
                <Button label="Undo" variant="secondary" size="sm" icon={Undo2} disabled={!inn.balls.length} onPress={() => store.undo(m.id)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Swap" variant="secondary" size="sm" icon={ArrowLeftRight} onPress={() => store.swapStrike(m.id)} />
              </View>
              <View style={{ flex: 1.2 }}>
                <Tap
                  onPress={() => setConfirmEnd(true)}
                  accessibilityLabel="End innings"
                  style={{ height: 38, paddingHorizontal: 8, borderRadius: 24, borderWidth: 1, borderColor: colors.border, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5 }}
                >
                  <Flag size={14} color={colors.text} />
                  <AppText variant="bodyStrong" numberOfLines={1} style={{ fontSize: 12, flexShrink: 1 }}>End innings</AppText>
                </Tap>
              </View>
            </View>
          </>
        )}
      </Animated.View>
      </View>

      {!live ? <MatchAwards match={m} /> : null}

      <MatchInsightsSheet
        match={m}
        visible={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        onLeaveScoring={() => {
          setInsightsOpen(false);
          router.replace(`/match/${m.id}` as any);
        }}
      />

      {/* Picker sheet */}
      <Sheet
        visible={pickerOpen && pickerTarget !== null}
        onClose={closePlayerPicker}
        title={pickerTarget === 'bowler' ? 'Select bowler' : pickerTarget === 'striker' ? 'Select striker' : 'Select non-striker'}
        subtitle={
          pickerTarget === 'bowler'
            ? `${bowlTeam.name} · max ${limit} over${limit === 1 ? '' : 's'} each${inn.lastOverBowler && !m.allowConsecutiveOvers ? ' · last over’s bowler is resting' : ''}`
            : `${batTeam.name} · next in`
        }
        footer={pickerTarget !== 'bowler' && inn.balls.some((ball) => ball.wicket || ball.noDelivery) ? <Button label="Record a timed out dismissal" variant="secondary" onPress={openRare} /> : undefined}
      >
        <View style={{ gap: 8 }}>
          {pickerTarget === 'bowler' ? (
            pickerBowlers.length ? pickerBowlers.map((pid) => {
                const s = bowlerOvers(pid);
                const rested = !m.allowConsecutiveOvers && pid === inn.lastOverBowler;
                const maxed = (s?.balls ?? 0) >= limit * 6;
                return (
                  <PlayerRow
                    key={pid}
                    name={name(pid)}
                    sub={m.players[pid]?.role}
                    color={bowlTeam.color}
                    disabled={rested || maxed}
                    onPress={() => selectPlayer(pid)}
                    trailing={
                      <AppText variant="caption" color="textMuted" style={{ fontVariant: ['tabular-nums'] }}>
                        {rested ? 'Rested' : maxed ? 'Quota done' : s ? `${oversText(s.balls)}-${s.maidens}-${s.runs}-${s.wickets}` : 'Fresh'}
                      </AppText>
                    }
                  />
                );
                }) : <AppText variant="caption" color="textMuted">No other eligible bowlers are available.</AppText>
          ) : pickerBatters.length ? (
            pickerBatters.map((pid) => (
                <PlayerRow
                  key={pid}
                  name={name(pid)}
                  sub={m.players[pid]?.role}
                  color={batTeam.color}
                  onPress={() => selectPlayer(pid)}
                />
            ))
          ) : (
            <AppText variant="caption" color="textMuted">No other eligible batters are available.</AppText>
          )}
        </View>
      </Sheet>

      {/* Wicket sheet */}
      <Sheet visible={rareOpen} onClose={() => setRareOpen(false)} title="Rare dismissals"
        footer={<Button label="Confirm dismissal" variant="danger" disabled={!rareKind || !rareOut || !rareCandidates.includes(rareOut)} onPress={confirmRare} />}>
        <View style={{ gap: 8 }}>
          {RARE_KINDS.map((kind) => (
            <Button key={kind} label={WICKET_LABEL[kind]} variant={rareKind === kind ? 'soft' : 'secondary'}
              disabled={kind === 'timedout' ? !pickerBatters.length || (!!inn.striker && !!inn.nonStriker) : kind === 'retiredout' ? !inn.striker && !inn.nonStriker : !!need}
              onPress={() => {
                setRareKind(kind);
                setRareOut(kind === 'hittwice' ? inn.striker : null);
                setRareRuns(0);
                if (kind === 'hittwice' && rareExtra !== 'nb') setRareExtra(null);
              }} />
          ))}
        </View>
        {rareKind ? <>
          <AppText variant="caption" color="textMuted">{betweenDeliveries ? 'Recorded without adding a delivery.' : 'Records this delivery and the dismissal.'} No wicket is credited to the bowler.</AppText>
          <AppText variant="label" color="textMuted">{rareKind === 'timedout' ? 'Incoming batter who is out' : 'Who is out'}</AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {rareCandidates.map((pid) => <Chip key={pid} label={name(pid)} selected={rareOut === pid} onPress={() => setRareOut(pid)} />)}
          </View>
          {!betweenDeliveries ? <>
            <AppText variant="label" color="textMuted">Delivery</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              <Chip label="Normal" selected={!rareExtra} onPress={() => setRareExtra(null)} />
              {extrasOptions.filter((option) => rareKind === 'obstructing' || option.k === 'nb').map((option) => <Chip key={option.k} label={option.label} selected={rareExtra === option.k} onPress={() => setRareExtra(option.k)} />)}
            </View>
          </> : null}
          {rareKind === 'obstructing' ? <>
            <AppText variant="label" color="textMuted">Runs awarded by umpire</AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{[0, 1, 2, 3, 4, 5, 6].map((runs) => <Chip key={runs} label={String(runs)} selected={rareRuns === runs} onPress={() => setRareRuns(runs)} />)}</View>
          </> : null}
        </> : null}
      </Sheet>
      <Sheet
        visible={wicketOpen}
        onClose={() => setWicketOpen(false)}
        title="Wicket"
        subtitle={extra ? hint[extra].split(' — ')[0] + ' delivery' : `${name(inn.striker)} on strike`}
        footer={<Button label="Confirm wicket" variant="danger" disabled={!wKind} onPress={confirmWicket} />}
      >
        <View style={{ gap: 8 }}>
          <AppText variant="label" color="textMuted">
            How out
          </AppText>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {kinds.map((k) => (
              <Chip
                key={k}
                label={WICKET_LABEL[k]}
                selected={wKind === k}
                selectedBackgroundColor="#F5D2D6"
                selectedTextColor="#971B29"
                onPress={() => setWKind(k)}
              />
            ))}
          </View>
        </View>
        {wKind === 'runout' ? (
          <>
            <View style={{ gap: 8 }}>
              <AppText variant="label" color="textMuted">
                Who is out
              </AppText>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Chip label={name(inn.striker)} selected={wOut === 'striker'} onPress={() => setWOut('striker')} />
                <Chip label={name(inn.nonStriker)} selected={wOut === 'nonStriker'} onPress={() => setWOut('nonStriker')} />
              </View>
            </View>
            <View style={{ gap: 8 }}>
              <AppText variant="label" color="textMuted">
                Runs completed
              </AppText>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {[0, 1, 2, 3].map((r) => (
                  <Chip key={r} label={String(r)} selected={wRuns === r} onPress={() => setWRuns(r)} />
                ))}
              </View>
            </View>
          </>
        ) : null}
        {wKind === 'caught' || wKind === 'stumped' || wKind === 'runout' ? (
          <View style={{ gap: 8 }}>
            <AppText variant="label" color="textMuted">
              {wKind === 'stumped' ? 'Keeper' : 'Fielder'} (optional)
            </AppText>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {bowlers.map((pid) => (
                <Chip
                  key={pid}
                  label={name(pid)}
                  selected={wFielder === pid}
                  selectedBackgroundColor="#F5D2D6"
                  selectedTextColor="#971B29"
                  onPress={() => setWFielder(wFielder === pid ? null : pid)}
                />
              ))}
            </View>
          </View>
        ) : null}
      </Sheet>

      <Sheet
        visible={milestone !== null}
        onClose={() => setMilestone(null)}
        title={milestone?.title ?? ''}
        footer={<Button label="Continue scoring" onPress={() => setMilestone(null)} />}
      >
        <View style={{ alignItems: 'center', gap: 12, paddingVertical: 8 }}>
          <View style={[styles.trophy, { backgroundColor: colors.sixSoft }]}>
            <Trophy size={28} color={colors.six} />
          </View>
          <AppText variant="bodyStrong" style={{ textAlign: 'center' }}>
            {milestone?.message}
          </AppText>
        </View>
      </Sheet>

      <ConfirmSheet
        visible={confirmEnd}
        title="End this innings?"
        message="The innings will be closed with the current score. You can still undo the last ball afterwards."
        confirmLabel="End innings"
        onCancel={() => setConfirmEnd(false)}
        onConfirm={() => {
          store.endInnings(m.id);
          setConfirmEnd(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  board: { borderRadius: 28, padding: 22, gap: 8, overflow: 'hidden' },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  tableRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 6, gap: 4 },
  divider: { height: 1, marginVertical: 8 },
  trophy: { width: 64, height: 64, borderRadius: 32, alignItems: 'center', justifyContent: 'center' },
});
