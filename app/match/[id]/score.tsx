import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';
import { ArrowLeftRight, ClipboardList, Flag, Swords, Trophy, Undo2, UserPlus } from 'lucide-react-native';
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

const ALL_KINDS: WicketKind[] = ['bowled', 'caught', 'lbw', 'runout', 'stumped', 'hitwicket'];

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
    label = b.extraRuns > 1 ? `Wd${b.extraRuns - 1}` : 'Wd';
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

function RunButton({ value, onPress }: { value: number; onPress: () => void }) {
  const { colors } = useTheme();
  const bg = value === 4 ? colors.fourSoft : value === 6 ? colors.sixSoft : colors.surfaceAlt;
  const fg = value === 4 ? colors.four : value === 6 ? colors.six : colors.text;
  return (
    <Tap
      onPress={onPress}
      accessibilityLabel={`${value} run${value === 1 ? '' : 's'}`}
      scaleTo={0.92}
      style={{ flex: 1, height: 68, borderRadius: 22, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}
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
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const store = useStore();
  const match = store.matches.find((m) => m.id === id);
  const inn = match ? currentInnings(match) : undefined;
  const t = inn ? totals(inn) : undefined;
  const need = match ? needOf(match) : null;

  const [extra, setExtra] = useState<ExtraType | null>(null);
  const [wicketOpen, setWicketOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmEnd, setConfirmEnd] = useState(false);
  const [wKind, setWKind] = useState<WicketKind | null>(null);
  const [wOut, setWOut] = useState<'striker' | 'nonStriker'>('striker');
  const [wFielder, setWFielder] = useState<string | null>(null);
  const [wRuns, setWRuns] = useState(0);

  const pop = useScorePop(t?.runs ?? 0);

  useEffect(() => {
    setPickerOpen(!!need);
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
    store.score(m.id, { runs: r, extra: extra ?? undefined });
    if (r === 4 || r === 6) haptic.impact();
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
    store.score(m.id, {
      runs: wKind === 'runout' ? wRuns : 0,
      extra: extra ?? undefined,
      wicket: {
        kind: wKind,
        playerOutId: wKind === 'runout' && wOut === 'nonStriker' ? inn.nonStriker! : inn.striker!,
        fielderId: wFielder ?? undefined,
      },
    });
    haptic.warning();
    setExtra(null);
    setWicketOpen(false);
  };

  const batted = battingOrder(inn);
  const eligibleBatters = (m.squads[inn.battingTeamId] ?? []).filter((pid) => !batted.includes(pid));
  const bowlerOvers = (pid: string) => bowl.find((b) => b.id === pid);
  const bowlers = m.squads[inn.bowlingTeamId] ?? [];

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
      contentStyle={{ paddingBottom: 24 }}
    >
      <ScreenHeader
        title={`${m.teams[m.teamAId].short} v ${m.teams[m.teamBId].short}`}
        subtitle={`${m.format === 'Custom' ? `${m.overs} overs` : m.format} · ${inningsNo === 1 ? '1st' : '2nd'} innings`}
        back
        right={<IconButton icon={ClipboardList} label="Full scorecard" onPress={() => router.push(`/match/${m.id}` as any)} />}
      />

      {/* Scoreboard */}
      <LinearGradient colors={[colors.heroA, colors.heroB]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.board}>
        <View style={[styles.ring, { width: 220, height: 220, right: -80, top: -90 }]} />
        <View style={[styles.ring, { width: 120, height: 120, right: -20, top: -30 }]} />
        <AppText variant="label" color={colors.onHeroMuted}>
          {batTeam.name} batting
        </AppText>
        <Animated.View style={[{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }, pop]}>
          <AppText variant="score" color={colors.onHero}>
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
      <Card style={{ marginTop: 16, gap: 4 }}>
        <View style={styles.tableRow}>
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
            <AppText variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1} color={s ? 'text' : 'textFaint'}>
              {s ? name(s.id) : 'Waiting…'}
              {s && strike ? ' *' : ''}
            </AppText>
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
        <View style={[styles.divider, { backgroundColor: colors.border }]} />
        <View style={styles.tableRow}>
          <View style={{ flex: 1 }}>
            <AppText variant="label" color="textFaint">
              Bowler · {bowlTeam.short}
            </AppText>
            <AppText variant="bodyStrong" numberOfLines={1} color={inn.bowler ? 'text' : 'textFaint'}>
              {inn.bowler ? name(inn.bowler) : 'Waiting…'}
            </AppText>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <AppText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>
              {oversText(bowlerStat?.balls ?? 0)}-{bowlerStat?.maidens ?? 0}-{bowlerStat?.runs ?? 0}-{bowlerStat?.wickets ?? 0}
            </AppText>
            <AppText variant="caption" color="textMuted" style={{ fontVariant: ['tabular-nums'] }}>
              Econ {economy(bowlerStat?.runs ?? 0, bowlerStat?.balls ?? 0)}
            </AppText>
          </View>
        </View>
      </Card>

      {/* This over */}
      <View style={{ marginTop: 16, gap: 10 }}>
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
      <Animated.View entering={FadeInDown.duration(300)} style={{ marginTop: 24, gap: 12 }}>
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
            <Button label="Start 2nd innings" variant="accent" onPress={() => store.nextInnings(m.id)} />
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
              onPress={() => setPickerOpen(true)}
            />
            <Button label="Undo last ball" variant="secondary" icon={Undo2} disabled={!inn.balls.length} onPress={() => store.undo(m.id)} />
          </Card>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
              {extrasOptions.map((e) => (
                <Chip key={e.k} label={e.label} selected={extra === e.k} tint={colors.accent} onPress={() => setExtra(extra === e.k ? null : e.k)} />
              ))}
            </View>
            {extra ? (
              <AppText variant="caption" color="accent">
                {hint[extra]}
              </AppText>
            ) : null}
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[0, 1, 2, 3].map((r) => (
                <RunButton key={r} value={r} onPress={() => onRun(r)} />
              ))}
            </View>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {[4, 5, 6].map((r) => (
                <RunButton key={r} value={r} onPress={() => onRun(r)} />
              ))}
              <Tap
                onPress={openWicket}
                accessibilityLabel="Wicket"
                scaleTo={0.92}
                style={{ flex: 1, height: 68, borderRadius: 22, backgroundColor: colors.danger, alignItems: 'center', justifyContent: 'center' }}
              >
                <AppText variant="title" color="onDanger" style={{ fontFamily: fonts.extrabold, fontSize: 24 }}>
                  OUT
                </AppText>
              </Tap>
            </View>
            <View style={{ flexDirection: 'row', gap: 10, marginTop: 4 }}>
              <View style={{ flex: 1 }}>
                <Button label="Undo" variant="secondary" size="sm" icon={Undo2} disabled={!inn.balls.length} onPress={() => store.undo(m.id)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="Swap" variant="secondary" size="sm" icon={ArrowLeftRight} onPress={() => store.swapStrike(m.id)} />
              </View>
              <View style={{ flex: 1 }}>
                <Button label="End innings" variant="ghost" size="sm" icon={Flag} onPress={() => setConfirmEnd(true)} />
              </View>
            </View>
          </>
        )}
      </Animated.View>

      {/* Picker sheet */}
      <Sheet
        visible={pickerOpen && !!need}
        onClose={() => setPickerOpen(false)}
        title={need === 'bowler' ? 'Select bowler' : need === 'striker' ? 'Select striker' : 'Select non-striker'}
        subtitle={
          need === 'bowler'
            ? `${bowlTeam.name} · max ${limit} over${limit === 1 ? '' : 's'} each${inn.lastOverBowler ? ' · last over’s bowler is resting' : ''}`
            : `${batTeam.name} · next in`
        }
      >
        <View style={{ gap: 8 }}>
          {need === 'bowler'
            ? bowlers.map((pid) => {
                const s = bowlerOvers(pid);
                const rested = pid === inn.lastOverBowler;
                const maxed = (s?.balls ?? 0) >= limit * 6;
                return (
                  <PlayerRow
                    key={pid}
                    name={name(pid)}
                    sub={m.players[pid]?.role}
                    color={bowlTeam.color}
                    disabled={rested || maxed}
                    onPress={() => store.setCrease(m.id, { bowler: pid })}
                    trailing={
                      <AppText variant="caption" color="textMuted" style={{ fontVariant: ['tabular-nums'] }}>
                        {rested ? 'Rested' : maxed ? 'Quota done' : s ? `${oversText(s.balls)}-${s.maidens}-${s.runs}-${s.wickets}` : 'Fresh'}
                      </AppText>
                    }
                  />
                );
              })
            : eligibleBatters.map((pid) => (
                <PlayerRow
                  key={pid}
                  name={name(pid)}
                  sub={m.players[pid]?.role}
                  color={batTeam.color}
                  onPress={() => store.setCrease(m.id, need === 'striker' ? { striker: pid } : { nonStriker: pid })}
                />
              ))}
        </View>
      </Sheet>

      {/* Wicket sheet */}
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
              <Chip key={k} label={WICKET_LABEL[k]} selected={wKind === k} tint={colors.danger} onPress={() => setWKind(k)} />
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
                <Chip label={name(inn.striker)} selected={wOut === 'striker'} tint={colors.danger} onPress={() => setWOut('striker')} />
                <Chip label={name(inn.nonStriker)} selected={wOut === 'nonStriker'} tint={colors.danger} onPress={() => setWOut('nonStriker')} />
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
                <Chip key={pid} label={name(pid)} selected={wFielder === pid} onPress={() => setWFielder(wFielder === pid ? null : pid)} />
              ))}
            </View>
          </View>
        ) : null}
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
