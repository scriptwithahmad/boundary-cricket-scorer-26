import React, { useRef, useState } from 'react';
import { Image, ScrollView, StyleSheet, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { FadeIn, FadeInDown, useReducedMotion } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Path, Rect, Stop, Text as SvgText } from 'react-native-svg';
import { ArrowRight, BarChart3, ChevronLeft, ChevronRight, Trophy, Zap } from 'lucide-react-native';
import { AppText, Button, Tap } from './ui';
import { useTheme } from '../theme';

type Slide = {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof Zap;
  art: 'scoring' | 'insights' | 'awards';
};

const slides: Slide[] = [
  {
    eyebrow: 'MADE FOR EVERY OVER',
    title: 'Every ball.\nEvery moment.',
    description: 'Score runs, extras and wickets with a clear, match-ready scoring screen.',
    icon: Zap,
    art: 'scoring',
  },
  {
    eyebrow: 'THE FULL PICTURE',
    title: 'Follow the game\nas it unfolds.',
    description: 'Explore ball-by-ball details, partnerships and run-rate graphs as you play.',
    icon: BarChart3,
    art: 'insights',
  },
  {
    eyebrow: 'A SEASON TO REMEMBER',
    title: 'Celebrate every\nstandout player.',
    description: 'Keep your teams and match history together, with awards for the best performances.',
    icon: Trophy,
    art: 'awards',
  },
];

function ScoringArt() {
  const { colors } = useTheme();
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 270">
      <Defs>
        <SvgGradient id="scoreGlow" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.primary} stopOpacity="0.34" />
          <Stop offset="1" stopColor={colors.primary} stopOpacity="0.02" />
        </SvgGradient>
      </Defs>
      <Circle cx="286" cy="50" r="95" fill="url(#scoreGlow)" />
      <Path d="M248 14a74 74 0 0 1 74 74M267 14a55 55 0 0 1 55 55" fill="none" stroke={colors.onHero} strokeOpacity="0.12" strokeWidth="1.5" />
      <Rect x="35" y="46" width="290" height="178" rx="26" fill={colors.surface} />
      <Rect x="35" y="46" width="290" height="178" rx="26" fill="none" stroke={colors.onHero} strokeOpacity="0.13" />
      <Circle cx="67" cy="80" r="7" fill={colors.primary} />
      <SvgText x="84" y="84" fill={colors.textMuted} fontSize="11" fontWeight="700" letterSpacing="1.4">LIVE INNINGS</SvgText>
      <SvgText x="59" y="151" fill={colors.text} fontSize="52" fontWeight="800">97/2</SvgText>
      <SvgText x="61" y="179" fill={colors.textMuted} fontSize="13">4.0 overs</SvgText>
      <Rect x="225" y="109" width="75" height="70" rx="20" fill={colors.primarySoft} />
      <SvgText x="262" y="138" fill={colors.primary} fontSize="12" fontWeight="700" textAnchor="middle">RUN RATE</SvgText>
      <SvgText x="262" y="162" fill={colors.primary} fontSize="21" fontWeight="800" textAnchor="middle">24.25</SvgText>
      <Circle cx="287" cy="207" r="19" fill={colors.accent} />
      <Path d="M277 197c8 5 12 15 11 22M296 197c-8 5-12 15-11 22" fill="none" stroke={colors.onAccent} strokeOpacity="0.8" strokeWidth="1.5" />
      <Rect x="50" y="194" width="148" height="12" rx="6" fill={colors.surfaceAlt} />
      <Rect x="50" y="194" width="102" height="12" rx="6" fill={colors.primary} />
    </Svg>
  );
}

