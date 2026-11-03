import React, { useState } from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Play, Swords, Trash2, Trophy } from 'lucide-react-native';
import { AppText, Badge, Button, Card, ConfirmSheet, EmptyState, Screen, ScreenHeader, Segmented } from '@/src/components/ui';
import { InningsScorecard } from '@/src/components/Scorecard';
import { fmtDate } from '@/src/components/MatchCard';
import { useStore } from '@/src/store';
import { useTheme } from '@/src/theme';

export default function MatchDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { colors } = useTheme();
  const store = useStore();
  const match = store.matches.find((m) => m.id === id);
  const [tab, setTab] = useState('0');
  const [confirm, setConfirm] = useState(false);

  if (!match) {
    return (
      <Screen edges={['top', 'bottom']}>
        <ScreenHeader title="Scorecard" back />
        <EmptyState icon={Swords} title="Match not found" text="This match may have been deleted." />
      </Screen>
    );
  }

  const live = match.status === 'live';
  const A = match.teams[match.teamAId];
  const B = match.teams[match.teamBId];

  return (
    <Screen edges={['top', 'bottom']}>
      <ScreenHeader title={`${A.short} v ${B.short}`} subtitle={`${match.format === 'Custom' ? `${match.overs} overs` : match.format} · ${fmtDate(match.createdAt)}`} back />

      <LinearGradient colors={[colors.heroA, colors.heroB]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 20, gap: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Trophy size={16} color={colors.onHeroMuted} />
          <AppText variant="label" color={colors.onHeroMuted}>
            {live ? 'In progress' : 'Result'}
          </AppText>
        </View>
        <AppText variant="title" color={colors.onHero}>
          {live ? 'Match is live' : match.result?.text}
        </AppText>
        <AppText variant="caption" color={colors.onHeroMuted}>
          {match.teams[match.tossWinnerId].name} won the toss and chose to {match.tossDecision}
        </AppText>
      </LinearGradient>

      {live ? (
        <View style={{ marginTop: 16 }}>
          <Button label="Resume scoring" icon={Play} onPress={() => router.replace(`/match/${match.id}/score` as any)} />
        </View>
      ) : null}

      <View style={{ marginTop: 24, marginBottom: 16 }}>
        <Segmented
          value={tab}
          onChange={setTab}
          options={match.innings.map((inn, i) => ({ label: `${match.teams[inn.battingTeamId].short} innings`, value: String(i) }))}
        />
      </View>
      <InningsScorecard match={match} inningsIndex={Number(tab)} />

      <View style={{ marginTop: 32, alignItems: 'center' }}>
        <Button label="Delete match" variant="ghost" size="sm" icon={Trash2} full={false} onPress={() => setConfirm(true)} />
      </View>
      <ConfirmSheet
        visible={confirm}
        title="Delete this match?"
        message="The scorecard and its contribution to player statistics will be removed."
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          setConfirm(false);
          router.replace('/history' as any);
          store.deleteMatch(match.id);
        }}
      />
    </Screen>
  );
}
