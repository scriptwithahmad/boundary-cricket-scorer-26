import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, useWindowDimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useFocusEffect } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useScorePop } from '@/src/hooks/useScorePop';
import { useStore } from '@/src/store';
import { useTheme } from '@/src/theme';
import { battingCard, bowlerOverLimit, bowlingCard, bowlerCreditedWicket, currentInnings, lastOverBalls, needOf, totals, ballRuns, battingOrder } from '@/src/engine/cricket';
import type { ExtraType, WicketKind } from '@/src/types';
import { haptic } from '@/src/lib/haptics';
import { useScoringSpeech } from '@/src/features/matches/hooks/useScoringSpeech';
import type { BallInput } from '@/src/engine/cricket';
import { ALL_KINDS } from '../constants';
import type { RareKind } from '../constants';

export function useScoringController() {
  const { height: viewportHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const [availableHeight, setAvailableHeight] = useState<number | null>(null);
  // Window dimensions can include system bars in standalone edge-to-edge builds.
  // Measure the actual safe-area viewport so Expo Go and release use the same budget.
  // The spacious cards and keypad together need about 850dp, plus chase/hint text.
  const autoCompact = (availableHeight ?? viewportHeight - insets.top - insets.bottom) < 900;
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const store = useStore();
  const compact = store.scoringLayout === 'compact' || (store.scoringLayout === 'auto' && autoCompact);
  const [isFocused, setIsFocused] = useState(false);
  const [appActive, setAppActive] = useState(AppState.currentState === 'active');
  const match = store.matches.find((m) => m.id === id);
  useScoringSpeech(match, store.playSound && isFocused && appActive, store.soundVolume);
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
  const [pendingShot, setPendingShot] = useState<{ input: BallInput; batterId: string } | null>(null);
  const [shotAngle, setShotAngle] = useState<number | undefined>();
  const [shotDistance, setShotDistance] = useState<number | undefined>();
  const [dismissalConfirmation, setDismissalConfirmation] = useState<'regular' | 'rare' | null>(null);
  const [celebration, setCelebration] = useState<{ id: string; runs: number } | null>(null);
  const lastDelivery = useRef<{ matchId?: string; count: number }>({ matchId: match?.id, count: match?.innings.reduce((sum, innings) => sum + innings.balls.length, 0) ?? 0 });

  useEffect(() => {
    const count = match?.innings.reduce((sum, innings) => sum + innings.balls.length, 0) ?? 0;
    const previous = lastDelivery.current;
    lastDelivery.current = { matchId: match?.id, count };
    if (!store.boundaryCelebrations || !isFocused || !appActive) { setCelebration(null); return; }
    if (match && previous.matchId === match.id && count > previous.count) {
      const latestInnings = match.innings[match.innings.length - 1];
      const ball = latestInnings?.balls[latestInnings.balls.length - 1];
      if (ball && !ball.wicket && (ball.runs === 4 || ball.runs === 6)) setCelebration({ id: ball.id, runs: ball.runs });
    } else if (count < previous.count) setCelebration(null);
  }, [match, store.boundaryCelebrations, isFocused, appActive]);
  useEffect(() => {
    if (!celebration) return;
    const timeout = setTimeout(() => setCelebration(null), 1600);
    return () => clearTimeout(timeout);
  }, [celebration]);

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
    if (!need || pendingShot) return;
    setPickerTarget(need);
    setPickerOpen(true);
  }, [need, inn?.balls.length, match?.innings.length, pendingShot]);

  if (!match || !inn || !t) return null;

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

  const recordScore = (input: BallInput) => {
    if (store.recordShotDirections && input.runs > 0 && (!input.extra || input.extra === 'nb') && inn.striker) {
      setShotAngle(undefined);
      setShotDistance(undefined);
      setPendingShot({ input, batterId: inn.striker });
    } else store.score(m.id, input);
  };
  const saveShot = (skip = false) => {
    if (!pendingShot || (!skip && shotAngle === undefined)) return;
    store.score(m.id, { ...pendingShot.input, shotAngle: skip ? undefined : shotAngle, shotDistance: skip ? undefined : shotDistance });
    setPendingShot(null);
    setShotAngle(undefined);
    setShotDistance(undefined);
  };

  const onRun = (r: number) => {
    const batterRuns = bat.find((stat) => stat.id === inn.striker)?.runs ?? 0;
    const reached = [50, 100, 150, 200].find((score) => batterRuns < score && batterRuns + r >= score);
    recordScore({ runs: r, extra: extra ?? undefined });
    if (store.hapticVibration && (r === 4 || r === 6)) haptic.impact();
    if (store.milestoneAlerts && (!extra || extra === 'nb') && reached !== undefined) {
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
    recordScore({
      runs: wKind === 'runout' ? wRuns : 0,
      extra: extra ?? undefined,
      wicket: {
        kind: wKind,
        playerOutId: wKind === 'runout' && wOut === 'nonStriker' ? inn.nonStriker! : inn.striker!,
        fielderId: wFielder ?? undefined,
      },
    });
    if (store.hapticVibration) haptic.warning();
    if (store.milestoneAlerts && creditedWicket && previousWickets >= 2) {
      setMilestone({
        title: 'Hat-trick!',
        message: `Incredible! ${name(inn.bowler)} has taken three wickets in three consecutive balls.`,
      });
    } else if (store.milestoneAlerts && creditedWicket && previousWickets === 1) {
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
    recordScore({
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


  return {
    setAvailableHeight,
    id,
    router,
    colors,
    store,
    compact,
    isFocused,
    appActive,
    match,
    inn,
    t,
    need,
    extra,
    setExtra,
    wicketOpen,
    setWicketOpen,
    rareOpen,
    setRareOpen,
    rareKind,
    setRareKind,
    rareOut,
    setRareOut,
    rareRuns,
    setRareRuns,
    rareExtra,
    setRareExtra,
    pickerOpen,
    pickerTarget,
    confirmEnd,
    setConfirmEnd,
    wKind,
    setWKind,
    wOut,
    setWOut,
    wFielder,
    setWFielder,
    wRuns,
    setWRuns,
    milestone,
    setMilestone,
    insightsOpen,
    setInsightsOpen,
    pendingShot,
    shotAngle,
    setShotAngle,
    shotDistance,
    setShotDistance,
    dismissalConfirmation,
    setDismissalConfirmation,
    celebration,
    pop,
    m,
    batTeam,
    bowlTeam,
    striker,
    nonStriker,
    bowlerStat,
    name,
    hasPlayedBall,
    canChangeBowler,
    openPlayerPicker,
    over,
    overRuns,
    crr,
    ballsLeft,
    need2,
    rrr,
    inningsNo,
    live,
    live1Done,
    limit,
    saveShot,
    onRun,
    kinds,
    openWicket,
    confirmWicket,
    bowlerOvers,
    bowlers,
    pickerBatters,
    pickerBowlers,
    openRare,
    rareCandidates,
    betweenDeliveries,
    confirmRare,
    closePlayerPicker,
    selectPlayer,
    extrasOptions,
    hint,
  };
}