function InsightsArt() {
  const { colors } = useTheme();
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 270">
      <Defs>
        <SvgGradient id="chartGlow" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.primary} stopOpacity="0.3" />
          <Stop offset="1" stopColor={colors.accent} stopOpacity="0.08" />
        </SvgGradient>
      </Defs>
      <Circle cx="90" cy="45" r="75" fill="url(#chartGlow)" />
      <Rect x="35" y="44" width="290" height="182" rx="24" fill={colors.surface} />
      <Rect x="35" y="44" width="290" height="182" rx="24" fill="none" stroke={colors.onHero} strokeOpacity="0.13" />
      <SvgText x="58" y="76" fill={colors.text} fontSize="13" fontWeight="700">Match momentum</SvgText>
      {[112, 145, 178].map((y) => <Path key={y} d={`M58 ${y}H302`} stroke={colors.border} strokeWidth="1" />)}
      <Path d="M59 165 99 154 137 158 177 126 213 135 252 92 299 78" fill="none" stroke={colors.primary} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {[['59', '165'], ['99', '154'], ['137', '158'], ['177', '126'], ['213', '135'], ['252', '92'], ['299', '78']].map(([cx, cy]) => (
        <Circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="5" fill={colors.primary} stroke={colors.surface} strokeWidth="2" />
      ))}
      <Rect x="82" y="182" width="35" height="27" rx="7" fill={colors.accent} opacity="0.92" />
      <Rect x="135" y="170" width="35" height="39" rx="7" fill={colors.accent} opacity="0.72" />
      <Rect x="188" y="154" width="35" height="55" rx="7" fill={colors.accent} opacity="0.86" />
      <Rect x="241" y="138" width="35" height="71" rx="7" fill={colors.accent} opacity="0.68" />
    </Svg>
  );
}

function AwardsArt() {
  const { colors } = useTheme();
  return (
    <Svg width="100%" height="100%" viewBox="0 0 360 270">
      <Defs>
        <SvgGradient id="awardGlow" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={colors.six} stopOpacity="0.34" />
          <Stop offset="1" stopColor={colors.primary} stopOpacity="0.08" />
        </SvgGradient>
      </Defs>
      <Circle cx="178" cy="132" r="117" fill="url(#awardGlow)" />
      <Path d="m79 61 6 13 14 2-10 10 2 14-12-7-13 7 3-14-10-10 14-2z" fill={colors.six} />
      <Path d="m276 44 4 9 10 1-7 7 2 10-9-5-8 5 2-10-7-7 10-1z" fill={colors.primary} />
      <Rect x="91" y="76" width="178" height="150" rx="28" fill={colors.surface} />
      <Rect x="91" y="76" width="178" height="150" rx="28" fill="none" stroke={colors.onHero} strokeOpacity="0.14" />
      <Circle cx="180" cy="128" r="36" fill={colors.sixSoft} />
      <Path d="M165 112h30v8c0 12-6 20-15 20s-15-8-15-20zm0 5h-9v5c0 8 5 12 12 13m27-18h9v5c0 8-5 12-12 13m-11 8v10m-13 3h26" fill="none" stroke={colors.six} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      <Rect x="132" y="185" width="96" height="10" rx="5" fill={colors.surfaceAlt} />
      <Rect x="150" y="202" width="60" height="7" rx="3.5" fill={colors.primarySoft} />
      <Circle cx="285" cy="175" r="25" fill={colors.primary} />
      <SvgText x="285" y="182" fill={colors.onPrimary} fontSize="17" fontWeight="800" textAnchor="middle">MVP</SvgText>
    </Svg>
  );
}

function SlideArtwork({ type, height }: { type: Slide['art']; height: number }) {
  const { colors } = useTheme();
  const Art = type === 'scoring' ? ScoringArt : type === 'insights' ? InsightsArt : AwardsArt;
  return (
    <View style={[styles.artwork, { height, backgroundColor: colors.heroB }]}>
      <View style={[styles.artGlow, { backgroundColor: colors.primary, opacity: 0.08 }]} />
      <Art />
    </View>
  );
}

