import React from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeftRight, ClipboardList, Flag, MoreVertical, Trophy, Undo2, UserPlus } from 'lucide-react-native';
import { AppText, Button, Card, IconButton, Tap } from '@/src/components/ui';
import { fonts } from '@/src/theme';
import type { useScoringController } from '../hooks/useScoringController';
import { styles } from '../constants';
import { RunButton } from './RunButton';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'id' | 'router' | 'colors' | 'store' | 'compact' | 'inn' | 't' | 'need' | 'extra' | 'setExtra' | 'setConfirmEnd' | 'm' | 'batTeam' | 'bowlTeam' | 'name' | 'openPlayerPicker' | 'live' | 'live1Done' | 'onRun' | 'openWicket' | 'openRare' | 'extrasOptions' | 'hint'>;

export function ScoringControls({ controller }: { controller: Props }) {
  const { id, router, colors, store, compact, inn, t, need, extra, setExtra, setConfirmEnd, m, batTeam, bowlTeam, name, openPlayerPicker, live, live1Done, onRun, openWicket, openRare, extrasOptions, hint } = controller;
  return (<View style={{ marginTop: live && inn.status === 'live' ? 'auto' : 0 }}>
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
  </View>);
}
