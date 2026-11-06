import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { Check, ChevronDown, ChevronUp, Flag, Swords, Zap } from 'lucide-react-native';
import { AppText, SectionHeader, Tap } from '@/src/components/ui';
import { Avatar } from '@/src/components/cricket/Avatar';
import { PlayerRow } from '@/src/features/players/components/PlayerRow';
import { useStore } from '@/src/store';
import { useTheme } from '@/src/theme';
import type { Format } from '@/src/types';
import { MAX_SQUAD } from '../constants';
import type { CoinSide } from '../constants';

export function useNewMatchController() {
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
                <Avatar name={t.short} color={t.color} size={42} badge={t.badge} />
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


  return {
    router,
    colors,
    store,
    step,
    setStep,
    format,
    setFormat,
    customOvers,
    setCustomOvers,
    customBowlerLimit,
    setCustomBowlerLimit,
    allowConsecutiveOvers,
    setAllowConsecutiveOvers,
    teamA,
    teamB,
    squadA,
    squadB,
    tossWinner,
    setTossWinner,
    decision,
    setDecision,
    coinSheetOpen,
    coinSide,
    coinCallerTeamId,
    setCoinCallerTeamId,
    coinCall,
    setCoinCall,
    coinFlipping,
    coinStyle,
    openCoinSheet,
    closeCoinSheet,
    flipCoin,
    flipAgain,
    overs,
    bowlerLimit,
    teamName,
    teamsReady,
    canNext,
    start,
    formats,
    squadSection,
    teamPicker,
  };
}
