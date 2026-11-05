import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { Easing, FadeInDown, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Check, ChevronDown, ChevronUp, Coins, Crown, Flag, RotateCw, Shield, Swords, Users, X, Zap } from 'lucide-react-native';
import {
  AppText,
  Avatar,
  Button,
  Card,
  Chip,
  EmptyState,
  IconButton,
  PlayerRow,
  ProgressBar,
  Screen,
  SectionHeader,
  Sheet,
  Stepper,
  Tap,
} from '@/src/components/ui';
import { useStore } from '@/src/store';
import { useTheme } from '@/src/theme';
import type { Format } from '@/src/types';

const STEPS = ['Format', 'Teams', 'Squads', 'Toss'];
const MAX_SQUAD = 11;

type CoinSide = 'Heads' | 'Tails';

function CoinFace({ side }: { side: CoinSide }) {
  const Emblem = side === 'Heads' ? Crown : Shield;
  return (
    <View
      style={{
        position: 'absolute',
        left: 5,
        top: 5,
        right: 5,
        bottom: 5,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#FFF0A3',
        overflow: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      <LinearGradient
        colors={['#FFF1A8', '#E6AD37', '#F6D36B', '#C8871C']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <View
          style={{
            position: 'absolute',
            left: 7,
            top: 7,
            right: 7,
            bottom: 7,
            borderRadius: 55,
            borderWidth: 1.5,
            borderColor: 'rgba(111,68,9,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <Emblem size={26} color="#68430D" strokeWidth={2.2} />
          <AppText variant="label" style={{ color: '#50330B', fontSize: 10, letterSpacing: 1.5 }}>
            {side}
          </AppText>
          <View style={{ flexDirection: 'row', gap: 5 }}>
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: '#68430D' }} />
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: '#68430D' }} />
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: '#68430D' }} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}

