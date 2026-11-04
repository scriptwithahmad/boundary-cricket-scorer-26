import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import {
  BarChart3,
  ChevronLeft,
  Handshake,
  ListOrdered,
  LogOut,
} from 'lucide-react-native';
import { ballRuns, totals, WICKET_LABEL } from '../engine/cricket';
import type { Ball, Innings, Match } from '../types';
import { AppText, Card, Segmented, Sheet, Tap } from './ui';
import { useTheme } from '../theme';

type Page = 'menu' | 'analytics' | 'deliveries' | 'partnerships';
type ChartTab = 'cumulative' | 'perOver' | 'rate';
type OverSummary = { over: number; balls: Ball[]; runs: number; legal: number };
type Point = { x: number; y: number };
type Partnership = {
  playerIds: [string, string];
  runs: number;
  legal: number;
  endedByWicket: boolean;
};

const chartWidth = 320;
const chartHeight = 160;
const chartPadding = { left: 8, right: 8, top: 10, bottom: 24 };

function makeOverSummaries(innings: Innings): OverSummary[] {
  const summaries = new Map<number, OverSummary>();
  for (const ball of innings.balls) {
    let summary = summaries.get(ball.over);
    if (!summary) {
      summary = { over: ball.over, balls: [], runs: 0, legal: 0 };
      summaries.set(ball.over, summary);
    }
    summary.balls.push(ball);
    summary.runs += ballRuns(ball);
    if (ball.legal) summary.legal++;
  }
  return [...summaries.values()].sort((a, b) => a.over - b.over);
}

function linePath(data: Point[], maxX: number, maxY: number) {
  const innerWidth = chartWidth - chartPadding.left - chartPadding.right;
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  return data
    .map((point, index) => {
      const x = chartPadding.left + (point.x / maxX) * innerWidth;
      const y = chartPadding.top + innerHeight - (point.y / maxY) * innerHeight;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    })
    .join(' ');
}

function LineChart({ data, color }: { data: Point[]; color: string }) {
  const maxX = Math.max(1, ...data.map((point) => point.x));
  const maxY = Math.max(1, ...data.map((point) => point.y));
  const path = linePath(data, maxX, maxY);
  const innerHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  return (
    <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
      {[0, 0.5, 1].map((fraction) => {
        const y = chartPadding.top + innerHeight * fraction;
        return <Line key={fraction} x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} stroke={color} opacity={0.14} strokeWidth={1} />;
      })}
      {data.length > 1 ? <Path d={path} fill="none" stroke={color} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" /> : null}
      {data.map((point, index) => {
        const x = chartPadding.left + (point.x / maxX) * (chartWidth - chartPadding.left - chartPadding.right);
        const y = chartPadding.top + innerHeight - (point.y / maxY) * innerHeight;
        return <Circle key={`${point.x}-${index}`} cx={x} cy={y} r={3.5} fill={color} />;
      })}
    </Svg>
  );
}

function BarChart({ values, color, muted }: { values: number[]; color: string; muted: string }) {
  const maxValue = Math.max(1, ...values);
  const width = chartWidth / Math.max(1, values.length);
  const baseline = chartHeight - chartPadding.bottom;
  const usableHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  return (
    <Svg width="100%" height={chartHeight} viewBox={`0 0 ${chartWidth} ${chartHeight}`} preserveAspectRatio="none">
      {[0, 0.5, 1].map((fraction) => {
        const y = chartPadding.top + usableHeight * fraction;
        return <Line key={fraction} x1={0} x2={chartWidth} y1={y} y2={y} stroke={muted} opacity={0.16} strokeWidth={1} />;
      })}
      {values.map((value, index) => {
        const barHeight = (value / maxValue) * usableHeight;
        const barWidth = Math.max(2, width * 0.56);
        const x = index * width + (width - barWidth) / 2;
        return (
          <React.Fragment key={index}>
            <Rect
              x={x}
              y={baseline - barHeight}
              width={barWidth}
              height={barHeight}
              rx={Math.min(4, barWidth / 2)}
              fill={color}
              opacity={0.88}
            />
            <SvgText x={x + barWidth / 2} y={Math.max(10, baseline - barHeight - 5)} fill={muted} fontSize={10} fontWeight="600" textAnchor="middle">
              {value}
            </SvgText>
            <SvgText x={index * width + width / 2} y={chartHeight - 4} fill={muted} fontSize={9} textAnchor="middle">
              {overLabel(index + 1)}
            </SvgText>
          </React.Fragment>
        );
      })}
    </Svg>
  );
}

