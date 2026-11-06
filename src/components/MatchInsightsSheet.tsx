import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import Svg, { Circle, Line, Path, Rect, Text as SvgText } from 'react-native-svg';
import {
  BarChart3,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  Check,
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
  batterRuns: Record<string, number>;
  extras: number;
  runs: number;
  legal: number;
  endedByWicket: boolean;
};

const chartWidth = 320;
const chartHeight = 190;
const chartPadding = { left: 32, right: 14, top: 12, bottom: 26 };

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

type Series = { id: string; name: string; color: string; data: Point[] };
function Chart({ series, bars = false }: { series: Series[]; bars?: boolean }) {
  const data = series.flatMap((team) => team.data);
  const { colors } = useTheme();
  const maxX = Math.max(1, ...data.map((point) => point.x));
  const peak = Math.max(1, ...data.map((point) => point.y));
  const step = Math.max(1, Math.ceil(peak / 4));
  const maxY = step * 4;
  const plotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const plotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const baseline = chartHeight - chartPadding.bottom;
  const xAt = (x: number) => chartPadding.left + ((bars ? x - 0.5 : x) / maxX) * plotWidth;
  const yAt = (y: number) => baseline - (y / maxY) * plotHeight;
  const tickStep = Math.max(1, Math.ceil(maxX / 5));
  const ticks = Array.from({ length: Math.floor(maxX / tickStep) + 1 }, (_, index) => index * tickStep);
  return (
    <View accessible accessibilityLabel={bars ? 'Runs scored in each over. Expand over details for exact values.' : 'Innings trend by over. Expand over details for exact values.'} style={{ gap: 4, flexShrink: 0 }}>
      <View style={{ width: '100%', aspectRatio: chartWidth / chartHeight }}>
      <Svg width="100%" height="100%" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
        {[0, 1, 2, 3, 4].map((tick) => {
          const value = tick * step;
          const y = yAt(value);
          return <React.Fragment key={tick}>
            <Line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={y} y2={y} stroke={colors.border} strokeWidth={1} />
            <SvgText x={chartPadding.left - 8} y={y + 4} fill={colors.textMuted} fontSize={10} textAnchor="end">{value}</SvgText>
          </React.Fragment>;
        })}
        {series.map((team, teamIndex) => <React.Fragment key={team.id}>
          {!bars && team.data.length > 1 ? <Path d={linePath(team.data, maxX, maxY)} fill="none" stroke={team.color} strokeWidth={3} strokeDasharray={teamIndex === 1 ? '7 4' : undefined} /> : null}
          {team.data.map((point, index) => {
            const width = Math.min(18, plotWidth / maxX * 0.7 / Math.max(1, series.length));
            const x = xAt(point.x) + (bars ? (teamIndex - (series.length - 1) / 2) * (width + 2) : 0);
            return bars ? <Rect key={index} x={x-width/2} y={yAt(point.y)} width={width} height={baseline-yAt(point.y)} rx={2} fill={team.color} /> : <Circle key={index} cx={x} cy={yAt(point.y)} r={3} fill={team.color} />;
          })}
        </React.Fragment>)}
        {ticks.filter((tick) => !bars || tick > 0).map((tick) => <SvgText key={tick} x={xAt(tick)} y={baseline+18} fill={colors.textMuted} fontSize={11} textAnchor="middle">{formatOvers(tick)}</SvgText>)}
      </Svg>
      </View>
      <AppText variant="caption" color="textMuted" style={{ textAlign: 'center', fontSize: 11 }}>Overs played</AppText>
    </View>
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
    rates.push({ x: over.over + (over.legal ? over.legal / 6 : 0), y: legal ? (runs / legal) * 6 : 0 });
  }
  return { cumulative, rates, overs };
}

function overLabel(over: number) {
  return `${formatOvers(over)} ov`;
}

function formatOvers(over: number) {
  const balls = Math.round(over * 6);
  return balls % 6 ? `${Math.floor(balls / 6)}.${balls % 6}` : String(balls / 6);
}