export default function NewMatch() {
  const { format: fmtParam } = useLocalSearchParams<{ format?: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const store = useStore();

  const [step, setStep] = useState(0);
  const [openTeams, setOpenTeams] = useState({ A: true, B: true });
  const [format, setFormat] = useState<Format>(fmtParam === 'ODI' ? 'ODI' : fmtParam === 'Custom' ? 'Custom' : 'T20');
  const [customOvers, setCustomOvers] = useState(10);
  const [customBowlerLimit, setCustomBowlerLimit] = useState<number | null>(null);
  const [allowConsecutiveOvers, setAllowConsecutiveOvers] = useState(false);
  const [teamA, setTeamA] = useState<string | null>(null);
  const [teamB, setTeamB] = useState<string | null>(null);
  const [squadA, setSquadA] = useState<string[]>([]);
  const [squadB, setSquadB] = useState<string[]>([]);
  const [tossWinner, setTossWinner] = useState<string | null>(null);
  const [decision, setDecision] = useState<'bat' | 'bowl'>('bat');
  const [coinSheetOpen, setCoinSheetOpen] = useState(false);
  const [coinSide, setCoinSide] = useState<CoinSide | null>(null);
  const [pendingCoinSide, setPendingCoinSide] = useState<CoinSide | null>(null);
  const [coinCallerTeamId, setCoinCallerTeamId] = useState<string | null>(null);
  const [coinCall, setCoinCall] = useState<CoinSide | null>(null);
  const [coinFlipping, setCoinFlipping] = useState(false);
  const coinRotation = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const coinStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 800 }, { rotateY: `${coinRotation.value}deg` }],
  }));
  const flipDuration = reduceMotion ? 450 : 1100;

  useEffect(() => {
    if (!coinFlipping || !pendingCoinSide) return;
    const timer = setTimeout(() => {
      setCoinSide(pendingCoinSide);
      coinRotation.value = 0;
      if (coinCallerTeamId && coinCall) {
        const winnerId = pendingCoinSide === coinCall
          ? coinCallerTeamId
          : coinCallerTeamId === teamA ? teamB : teamA;
        setTossWinner(winnerId);
      }
      setPendingCoinSide(null);
      setCoinFlipping(false);
    }, flipDuration);
    return () => clearTimeout(timer);
  }, [coinCall, coinCallerTeamId, coinFlipping, coinRotation, flipDuration, pendingCoinSide, teamA, teamB]);

  const openCoinSheet = () => {
    setCoinSide(null);
    setPendingCoinSide(null);
    setCoinCallerTeamId(null);
    setCoinCall(null);
    setCoinFlipping(false);
    coinRotation.value = 0;
    setCoinSheetOpen(true);
  };

  const closeCoinSheet = () => {
    if (coinFlipping) return;
    if (coinSide && coinCallerTeamId && coinCall) {
      setTossWinner(
        coinSide === coinCall
          ? coinCallerTeamId
          : coinCallerTeamId === teamA ? teamB : teamA,
      );
    }
    setCoinFlipping(false);
    setPendingCoinSide(null);
    setCoinSheetOpen(false);
  };

  const flipCoin = () => {
    if (coinFlipping || !coinCallerTeamId || !coinCall) return;
    const result: CoinSide = Math.random() < 0.5 ? 'Heads' : 'Tails';
    setCoinSide(null);
    setPendingCoinSide(result);
    setCoinFlipping(true);
    coinRotation.value = 0;
    coinRotation.value = withTiming(1800, {
      duration: flipDuration,
      easing: Easing.out(Easing.cubic),
    });
  };

  const flipAgain = () => {
    if (coinFlipping) return;
    setCoinSide(null);
    flipCoin();
  };

  const overs = format === 'T20' ? 20 : format === 'ODI' ? 50 : customOvers;
  const bowlerLimit = format === 'Custom'
    ? Math.min(overs, customBowlerLimit ?? Math.max(1, Math.ceil(overs / 5)))
    : Math.max(1, Math.ceil(overs / 5));
  const playersOf = (tid: string | null) => store.players.filter((p) => p.teamId === tid);
  const teamName = (id: string | null) => store.teams.find((t) => t.id === id)?.name ?? '';

  const pickTeam = (side: 'A' | 'B', id: string) => {
    const squad = playersOf(id)
      .slice(0, MAX_SQUAD)
      .map((p) => p.id);
    if (side === 'A') {
      setTeamA(id);
      setSquadA(squad);
      if (teamB === id) setTeamB(null);
    } else {
      setTeamB(id);
      setSquadB(squad);
      if (teamA === id) setTeamA(null);
    }
    setTossWinner(null);
  };

  const toggle = (side: 'A' | 'B', pid: string) => {
    const [list, set] = side === 'A' ? [squadA, setSquadA] : [squadB, setSquadB];
    if (list.includes(pid)) set(list.filter((x) => x !== pid));
    else if (list.length < MAX_SQUAD) set([...list, pid]);
  };

  const teamsReady = !!teamA && !!teamB && playersOf(teamA).length >= 2 && playersOf(teamB).length >= 2;
  const squadsReady = squadA.length >= 2 && squadB.length >= 2;
  const canNext = step === 0 ? true : step === 1 ? teamsReady : step === 2 ? squadsReady : true;

  const start = () => {
    if (!teamA || !teamB) return;
    const winner = tossWinner ?? teamA;
    const id = store.createMatch({
      format,
      overs,
      bowlerOversLimit: bowlerLimit,
      allowConsecutiveOvers: format === 'Custom' && allowConsecutiveOvers,
      teamAId: teamA,
      teamBId: teamB,
      squadA,
      squadB,
      tossWinnerId: winner,
      decision,
    });
    router.replace(`/match/${id}/score` as any);
  };

  const formats: { f: Format; title: string; sub: string; icon: any }[] = [
    { f: 'T20', title: 'T20', sub: '20 overs a side · fast and furious', icon: Zap },
    { f: 'ODI', title: 'ODI', sub: '50 overs a side · the full story', icon: Flag },
    { f: 'Custom', title: 'Custom', sub: 'Pick your own number of overs', icon: Swords },
  ];

  const squadSection = (side: 'A' | 'B', tid: string | null, squad: string[]) => {
    const team = store.teams.find((t) => t.id === tid);
    if (!team) return null;
    return (
      <View key={side}>
        <SectionHeader
          title={`${team.name} · ${squad.length} selected`}
          action={
            <Tap
              onPress={() => (side === 'A' ? setSquadA : setSquadB)(playersOf(tid).slice(0, MAX_SQUAD).map((p) => p.id))}
            >
              <AppText variant="caption" color="primary" style={{ fontWeight: '700' }}>
                Select all
              </AppText>
            </Tap>
          }
        />
        <View style={{ gap: 8 }}>
          {playersOf(tid).map((p) => {
            const on = squad.includes(p.id);
            return (
              <PlayerRow
                key={p.id}
                name={p.name}
                sub={p.role}
                color={team.color}
                selected={on}
                onPress={() => toggle(side, p.id)}
                trailing={
                  <View
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: 13,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: on ? colors.primary : 'transparent',
                      borderWidth: on ? 0 : 2,
                      borderColor: colors.border,
                    }}
                  >
                    {on ? <Check size={16} color={colors.onPrimary} strokeWidth={3} /> : null}
                  </View>
                }
              />
            );
          })}
        </View>
        {squad.length < 2 ? (
          <AppText variant="caption" color="danger" style={{ marginTop: 8 }}>
            Pick at least 2 players.
          </AppText>
        ) : null}
      </View>
    );
  };

  const teamPicker = (side: 'A' | 'B') => {
    const sel = side === 'A' ? teamA : teamB;
    const other = side === 'A' ? teamB : teamA;
    return (
      <View>
        <Tap
          onPress={() => setOpenTeams((current) => ({ ...current, [side]: !current[side] }))}
          accessibilityLabel={`Team ${side}`}
          accessibilityState={{ expanded: openTeams[side] }}
          style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', minHeight: 44, marginTop: 12, marginBottom: 8, gap: 8 }}
        >
          <AppText variant="label" color="textMuted">Team {side}</AppText>
          {openTeams[side] ? <ChevronUp size={18} color={colors.textMuted} /> : <ChevronDown size={18} color={colors.textMuted} />}
        </Tap>
        {openTeams[side] ? <View style={{ gap: 8 }}>
          {store.teams.map((t) => {
            const n = playersOf(t.id).length;
            const on = sel === t.id;
            const blocked = other === t.id;
            return (
              <Tap
                key={t.id}
                disabled={blocked}
                onPress={() => pickTeam(side, t.id)}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 18,
                  backgroundColor: on ? colors.primarySoft : colors.surface,
                  borderWidth: 1.5,
                  borderColor: on ? colors.primary : colors.border,
                  opacity: blocked ? 0.35 : 1,
                }}
              >
                <Avatar name={t.short} color={t.color} size={42} />
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyStrong" color="text">{t.name}</AppText>
                  <AppText variant="caption" color={n < 2 ? 'danger' : 'textMuted'}>
                    {n} player{n === 1 ? '' : 's'}
                    {n < 2 ? ' · add more first' : ''}
                  </AppText>
                </View>
                {on ? (
                  <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                    <Check size={16} color={colors.onPrimary} strokeWidth={3} />
                  </View>
                ) : null}
              </Tap>
            );
          })}
        </View> : null}
      </View>
    );
  };

  return (
    <Screen
      edges={['top', 'bottom']}
      footer={
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {step > 0 ? <Button label="Back" variant="secondary" full={false} style={{ flex: 1 }} onPress={() => setStep(step - 1)} /> : null}
          {step < 3 ? (
            <Button label="Continue" disabled={!canNext} style={{ flex: 2 }} full={false} onPress={() => setStep(step + 1)} />
          ) : (
            <Button label="Start match" variant="accent" style={{ flex: 2 }} full={false} onPress={start} />
          )}
        </View>
      }
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ flex: 1 }}>
          <AppText variant="label" color="primary">
            Step {step + 1} of 4
          </AppText>
          <AppText variant="title">{['Choose a format', 'Pick the sides', 'Select the XI', 'The toss'][step]}</AppText>
        </View>
        <IconButton icon={X} label="Close" onPress={() => router.back()} />
      </View>
      <View style={{ marginBottom: 20 }}>
        <ProgressBar value={(step + 1) / STEPS.length} />
      </View>

      <Animated.View key={step} entering={FadeInDown.duration(300)}>
        {step === 0 ? (
          <View style={{ gap: 12 }}>
            {formats.map((x) => {
              const on = format === x.f;
              return (
                <Tap
                  key={x.f}
                  onPress={() => setFormat(x.f)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 16,
                    padding: 18,
                    borderRadius: 22,
                    backgroundColor: on ? colors.primarySoft : colors.surface,
                    borderWidth: 1.5,
                    borderColor: on ? colors.primary : colors.border,
                  }}
                >
                  <View style={{ width: 48, height: 48, borderRadius: 24, backgroundColor: on ? colors.primary : colors.surfaceAlt, alignItems: 'center', justifyContent: 'center' }}>
                    <x.icon size={22} color={on ? colors.onPrimary : colors.textMuted} strokeWidth={2.4} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="heading">{x.title}</AppText>
                    <AppText variant="caption" color="textMuted">
                      {x.sub}
                    </AppText>
                  </View>
                </Tap>
              );
            })}
            {format === 'Custom' ? (
              <Card style={{ gap: 12, alignItems: 'center' }}>
                <AppText variant="label" color="textMuted">
                  Overs per innings
                </AppText>
                <Stepper value={customOvers} onChange={setCustomOvers} min={1} max={50} />
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[5, 8, 10, 15, 30].map((o) => (
                    <Chip key={o} label={`${o}`} selected={customOvers === o} onPress={() => setCustomOvers(o)} />
                  ))}
                </View>
              </Card>
            ) : null}
            {format === 'Custom' ? (
              <Card style={{ gap: 12, alignItems: 'center' }}>
                <AppText variant="label" color="textMuted">Maximum overs per bowler</AppText>
                <Stepper value={bowlerLimit} onChange={setCustomBowlerLimit} min={1} max={overs} />
                <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
                  <Chip label="Automatic" selected={customBowlerLimit === null} onPress={() => setCustomBowlerLimit(null)} />
                  <Chip label="No limit" selected={customBowlerLimit === overs} onPress={() => setCustomBowlerLimit(overs)} />
                </View>
                <AppText variant="caption" color="textMuted">Allow the same bowler to bowl consecutive overs?</AppText>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Chip label="No" selected={!allowConsecutiveOvers} onPress={() => setAllowConsecutiveOvers(false)} />
                  <Chip label="Yes" selected={allowConsecutiveOvers} onPress={() => setAllowConsecutiveOvers(true)} />
                </View>
              </Card>
            ) : null}
            <AppText variant="caption" color="textMuted" style={{ textAlign: 'center', marginTop: 4 }}>
              Each bowler can bowl up to {bowlerLimit} over{bowlerLimit === 1 ? '' : 's'}.
            </AppText>
          </View>
        ) : null}

        {step === 1 ? (
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
        ) : null}

        {step === 2 ? (
          <View>
            {squadSection('A', teamA, squadA)}
            {squadSection('B', teamB, squadB)}
          </View>
        ) : null}

        {step === 3 && teamA && teamB ? (
          <View style={{ gap: 16 }}>
            <Card style={{ gap: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Coins size={20} color={colors.primary} strokeWidth={2.2} />
                </View>
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyStrong">Flip for the toss</AppText>
                  <AppText variant="caption" color="textMuted">One team calls heads or tails. The matching call wins.</AppText>
                </View>
              </View>
              <Button label="Flip coin" icon={RotateCw} variant="soft" onPress={openCoinSheet} />
            </Card>
            <AppText variant="label" color="textMuted">
              Who won the toss?
            </AppText>
            {[teamA, teamB].map((tid) => {
              const t = store.teams.find((x) => x.id === tid)!;
              const on = (tossWinner ?? teamA) === tid;
              return (
                <Tap
                  key={tid}
                  onPress={() => setTossWinner(tid)}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 14,
                    padding: 16,
                    borderRadius: 20,
                    backgroundColor: on ? colors.primarySoft : colors.surface,
                    borderWidth: 1.5,
                    borderColor: on ? colors.primary : colors.border,
                  }}
                >
                  <Avatar name={t.short} color={t.color} size={44} />
                  <AppText variant="heading" style={{ flex: 1 }}>
                    {t.name}
                  </AppText>
                  {on ? (
                    <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={17} color={colors.onPrimary} strokeWidth={3} />
                    </View>
                  ) : null}
                </Tap>
              );
            })}
            <AppText variant="label" color="textMuted" style={{ marginTop: 8 }}>
              They chose to
            </AppText>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <Button label="Bat first" variant={decision === 'bat' ? 'soft' : 'secondary'} onPress={() => setDecision('bat')} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Bowl first" variant={decision === 'bowl' ? 'soft' : 'secondary'} onPress={() => setDecision('bowl')} />
              </View>
            </View>
            <Card style={{ marginTop: 8, gap: 4 }}>
              <AppText variant="caption" color="textMuted">
                {format === 'Custom' ? `${overs}-over match` : format}
              </AppText>
              <AppText variant="caption" color="textMuted">
                Maximum {bowlerLimit} overs per bowler. {format === 'Custom' && allowConsecutiveOvers ? 'Consecutive overs allowed.' : 'Bowlers alternate overs.'}
              </AppText>
              <AppText variant="bodyStrong">
                {teamName(teamA)} v {teamName(teamB)}
              </AppText>
              <AppText variant="caption" color="textMuted">
                {teamName(tossWinner ?? teamA)} won the toss and chose to {decision}.
              </AppText>
            </Card>
          </View>
        ) : null}
      </Animated.View>

      <Sheet
        visible={coinSheetOpen}
        onClose={closeCoinSheet}
        title="Flip the coin"
        subtitle="Choose a team and its call before flipping."
      >
        <View style={{ alignItems: 'center', gap: 16, paddingVertical: 8 }}>
          <Animated.View
            style={[
              {
                width: 144,
                height: 144,
                borderRadius: 72,
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000000',
                shadowOpacity: 0.3,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 8 },
                elevation: 8,
              },
              coinStyle,
            ]}
          >
            <View
              style={{
                position: 'absolute',
                width: 140,
                height: 140,
                borderRadius: 70,
                borderWidth: 3,
                borderColor: '#FFE58A',
                backgroundColor: '#A96E17',
                transform: [{ translateX: 3 }],
              }}
            />
            {coinSide ? <CoinFace side={coinSide} /> : (
              <View
                style={{
                  position: 'absolute',
                  left: 5,
                  top: 5,
                  right: 5,
                  bottom: 5,
                  borderRadius: 67,
                  borderWidth: 2,
                  borderColor: '#FFF0A3',
                  backgroundColor: '#E8B747',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backfaceVisibility: 'hidden',
                }}
              >
                <AppText variant="title" style={{ color: '#50330B' }}>{coinFlipping ? '•' : '?'}</AppText>
              </View>
            )}
          </Animated.View>
          <AppText variant="bodyStrong" color="textMuted" style={{ textAlign: 'center' }}>
            {coinFlipping ? 'Flipping…' : coinSide ? `It landed on ${coinSide}.` : 'Tap below to flip.'}
          </AppText>
        </View>
        {!coinSide ? (
          <View style={{ gap: 12 }}>
            <AppText variant="label" color="textMuted">Which team is calling?</AppText>
            <View style={{ gap: 8 }}>
              {[teamA, teamB].map((teamId) => {
                const team = store.teams.find((item) => item.id === teamId);
                if (!team) return null;
                const selected = coinCallerTeamId === teamId;
                return (
                  <Tap
                    key={teamId}
                    onPress={() => setCoinCallerTeamId(teamId)}
                    accessibilityState={{ selected }}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 12,
                      padding: 12,
                      borderRadius: 16,
                      backgroundColor: selected ? colors.primarySoft : colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: selected ? colors.primary : 'transparent',
                    }}
                  >
                    <Avatar name={team.short} color={team.color} size={38} />
                    <AppText variant="bodyStrong" style={{ flex: 1 }}>{team.name}</AppText>
                    {selected ? <Check size={18} color={colors.primary} strokeWidth={2.8} /> : null}
                  </Tap>
                );
              })}
            </View>
            <AppText variant="label" color="textMuted">The team calls</AppText>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {(['Heads', 'Tails'] as const).map((side) => (
                <View key={side} style={{ flex: 1 }}>
                  <Button
                    label={side}
                    variant={coinCall === side ? 'soft' : 'secondary'}
                    disabled={!coinCallerTeamId}
                    onPress={() => setCoinCall(side)}
                  />
                </View>
              ))}
            </View>
            <Button
              label="Flip coin"
              icon={RotateCw}
              variant="soft"
              disabled={!coinCallerTeamId || !coinCall}
              onPress={flipCoin}
            />
          </View>
        ) : (
          <View style={{ gap: 12 }}>
            <Card style={{ alignItems: 'center', gap: 6 }}>
              <AppText variant="label" color="textMuted">Toss winner</AppText>
              <AppText variant="title" color="primary">
                {teamName(tossWinner)}
              </AppText>
              <AppText variant="caption" color="textMuted" style={{ textAlign: 'center' }}>
                {teamName(coinCallerTeamId)} called {coinCall}. The coin landed on {coinSide}.
              </AppText>
            </Card>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              <View style={{ flex: 1 }}>
                <Button label="Flip again" icon={RotateCw} variant="secondary" onPress={flipAgain} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Use toss result" variant="soft" onPress={closeCoinSheet} />
              </View>
            </View>
          </View>
        )}
      </Sheet>
    </Screen>
  );
}