function inningsPoints(innings: Innings, overs: OverSummary[]) {
  const cumulative: Point[] = [];
  const rates: Point[] = [];
  let runs = 0;
  let legal = 0;
  for (const over of overs) {
    runs += over.runs;
    legal += over.legal;
    cumulative.push({ x: over.over + (over.legal ? over.legal / 6 : 1), y: runs });
    rates.push({ x: over.over + 1, y: legal ? (runs / legal) * 6 : 0 });
  }
  return { cumulative, rates, overs };
}

function overLabel(over: number) {
  return `${over} ov`;
}

function ValueStrip({ values }: { values: string[] }) {
  const { colors } = useTheme();
  if (!values.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingRight: 4 }}>
      {values.map((value, index) => (
        <View key={`${index}-${value}`} style={{ backgroundColor: colors.surfaceAlt, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 7 }}>
          <AppText variant="caption" color="text" style={{ fontVariant: ['tabular-nums'] }}>{value}</AppText>
        </View>
      ))}
    </ScrollView>
  );
}

function chartCard(title: string, subtitle: string, chart: React.ReactNode, values: string[]) {
  return (
    <Card style={{ gap: 8 }}>
      <View>
        <AppText variant="bodyStrong">{title}</AppText>
        <AppText variant="caption" color="textMuted">{subtitle}</AppText>
      </View>
      {chart}
      <ValueStrip values={values} />
    </Card>
  );
}

function deliveryDescription(ball: Ball) {
  const runs = ballRuns(ball);
  if (ball.wicket) {
    const extraText = ball.extra ? ` · ${ball.extra === 'wd' ? 'wide' : ball.extra === 'nb' ? 'no ball' : ball.extra === 'b' ? 'bye' : 'leg bye'}` : '';
    return `${WICKET_LABEL[ball.wicket.kind]}${extraText} · ${runs} run${runs === 1 ? '' : 's'}`;
  }
  if (ball.extra === 'wd') return `Wide · ${runs} run${runs === 1 ? '' : 's'}`;
  if (ball.extra === 'nb') return `No ball · ${ball.runs} off the bat · ${runs} total`;
  if (ball.extra === 'b') return `Bye · ${runs} run${runs === 1 ? '' : 's'}`;
  if (ball.extra === 'lb') return `Leg bye · ${runs} run${runs === 1 ? '' : 's'}`;
  return `${runs} run${runs === 1 ? '' : 's'}`;
}

function makePartnerships(innings: Innings): Partnership[] {
  const partnerships: Partnership[] = [];
  let currentKey = '';
  let current: Partnership | undefined;
  for (const ball of innings.balls) {
    const playerIds = [ball.batterId, ball.nonStrikerId].sort() as [string, string];
    const key = playerIds.join(':');
    if (!current || key !== currentKey) {
      currentKey = key;
      current = { playerIds, runs: 0, legal: 0, endedByWicket: false };
      partnerships.push(current);
    }
    current.runs += ballRuns(ball);
    if (ball.legal) current.legal++;
    if (ball.wicket) {
      current.endedByWicket = true;
      current = undefined;
    }
  }
  return partnerships;
}

function MenuOption({
  icon: Icon,
  title,
  description,
  onPress,
  danger = false,
}: {
  icon: typeof BarChart3;
  title: string;
  description: string;
  onPress: () => void;
  danger?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <Tap
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        padding: 14,
        borderRadius: 16,
        backgroundColor: danger ? colors.dangerSoft : colors.surfaceAlt,
      }}
    >
      <View style={{ width: 40, height: 40, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: danger ? colors.danger : colors.surface }}>
        <Icon size={20} color={danger ? colors.onDanger : colors.primary} strokeWidth={2.2} />
      </View>
      <View style={{ flex: 1, gap: 2 }}>
        <AppText variant="bodyStrong" color={danger ? 'danger' : 'text'}>{title}</AppText>
        <AppText variant="caption" color="textMuted">{description}</AppText>
      </View>
    </Tap>
  );
}

