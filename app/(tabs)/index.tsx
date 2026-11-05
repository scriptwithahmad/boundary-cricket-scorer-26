import React, { useEffect, useState } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, useRouter } from 'expo-router';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { ArrowLeftRight, ChevronRight, Play, Plus, Settings, Swords, Zap, Flag } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppText, Button, Card, IconButton, Screen, SectionHeader, Tap } from '@/src/components/ui';
import { MatchCard } from '@/src/components/MatchCard';
import { WelcomeCarousel } from '@/src/components/WelcomeCarousel';
import { useStore } from '@/src/store';
import { fonts, useTheme } from '@/src/theme';
import { createTabBarStyle } from '@/src/theme/tabBar';
import { currentInnings, oversText, teamScore, totals } from '@/src/engine/cricket';

const WELCOME_KEY = 'boundary:welcome-complete';

export default function Home() {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const store = useStore();
  const [welcomeStatus, setWelcomeStatus] = useState<'loading' | 'welcome' | 'home'>('loading');
  const [welcomeError, setWelcomeError] = useState<string | null>(null);
  const live = store.matches.find((m) => m.status === 'live');
  const done = store.matches.filter((m) => m.status === 'completed').slice(0, 3);

  useEffect(() => {
    let active = true;
    AsyncStorage.getItem(WELCOME_KEY)
      .then((value) => {
        if (active) setWelcomeStatus(value === 'true' ? 'home' : 'welcome');
      })
      .catch(() => {
        if (active) {
          setWelcomeError('We could not save your welcome preference. It may show again next time.');
          setWelcomeStatus('welcome');
        }
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    navigation.setOptions({
      tabBarStyle: welcomeStatus === 'home'
        ? createTabBarStyle(colors, insets.bottom)
        : { display: 'none' },
    });
  }, [colors, insets.bottom, navigation, welcomeStatus]);

  const finishWelcome = async () => {
    try {
      await AsyncStorage.setItem(WELCOME_KEY, 'true');
      setWelcomeError(null);
      setWelcomeStatus('home');
    } catch {
      setWelcomeError('We could not save your welcome preference. Continue anyway, or try again.');
    }
  };

  if (welcomeStatus === 'loading') {
    return <View style={{ flex: 1, backgroundColor: colors.bg }} />;
  }
  if (welcomeStatus === 'welcome') {
    return (
      <WelcomeCarousel
        onComplete={finishWelcome}
        onContinueWithoutSaving={() => setWelcomeStatus('home')}
        storageError={welcomeError}
      />
    );
  }

  const startMatch = (format: string) => router.push(`/match/new?format=${format}` as any);

  return (
    <Screen>
      <Animated.View entering={FadeInDown.duration(350)} style={styles.top}>
        <Image
          source={require('../../assets/images/icon.png')}
          style={{ width: 52, height: 52, borderRadius: 12, marginRight: 10 }}
          resizeMode="contain"
          accessibilityLabel="Boundary logo"
        />
        <View style={{ flex: 1 }}>
          <AppText variant="label" color="primary">
            Cricket scoring
          </AppText>
          <AppText variant="display">Boundary</AppText>
        </View>
        <IconButton icon={Settings} label="Settings" onPress={() => router.push('/settings' as any)} />
      </Animated.View>

      {/* Hero */}
      <Animated.View entering={FadeInDown.delay(60).duration(400)}>
        <LinearGradient colors={[colors.heroA, colors.heroB]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.hero}>
          <View style={[styles.ring, { width: 260, height: 260, right: -90, top: -90 }]} />
          <View style={[styles.ring, { width: 160, height: 160, right: -40, top: -40 }]} />
          <View style={[styles.ring, { width: 110, height: 110, left: -30, bottom: -50 }]} />
          {live ? (
            (() => {
              const inn = currentInnings(live);
              const t = totals(inn);
              const tm = live.teams[inn.battingTeamId];
              const other = live.teams[inn.bowlingTeamId];
              return (
                <>
                  <View style={styles.heroTag}>
                    <View style={styles.liveDot} />
                    <AppText variant="label" color={colors.onHero}>
                      Live now
                    </AppText>
                  </View>
                  <AppText variant="caption" color={colors.onHeroMuted}>
                    {tm.name} v {other.name}
                  </AppText>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10 }}>
                    <AppText variant="score" color={colors.onHero} style={{ fontSize: 52, lineHeight: 56 }}>
                      {t.runs}/{t.wickets}
                    </AppText>
                    <AppText variant="heading" color={colors.onHeroMuted} style={{ paddingBottom: 6 }}>
                      {oversText(t.legal)}/{live.overs}
                    </AppText>
                  </View>
                  <Tap onPress={() => router.push(`/match/${live.id}/score` as any)} style={styles.heroBtn}>
                    <Play size={18} color="#0A3A22" fill="#0A3A22" />
                    <AppText variant="bodyStrong" color="#0A3A22" style={{ fontFamily: fonts.bold }}>
                      Resume scoring
                    </AppText>
                  </Tap>
                </>
              );
            })()
          ) : (
            <>
              <AppText variant="label" color={colors.onHeroMuted}>
                Ready when you are
              </AppText>
              <AppText variant="title" color={colors.onHero} style={{ fontSize: 27, lineHeight: 33, maxWidth: 260 }}>
                Score every ball, from the nets to the final.
              </AppText>
              <Tap onPress={() => startMatch('T20')} style={styles.heroBtn}>
                <Plus size={18} color="#0A3A22" strokeWidth={3} />
                <AppText variant="bodyStrong" color="#0A3A22" style={{ fontFamily: fonts.bold }}>
                  Start a match
                </AppText>
              </Tap>
            </>
          )}
        </LinearGradient>
      </Animated.View>

      {/* Quick formats */}
      <SectionHeader title="New match" />
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {[
          { f: 'T20', sub: '20 overs', icon: Zap },
          { f: 'ODI', sub: '50 overs', icon: Flag },
          { f: 'Custom', sub: 'Your rules', icon: Swords },
        ].map((x, i) => (
          <Animated.View key={x.f} entering={FadeInDown.delay(120 + i * 60).duration(350)} style={{ flex: 1 }}>
            <Tap onPress={() => startMatch(x.f)} style={[styles.format, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.formatIcon, { backgroundColor: colors.primarySoft }]}>
                <x.icon size={18} color={colors.primary} strokeWidth={2.4} />
              </View>
              <AppText variant="heading">{x.f}</AppText>
              <AppText variant="caption" color="textMuted">
                {x.sub}
              </AppText>
            </Tap>
          </Animated.View>
        ))}
      </View>

      {/* Summary */}
      <View style={{ flexDirection: 'row', gap: 12, marginTop: 12 }}>
        {[
          { v: store.matches.length, l: 'Matches' },
          { v: store.teams.length, l: 'Teams' },
          { v: store.players.length, l: 'Players' },
        ].map((s) => (
          <Card key={s.l} style={{ flex: 1, padding: 14, gap: 2 }}>
            <AppText variant="title" style={{ fontVariant: ['tabular-nums'] }}>
              {s.v}
            </AppText>
            <AppText variant="caption" color="textMuted">
              {s.l}
            </AppText>
          </Card>
        ))}
      </View>

      <SectionHeader
        title="Recent results"
        action={
          done.length ? (
            <Tap onPress={() => router.push('/history' as any)} style={{ flexDirection: 'row', alignItems: 'center' }}>
              <AppText variant="caption" color="primary" style={{ fontFamily: fonts.bold }}>
                See all
              </AppText>
              <ChevronRight size={16} color={colors.primary} />
            </Tap>
          ) : undefined
        }
      />
      {done.length ? (
        <View style={{ gap: 12 }}>
          {done.map((m, i) => (
            <MatchCard key={m.id} match={m} index={i} />
          ))}
        </View>
      ) : (
        <Card style={{ gap: 12 }}>
          <AppText variant="bodyStrong">No finished matches yet</AppText>
          <AppText variant="body" color="textMuted">
            {store.teams.length < 2
              ? 'Create two teams, or load a pair of demo teams to try a full match straight away.'
              : 'Start your first match and the result will land here.'}
          </AppText>
          {store.teams.length < 2 ? (
            <Button label="Load demo teams" variant="soft" icon={Swords} size="sm" full={false} onPress={() => store.seedDemo()} />
          ) : null}
        </Card>
      )}

    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', paddingTop: 16, paddingBottom: 20 },
  hero: { borderRadius: 28, padding: 24, gap: 8, overflow: 'hidden', minHeight: 200, justifyContent: 'center' },
  ring: { position: 'absolute', borderRadius: 999, borderWidth: 1.5, borderColor: 'rgba(255,255,255,0.12)' },
  heroTag: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  liveDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#FF7A7A' },
  heroBtn: {
    marginTop: 12,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    height: 48,
    paddingHorizontal: 22,
    borderRadius: 999,
    backgroundColor: '#E9F8EE',
  },
  format: { borderRadius: 20, borderWidth: 1, padding: 14, gap: 4 },
  formatIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
});