export function WelcomeCarousel({
  onComplete,
  onContinueWithoutSaving,
  storageError,
}: {
  onComplete: () => void;
  onContinueWithoutSaving: () => void;
  storageError?: string | null;
}) {
  const { colors } = useTheme();
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();
  const pageWidth = Math.max(272, Math.min(screenWidth, 640) - 48);
  const artworkHeight = Math.min(250, Math.max(175, screenHeight * 0.31));
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<ScrollView>(null);
  const reduceMotion = useReducedMotion();

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(slides.length - 1, index));
    setActiveIndex(next);
    scrollRef.current?.scrollTo({ x: pageWidth * next, animated: !reduceMotion });
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={[styles.safeArea, { backgroundColor: colors.bg }]}>
      <View style={[styles.container, { maxWidth: 640 }]}>
        <View style={styles.topBar}>
          <View style={styles.brand}>
            <Image source={require('../../assets/images/icon.png')} style={styles.brandMark} resizeMode="contain" accessibilityLabel="Boundary logo" />
            <AppText variant="bodyStrong">BOUNDARY</AppText>
          </View>
          <Tap onPress={onComplete} accessibilityLabel="Skip welcome">
            <AppText variant="bodyStrong" color="textMuted">Skip</AppText>
          </Tap>
        </View>

        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          decelerationRate="fast"
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={(event) => {
            const index = Math.round(event.nativeEvent.contentOffset.x / pageWidth);
            setActiveIndex(Math.max(0, Math.min(slides.length - 1, index)));
          }}
          style={{ flex: 1 }}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          {slides.map((slide, index) => {
            const SlideIcon = slide.icon;
            return (
              <View key={slide.art} style={[styles.slide, { width: pageWidth }]}>
                <Animated.View
                  key={`${slide.art}-${activeIndex === index}`}
                  entering={reduceMotion ? FadeIn.duration(150) : FadeInDown.duration(320)}
                  style={styles.slideContent}
                >
                  <SlideArtwork type={slide.art} height={artworkHeight} />
                  <View style={styles.copy}>
                    <View style={[styles.eyebrow, { backgroundColor: colors.primarySoft }]}>
                      <SlideIcon size={13} color={colors.primary} strokeWidth={2.6} />
                      <AppText variant="label" color="primary" style={{ fontSize: 10 }}>{slide.eyebrow}</AppText>
                    </View>
                    <AppText variant="display" style={styles.title}>
                      {slide.title}
                    </AppText>
                    <AppText variant="body" color="textMuted" style={styles.description}>
                      {slide.description}
                    </AppText>
                  </View>
                </Animated.View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.footer}>
          <View style={styles.pagination}>
            {slides.map((slide, index) => (
              <Tap
                key={slide.art}
                accessibilityLabel={`Go to welcome slide ${index + 1}`}
                accessibilityState={{ selected: activeIndex === index }}
                onPress={() => goTo(index)}
                style={[
                  styles.dot,
                  { backgroundColor: activeIndex === index ? colors.primary : colors.border, width: activeIndex === index ? 26 : 7 },
                ]}
              />
            ))}
          </View>
          {storageError ? (
            <View style={{ alignItems: 'center', gap: 8 }}>
              <AppText variant="caption" color="danger" style={{ textAlign: 'center' }}>{storageError}</AppText>
              <Tap onPress={onContinueWithoutSaving}>
                <AppText variant="caption" color="primary">Continue without saving</AppText>
              </Tap>
            </View>
          ) : null}
          <View style={styles.navigation}>
            {activeIndex > 0 ? (
              <Tap
                onPress={() => goTo(activeIndex - 1)}
                accessibilityLabel="Previous slide"
                style={[styles.backButton, { backgroundColor: colors.surfaceAlt }]}
              >
                <ChevronLeft size={20} color={colors.text} />
              </Tap>
            ) : null}
            <View style={{ flex: 1 }}>
              <Button
                label={activeIndex === slides.length - 1 ? 'Get started' : 'Continue'}
                icon={activeIndex === slides.length - 1 ? undefined : ArrowRight}
                variant="primary"
                onPress={() => activeIndex === slides.length - 1 ? onComplete() : goTo(activeIndex + 1)}
              />
            </View>
          </View>
          <AppText variant="caption" color="textFaint" style={{ textAlign: 'center' }}>
            YOUR GAME. YOUR STORY.
          </AppText>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, alignItems: 'center' },
  container: { flex: 1, width: '100%', paddingHorizontal: 24 },
  topBar: { height: 56, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  brand: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  brandMark: { width: 44, height: 44, borderRadius: 10 },
  slide: { flex: 1, justifyContent: 'center', paddingHorizontal: 0 },
  slideContent: { width: '100%', gap: 27, alignItems: 'center' },
  artwork: { width: '100%', height: 265, borderRadius: 30, overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  artGlow: { position: 'absolute', width: 210, height: 210, borderRadius: 105, top: -90, right: -40 },
  copy: { width: '100%', alignItems: 'flex-start', gap: 13 },
  eyebrow: { borderRadius: 999, paddingHorizontal: 11, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 7 },
  title: { fontSize: 34, lineHeight: 39, letterSpacing: -1.1 },
  description: { fontSize: 16, lineHeight: 24, maxWidth: 380 },
  footer: { paddingTop: 16, paddingBottom: 10, gap: 15 },
  pagination: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 7 },
  dot: { height: 7, borderRadius: 4 },
  navigation: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  backButton: { width: 50, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