export function MatchInsightsSheet({
  match,
  visible,
  onClose,
  onLeaveScoring,
}: {
  match: Match;
  visible: boolean;
  onClose: () => void;
  onLeaveScoring: () => void;
}) {
  const { colors } = useTheme();
  const [page, setPage] = useState<Page>('menu');
  const [inningsIndex, setInningsIndex] = useState(String(Math.max(0, match.innings.length - 1)));
  const [chartTab, setChartTab] = useState<ChartTab>('cumulative');

  useEffect(() => {
    if (visible) setInningsIndex(String(Math.max(0, match.innings.length - 1)));
    else setPage('menu');
  }, [visible, match.innings.length]);

  const innings = match.innings[Number(inningsIndex)];
  const summaries = useMemo(() => (innings ? makeOverSummaries(innings) : []), [innings]);
  const partnershipList = useMemo(() => (innings ? makePartnerships(innings) : []), [innings]);
  const points = useMemo(() => (innings ? inningsPoints(innings, summaries) : null), [innings, summaries]);
  const inningsOptions = match.innings.map((inn, index) => ({
    label: match.teams[inn.battingTeamId]?.short ?? `Innings ${index + 1}`,
    value: String(index),
  }));
  const pageTitle =
    page === 'analytics' ? 'Graphs & Analytics' : page === 'deliveries' ? 'Over details' : page === 'partnerships' ? 'Batting partnerships' : 'Match insights';

  const selectPage = (nextPage: Page) => setPage(nextPage);
  const returnToMenu = () => setPage('menu');
  const chartOptions: { label: string; value: ChartTab }[] = [
    { label: 'Cumulative', value: 'cumulative' },
    { label: 'Runs / over', value: 'perOver' },
    { label: 'Run rate', value: 'rate' },
  ];

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={pageTitle}
      subtitle={page === 'menu' ? 'Match options' : 'Choose an innings to review'}
    >
      {page === 'menu' ? (
        <View style={{ gap: 10 }}>
          <MenuOption
            icon={BarChart3}
            title="Graphs & Analytics"
            description="Runs, overs and run-rate graphs"
            onPress={() => selectPage('analytics')}
          />
          <MenuOption
            icon={ListOrdered}
            title="Ball-by-ball over details"
            description="Review every delivery and over total"
            onPress={() => selectPage('deliveries')}
          />
          <MenuOption
            icon={Handshake}
            title="Batter partnerships"
            description="Runs and balls for each pair"
            onPress={() => selectPage('partnerships')}
          />
          <View style={{ height: 1, backgroundColor: colors.border, marginVertical: 4 }} />
          <MenuOption
            icon={LogOut}
            title="Leave scoring"
            description={match.status === 'live' ? 'Return to match details; match stays live' : 'Return to match details'}
            onPress={onLeaveScoring}
            danger
          />
        </View>
      ) : (
        <View style={{ gap: 14 }}>
          <Tap
            onPress={returnToMenu}
            accessibilityLabel="Back to match options"
            style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-start', gap: 4, paddingVertical: 2 }}
          >
            <ChevronLeft size={17} color={colors.primary} />
            <AppText variant="caption" color="primary">Match options</AppText>
          </Tap>
          {inningsOptions.length > 1 ? (
            <Segmented options={inningsOptions} value={inningsIndex} onChange={setInningsIndex} />
          ) : null}
          {!innings || !points ? (
            <AppText variant="caption" color="textMuted">No innings data available yet.</AppText>
          ) : page === 'analytics' ? (
            <View style={{ gap: 12 }}>
              {(() => {
                const summary = totals(innings);
                const rate = summary.legal ? ((summary.runs / summary.legal) * 6).toFixed(2) : '0.00';
                return (
                  <View style={{ flexDirection: 'row', gap: 8 }}>
                    {[
                      { label: 'Runs', value: String(summary.runs) },
                      { label: 'Wickets', value: String(summary.wickets) },
                      { label: 'Overs', value: `${Math.floor(summary.legal / 6)}.${summary.legal % 6}` },
                      { label: 'Run rate', value: rate },
                    ].map((item) => (
                      <Card key={item.label} style={{ flex: 1, padding: 10, gap: 3 }}>
                        <AppText variant="label" color="textFaint">{item.label}</AppText>
                        <AppText variant="heading" style={{ fontVariant: ['tabular-nums'] }}>{item.value}</AppText>
                      </Card>
                    ))}
                  </View>
                );
              })()}
              <Segmented options={chartOptions} value={chartTab} onChange={setChartTab} />
              {chartTab === 'cumulative'
                ? chartCard(
                    'Cumulative runs',
                    'Total runs by over',
                    points.cumulative.length
                      ? <LineChart data={points.cumulative} color={colors.primary} />
                      : <AppText variant="caption" color="textMuted">Score some deliveries to see this chart.</AppText>,
                    points.cumulative.map((point, index) => `${overLabel(index + 1)} · ${point.y} runs`),
                  )
                : chartTab === 'perOver'
                  ? chartCard(
                      'Runs per over',
                      'Runs scored in each over',
                      points.overs.length
                        ? <BarChart values={points.overs.map((over) => over.runs)} color={colors.accent} muted={colors.textMuted} />
                        : <AppText variant="caption" color="textMuted">Score some deliveries to see this chart.</AppText>,
                      points.overs.map((over) => `${overLabel(over.over + 1)} · ${over.runs} runs`),
                    )
                  : chartCard(
                      'Run rate',
                      'Cumulative runs per six legal balls',
                      points.rates.length
                        ? <LineChart data={points.rates} color={colors.six} />
                        : <AppText variant="caption" color="textMuted">Score some deliveries to see this chart.</AppText>,
                      points.rates.map((point) => `${overLabel(point.x)} · ${point.y.toFixed(2)} RR`),
                    )}
            </View>
          ) : page === 'deliveries' ? (
            summaries.length ? (
              <View style={{ gap: 10 }}>
                {summaries.map((over) => {
                  let legalBall = 0;
                  let extrasAtBall: Record<number, number> = {};
                  return (
                    <Card key={over.over} style={{ gap: 8 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <AppText variant="bodyStrong">Over {over.over + 1}</AppText>
                        <AppText variant="caption" color="textMuted">{over.runs} runs · {over.legal} legal balls</AppText>
                      </View>
                      {over.balls.map((ball) => {
                        let label: string;
                        if (ball.legal) {
                          legalBall++;
                          label = `${over.over + 1}.${legalBall}`;
                        } else {
                          const extraIndex = extrasAtBall[legalBall] ?? 0;
                          extrasAtBall[legalBall] = extraIndex + 1;
                          label = `${over.over + 1}.${legalBall + 1}${String.fromCharCode(97 + extraIndex)}`;
                        }
                        return (
                          <View key={ball.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 5, borderTopWidth: 1, borderTopColor: colors.border }}>
                            <AppText variant="caption" color="textMuted" style={{ width: 34, fontVariant: ['tabular-nums'] }}>{label}</AppText>
                            <View style={{ flex: 1 }}>
                              <AppText variant="bodyStrong">{deliveryDescription(ball)}</AppText>
                              <AppText variant="caption" color="textMuted" numberOfLines={1}>
                                {match.players[ball.batterId]?.name ?? 'Batter'} · {match.players[ball.bowlerId]?.name ?? 'Bowler'}
                              </AppText>
                            </View>
                          </View>
                        );
                      })}
                    </Card>
                  );
                })}
              </View>
            ) : <AppText variant="caption" color="textMuted">No deliveries recorded in this innings yet.</AppText>
          ) : partnershipList.length ? (
            <View style={{ gap: 10 }}>
              {partnershipList.map((partnership, index) => {
                const isLatest = index === partnershipList.length - 1;
                const status = partnership.endedByWicket
                  ? 'Wicket fell'
                  : isLatest && innings.status === 'live'
                    ? 'Current partnership'
                    : 'Not out';
                return (
                  <Card
                    key={`${partnership.playerIds.join('-')}-${index}`}
                    style={{
                      gap: 8,
                      backgroundColor: isLatest && innings.status === 'live' ? colors.primarySoft : colors.surfaceAlt,
                      borderWidth: 1,
                      borderColor: isLatest && innings.status === 'live' ? colors.primary : colors.border,
                    }}
                  >
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
                      <AppText variant="bodyStrong" style={{ flex: 1 }} numberOfLines={2}>
                        {match.players[partnership.playerIds[0]]?.name ?? 'Batter'} & {match.players[partnership.playerIds[1]]?.name ?? 'Batter'}
                      </AppText>
                      <AppText variant="title" color="primary" style={{ fontVariant: ['tabular-nums'] }}>{partnership.runs}</AppText>
                    </View>
                    <AppText variant="caption" color="textMuted">
                      {partnership.legal} legal balls · {status}
                    </AppText>
                  </Card>
                );
              })}
            </View>
          ) : <AppText variant="caption" color="textMuted">Partnership details appear after a delivery is scored.</AppText>}
        </View>
      )}
    </Sheet>
  );
}