function ValueStrip({ values }: { values: string[] }) {
  const { colors } = useTheme();
  if (!values.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {values.map((value, index) => (
        <View key={`${index}-${value}`} style={{ backgroundColor: colors.surface, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 }}>
          <AppText variant="caption" color="text" style={{ fontVariant: ['tabular-nums'] }}>{value}</AppText>
        </View>
      ))}
    </View>
  );
}

function ComparisonAnalytics({ match }: { match: Match }) {
  const { colors } = useTheme();
  const [tab, setTab] = useState<ChartTab>('cumulative');
  const [hidden, setHidden] = useState<string[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const teams = Object.entries(match.teams).map(([id, team], index) => {
    const innings = match.innings.find((inn) => inn.battingTeamId === id);
    const overs = innings ? makeOverSummaries(innings) : [];
    const points = innings ? inningsPoints(innings, overs) : null;
    return { id, name: team.short, color: index === 0 ? colors.primary : colors.six, innings,
      data: !points ? [] : tab === 'cumulative' ? points.cumulative : tab === 'rate' ? points.rates : overs.map((over) => ({ x: over.over + 1, y: over.runs })) };
  });
  const selected = teams.filter((team) => !hidden.includes(team.id));
  const hasData = selected.some((team) => team.data.length);
  return <View style={{ gap: 14 }}>
    <AppText variant="caption" color="textMuted">Compare both teams. Uncheck a team to hide its graph.</AppText>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {teams.map((team) => {
        const checked = !hidden.includes(team.id);
        const summary = team.innings ? totals(team.innings) : null;
        return <Tap key={team.id} accessibilityRole="checkbox" accessibilityState={{ checked }} accessibilityLabel={team.name} onPress={() => setHidden((ids) => checked ? [...ids, team.id] : ids.filter((id) => id !== team.id))} style={{ flexGrow: 1, flexBasis: 140, padding: 12, borderRadius: 14, borderWidth: 1, borderColor: checked ? team.color : colors.border, backgroundColor: colors.surfaceAlt, gap: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ width: 22, height: 22, borderRadius: 6, borderWidth: 1, borderColor: checked ? team.color : colors.textMuted, backgroundColor: checked ? team.color : colors.surface, alignItems: 'center', justifyContent: 'center' }}>{checked ? <Check size={15} color={colors.bg} /> : null}</View>
            <AppText variant="bodyStrong" style={{ flex: 1 }} color={team.color}>{team.name}</AppText>
          </View>
          <AppText variant="caption" color="textMuted">{summary ? summary.runs + '/' + summary.wickets + ' \u00b7 ' + formatOvers(summary.legal / 6) + ' overs' : 'Yet to bat'}</AppText>
        </Tap>;
      })}
    </View>
    <Segmented options={[{ label: 'Total runs', value: 'cumulative' }, { label: 'Each over', value: 'perOver' }, { label: 'Run rate', value: 'rate' }]} value={tab} onChange={setTab} />
    <Card style={{ gap: 12, padding: 14, borderRadius: 20, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surfaceAlt, shadowOpacity: 0, elevation: 0, flexShrink: 0 }}>
      <View style={{ gap: 4 }}>
        <AppText variant="bodyStrong">{tab === 'cumulative' ? 'Cumulative runs' : tab === 'perOver' ? 'Runs in each over' : 'Run rate comparison'}</AppText>
        <AppText variant="caption" color="textMuted">{tab === 'cumulative' ? 'Total score at the end of each over.' : tab === 'perOver' ? 'Compare runs added in each over, side by side.' : 'Average runs per six legal balls at each stage.'}</AppText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>{selected.map((team,index) => <View key={team.id} style={{ flexGrow: 1, flexBasis: 110, padding: 10, borderRadius: 12, backgroundColor: colors.surface, gap: 4 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={{ width: 18, borderTopWidth: 3, borderColor: team.color, borderStyle: index === 1 && tab !== 'perOver' ? 'dashed' : 'solid' }} /><AppText variant="caption" color="textMuted">{team.name}</AppText></View>
        <AppText variant="heading" color={team.color} style={{ fontVariant: ['tabular-nums'] }}>{team.data.length ? (tab === 'rate' ? team.data[team.data.length - 1].y.toFixed(2) : team.data[team.data.length - 1].y) : '—'}<AppText variant="caption" color="textMuted">{tab === 'rate' ? ' RR' : tab === 'perOver' ? ' last over' : ' runs'}</AppText></AppText>
      </View>)}</View>
      {hasData ? <AppText variant="label" color="textMuted" style={{ fontSize: 10 }}>{tab === 'rate' ? 'Runs per over' : 'Runs'}</AppText> : null}
      {hasData ? <Chart series={selected} bars={tab === 'perOver'} /> : <AppText variant="caption" color="textMuted">{selected.length ? 'No deliveries yet for the selected teams.' : 'Check a team above to show its graph.'}</AppText>}
      {selected.filter((team) => !team.data.length).map((team) => <AppText key={team.id} variant="caption" color="textMuted">{team.name}: yet to bat. Its graph appears after scoring begins.</AppText>)}
      {hasData ? <View style={{ borderTopWidth: 1, borderTopColor: colors.border, paddingTop: 4 }}>
        <Tap
          onPress={() => setShowDetails((value) => !value)}
          accessibilityLabel={showDetails ? 'Hide over details' : 'Show over details'}
          accessibilityState={{ expanded: showDetails }}
          style={{ minHeight: 44, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}
        >
          <AppText variant="caption" color="primary">Over details</AppText>
          {showDetails ? <ChevronUp size={18} color={colors.primary} /> : <ChevronDown size={18} color={colors.primary} />}
        </Tap>
        {showDetails ? <View style={{ gap: 12 }}>{selected.filter((team) => team.data.length).map((team) => <View key={team.id} style={{ gap: 6 }}><AppText variant="bodyStrong" color={team.color}>{team.name}</AppText><ValueStrip values={team.data.map((point) => overLabel(point.x) + ' \u00b7 ' + (tab === 'rate' ? point.y.toFixed(2) + ' RR' : point.y + ' runs'))} /></View>)}</View> : null}
      </View> : null}
    </Card>
  </View>;
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
      current = { playerIds, batterRuns: {}, extras: 0, runs: 0, legal: 0, endedByWicket: false };
      partnerships.push(current);
    }
    current.runs += ballRuns(ball);
    current.batterRuns[ball.batterId] = (current.batterRuns[ball.batterId] ?? 0) + ball.runs;
    current.extras += ballRuns(ball) - ball.runs;
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
  const { colors, isDark } = useTheme();
  const [page, setPage] = useState<Page>('menu');
  const [inningsIndex, setInningsIndex] = useState(String(Math.max(0, match.innings.length - 1)));

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

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title={pageTitle}
      subtitle={page === 'menu' ? 'Match options' : page === 'analytics' ? 'Both teams, one view' : page === 'partnerships' ? 'Every stand, at a glance' : 'Choose an innings to review'}
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
          {page !== 'analytics' && inningsOptions.length > 1 ? (
            <Segmented options={inningsOptions} value={inningsIndex} onChange={setInningsIndex} />
          ) : null}
          {page === 'analytics' ? (
            <ComparisonAnalytics key={match.id} match={match} />
          ) : !innings || !points ? (
            <AppText variant="caption" color="textMuted">No innings data available yet.</AppText>
          ) : page === 'deliveries' ? (
            summaries.length ? (
              <View style={{ gap: 10 }}>
                {summaries.map((over) => {
                  let legalBall = 0;
                  let extrasAtBall: Record<number, number> = {};
                  return (
                    <Card key={over.over} style={{ gap: 8, backgroundColor: colors.surfaceAlt, borderRadius: 20, shadowOpacity: 0, elevation: 0 }}>
                      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                        <AppText variant="bodyStrong">Over {over.over + 1}</AppText>
                        <AppText variant="caption" color="textMuted">{over.runs} runs · {over.legal} legal balls</AppText>
                      </View>
                      {over.balls.map((ball) => {
                        let label: string;
                        if (ball.noDelivery) {
                          label = '—';
                        } else if (ball.legal) {
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
                                {ball.noDelivery ? `${match.players[ball.wicket?.playerOutId ?? '']?.name ?? 'Batter'} · between deliveries` : `${match.players[ball.batterId]?.name ?? 'Batter'} · ${match.players[ball.bowlerId]?.name ?? 'Bowler'}`}
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
              {partnershipList.map((partnership, index) => ({ partnership, index })).reverse().map(({ partnership, index }) => {
                const isLatest = index === partnershipList.length - 1;
                const isCurrent = isLatest && innings.status === 'live' && !partnership.endedByWicket;
                const batterColors = isDark ? ['#76D8C3', '#F5B82E'] : ['#167568', '#996500'];
                const extrasColor = isDark ? '#539FFF' : '#2465CB';
                const status = partnership.endedByWicket
                  ? 'Wicket fell'
                  : isLatest && innings.status === 'live'
                    ? 'At the crease'
                    : 'Not out';
                return (
                  <Card key={partnership.playerIds.join('-') + '-' + index} style={{ gap: 16, padding: isCurrent ? 15 : 16, borderRadius: 20, backgroundColor: colors.surfaceAlt, borderWidth: isCurrent ? 2 : 1, borderColor: isCurrent ? batterColors[0] : colors.border, shadowOpacity: 0, elevation: 0 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                      <View style={{ gap: 5 }}>
                        <AppText variant="label" color="textMuted" style={{ fontSize: 10 }}>Partnership {index + 1}</AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
                          {isCurrent ? <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: batterColors[0] }} /> : null}
                          <AppText variant="caption" color={isCurrent ? batterColors[0] : 'textMuted'} style={{ fontSize: 11 }}>{isCurrent ? 'Batting now' : status}</AppText>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 5 }}>
                        <AppText variant="title" style={{ fontSize: 28, lineHeight: 34, fontVariant: ['tabular-nums'] }}>{partnership.runs}</AppText>
                        <AppText variant="caption" color="textMuted">runs</AppText>
                      </View>
                    </View>
                    <View style={{ height: 1, backgroundColor: colors.border }} />
                    <View style={{ flexDirection: 'row', gap: 16 }}>
                      {partnership.playerIds.map((id, playerIndex) => <View key={id + playerIndex} style={{ flex: 1, gap: 6, alignItems: playerIndex === 0 ? 'flex-start' : 'flex-end' }}>
                        <AppText variant="caption" style={{ textAlign: playerIndex === 0 ? 'left' : 'right' }}>{match.players[id]?.name ?? 'Batter'}</AppText>
                        <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 4 }}>
                          <AppText variant="title" color={batterColors[playerIndex]} style={{ fontVariant: ['tabular-nums'] }}>{partnership.batterRuns[id] ?? 0}</AppText>
                          <AppText variant="caption" color="textMuted" style={{ fontSize: 11 }}>runs</AppText>
                        </View>
                      </View>)}
                    </View>
                    <View accessible accessibilityLabel={partnership.playerIds.map((id) => (match.players[id]?.name ?? 'Batter') + ': ' + (partnership.batterRuns[id] ?? 0) + ' runs').join('; ') + '; Extras: ' + partnership.extras} style={{ height: 6, borderRadius: 3, backgroundColor: colors.border, flexDirection: 'row', overflow: 'hidden' }}>
                      {[
                        { runs: partnership.batterRuns[partnership.playerIds[0]] ?? 0, color: batterColors[0] },
                        { runs: partnership.extras, color: extrasColor },
                        { runs: partnership.batterRuns[partnership.playerIds[1]] ?? 0, color: batterColors[1] },
                      ].map((item, itemIndex) => item.runs > 0 ? <View key={itemIndex} style={{ height: 6, flex: item.runs, backgroundColor: item.color }} /> : null)}
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <AppText variant="caption" color="textMuted" style={{ fontSize: 11 }}>{partnership.legal} legal {partnership.legal === 1 ? 'ball' : 'balls'}</AppText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: extrasColor }} /><AppText variant="caption" color={extrasColor} style={{ fontSize: 11 }}>{partnership.extras} extras</AppText></View>
                      <AppText variant="caption" color="textMuted" style={{ fontSize: 11, fontVariant: ['tabular-nums'] }}>RR {partnership.legal ? ((partnership.runs / partnership.legal) * 6).toFixed(2) : '0.00'}</AppText>
                    </View>
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
