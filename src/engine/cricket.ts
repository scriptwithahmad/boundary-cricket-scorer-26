import type {
  Ball,
  ExtraType,
  Innings,
  Match,
  NewMatchConfig,
  Player,
  Team,
  Wicket,
  WicketKind,
  PlayerSnap,
} from '../types';

export const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

export const oversText = (legalBalls: number) => `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;

/* ---------- per-ball helpers ---------- */
export const ballRuns = (b: Ball) => b.runs + b.extraRuns;
export const bowlerCreditedWicket = (kind: WicketKind) =>
  ['bowled', 'caught', 'lbw', 'stumped', 'hitwicket'].includes(kind);

/** Runs the batters physically ran (drives strike rotation). */
export const runsRan = (b: Ball) => {
  if (b.extra === 'wd') return Math.max(0, b.extraRuns - 1);
  if (b.extra === 'b' || b.extra === 'lb') return b.extraRuns;
  return b.runs;
};

/** Runs charged to the bowler. */
export const bowlerRuns = (b: Ball) => {
  if (b.extra === 'b' || b.extra === 'lb') return 0;
  return b.runs + (b.extra === 'wd' || b.extra === 'nb' ? b.extraRuns : 0);
};

/* ---------- innings aggregates ---------- */
export function totals(inn: Innings) {
  let runs = 0;
  let wickets = 0;
  let legal = 0;
  const extras = { wd: 0, nb: 0, b: 0, lb: 0 };
  for (const b of inn.balls) {
    runs += ballRuns(b);
    if (b.legal) legal++;
    if (b.wicket) wickets++;
    if (b.extra) extras[b.extra] += b.extraRuns;
  }
  return { runs, wickets, legal, extras, extrasTotal: extras.wd + extras.nb + extras.b + extras.lb };
}

export const maxWickets = (m: Match, inn: Innings) => Math.max(1, (m.squads[inn.battingTeamId]?.length ?? 2) - 1);
export const bowlerOverLimit = (m: Match) => Math.max(1, Math.min(m.overs, m.bowlerOversLimit ?? Math.ceil(m.overs / 5)));

export function battingOrder(inn: Innings): string[] {
  const order: string[] = [];
  const add = (id: string | null) => {
    if (id && !order.includes(id)) order.push(id);
  };
  for (const b of inn.balls) {
    add(b.batterId);
    add(b.nonStrikerId);
    if (b.wicket) add(b.wicket.playerOutId);
  }
  add(inn.striker);
  add(inn.nonStriker);
  return order;
}

export interface BatStat {
  id: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out: (Wicket & { bowlerId: string }) | null;
}

export function battingCard(inn: Innings): BatStat[] {
  const map = new Map<string, BatStat>();
  for (const id of battingOrder(inn)) map.set(id, { id, runs: 0, balls: 0, fours: 0, sixes: 0, out: null });
  for (const b of inn.balls) {
    const s = map.get(b.batterId)!;
    if (!b.noDelivery && b.extra !== 'wd') s.balls++;
    s.runs += b.runs;
    if (b.runs === 4) s.fours++;
    if (b.runs === 6) s.sixes++;
    if (b.wicket) {
      const o = map.get(b.wicket.playerOutId);
      if (o) o.out = { ...b.wicket, bowlerId: b.bowlerId };
    }
  }
  return Array.from(map.values());
}

export interface BowlStat {
  id: string;
  balls: number;
  runs: number;
  wickets: number;
  maidens: number;
  wides: number;
  noBalls: number;
}

export function bowlingCard(inn: Innings): BowlStat[] {
  const map = new Map<string, BowlStat>();
  const overs = new Map<number, { bowler: string; legal: number; runs: number }>();
  for (const b of inn.balls) {
    if (b.noDelivery) continue;
    let s = map.get(b.bowlerId);
    if (!s) {
      s = { id: b.bowlerId, balls: 0, runs: 0, wickets: 0, maidens: 0, wides: 0, noBalls: 0 };
      map.set(b.bowlerId, s);
    }
    if (b.legal) s.balls++;
    s.runs += bowlerRuns(b);
    if (b.extra === 'wd') s.wides += 1;
    if (b.extra === 'nb') s.noBalls += 1;
    if (b.wicket && bowlerCreditedWicket(b.wicket.kind)) s.wickets++;
    const o = overs.get(b.over) ?? { bowler: b.bowlerId, legal: 0, runs: 0 };
    if (b.legal) o.legal++;
    o.runs += bowlerRuns(b);
    overs.set(b.over, o);
  }
  overs.forEach((o) => {
    if (o.legal === 6 && o.runs === 0) map.get(o.bowler)!.maidens++;
  });
  return Array.from(map.values());
}

export interface TeamMatchAwards {
  teamId: string;
  batsmanId: string | null;
  batsmanRuns: number;
  bowlerId: string | null;
  bowlerWickets: number;
  bowlerRuns: number;
  fielderId: string | null;
  fieldingDismissals: number;
}

export interface MatchAwards {
  playerOfMatchId: string | null;
  teams: Record<string, TeamMatchAwards>;
}

interface MatchPerformance {
  runs: number;
  batBalls: number;
  fours: number;
  sixes: number;
  wickets: number;
  bowlRuns: number;
  bowlBalls: number;
  fieldingDismissals: number;
}

export function matchAwards(m: Match): MatchAwards {
  const performance = new Map<string, MatchPerformance>();
  const get = (id: string) => {
    let stats = performance.get(id);
    if (!stats) {
      stats = { runs: 0, batBalls: 0, fours: 0, sixes: 0, wickets: 0, bowlRuns: 0, bowlBalls: 0, fieldingDismissals: 0 };
      performance.set(id, stats);
    }
    return stats;
  };

  for (const inn of m.innings) {
    for (const batter of battingCard(inn)) {
      const stats = get(batter.id);
      stats.runs += batter.runs;
      stats.batBalls += batter.balls;
      stats.fours += batter.fours;
      stats.sixes += batter.sixes;
    }
    for (const bowler of bowlingCard(inn)) {
      const stats = get(bowler.id);
      stats.wickets += bowler.wickets;
      stats.bowlRuns += bowler.runs;
      stats.bowlBalls += bowler.balls;
    }
    for (const ball of inn.balls) {
      if (
        ball.wicket?.fielderId &&
        ['caught', 'runout', 'stumped'].includes(ball.wicket.kind) &&
        m.squads[inn.bowlingTeamId]?.includes(ball.wicket.fielderId)
      ) {
        get(ball.wicket.fielderId).fieldingDismissals++;
      }
    }
  }

  const teamIds = [m.teamAId, m.teamBId];
  const teams: Record<string, TeamMatchAwards> = {};
  const candidates = teamIds.flatMap((teamId) => m.squads[teamId] ?? []);
  const battingCompare = (a: string, b: string) => {
    const first = get(a);
    const second = get(b);
    return second.runs - first.runs || second.fours - first.fours || second.sixes - first.sixes || first.batBalls - second.batBalls;
  };
  const bowlingCompare = (a: string, b: string) => {
    const first = get(a);
    const second = get(b);
    return second.wickets - first.wickets || first.bowlRuns - second.bowlRuns || second.bowlBalls - first.bowlBalls;
  };

  for (const teamId of teamIds) {
    const teamPlayers = m.squads[teamId] ?? [];
    const batters = teamPlayers.filter((id) => get(id).batBalls > 0).sort(battingCompare);
    const bowlers = teamPlayers.filter((id) => get(id).bowlBalls > 0).sort(bowlingCompare);
    const fielders = teamPlayers
      .filter((id) => get(id).fieldingDismissals > 0)
      .sort((a, b) => get(b).fieldingDismissals - get(a).fieldingDismissals);
    const bestBatter = batters[0] ?? null;
    const bestBowler = bowlers[0] ?? null;
    const bestFielder = fielders[0] ?? null;
    teams[teamId] = {
      teamId,
      batsmanId: bestBatter,
      batsmanRuns: bestBatter ? get(bestBatter).runs : 0,
      bowlerId: bestBowler,
      bowlerWickets: bestBowler ? get(bestBowler).wickets : 0,
      bowlerRuns: bestBowler ? get(bestBowler).bowlRuns : 0,
      fielderId: bestFielder,
      fieldingDismissals: bestFielder ? get(bestFielder).fieldingDismissals : 0,
    };
  }

  const activeCandidates = candidates.filter((id) => {
    const stats = get(id);
    return stats.runs > 0 || stats.wickets > 0 || stats.fieldingDismissals > 0 || stats.batBalls > 0 || stats.bowlBalls > 0;
  });
  const playerCandidates = activeCandidates.length ? activeCandidates : candidates;
  const playerOfMatchId =
    playerCandidates.sort((a, b) => {
      const first = get(a);
      const second = get(b);
      const firstImpact = first.runs + first.wickets * 20 + first.fieldingDismissals * 10;
      const secondImpact = second.runs + second.wickets * 20 + second.fieldingDismissals * 10;
      return (
        secondImpact - firstImpact ||
        second.runs - first.runs ||
        second.wickets - first.wickets ||
        second.fieldingDismissals - first.fieldingDismissals ||
        first.bowlRuns - second.bowlRuns
      );
    })[0] ?? null;

  return { playerOfMatchId, teams };
}

export function fallOfWickets(inn: Innings) {
  let runs = 0;
  let legal = 0;
  let n = 0;
  const out: { n: number; runs: number; playerId: string; overs: string }[] = [];
  for (const b of inn.balls) {
    runs += ballRuns(b);
    if (b.legal) legal++;
    if (b.wicket) {
      n++;
      out.push({ n, runs, playerId: b.wicket.playerOutId, overs: oversText(legal) });
    }
  }
  return out;
}

export function lastOverBalls(inn: Innings): Ball[] {
  if (!inn.balls.length) return [];
  const over = inn.balls[inn.balls.length - 1].over;
  return inn.balls.filter((b) => b.over === over);
}

export function dismissalText(m: Match, stat: BatStat): string {
  if (!stat.out) return 'not out';
  const name = (id?: string) => (id ? m.players[id]?.name ?? 'sub' : 'sub');
  const bowler = name(stat.out.bowlerId);
  switch (stat.out.kind) {
    case 'bowled':
      return `b ${bowler}`;
    case 'lbw':
      return `lbw b ${bowler}`;
    case 'hitwicket':
      return `hit wicket b ${bowler}`;
    case 'caught':
      return stat.out.fielderId === stat.out.bowlerId ? `c & b ${bowler}` : `c ${name(stat.out.fielderId)} b ${bowler}`;
    case 'stumped':
      return `st ${name(stat.out.fielderId)} b ${bowler}`;
    case 'runout':
      return stat.out.fielderId ? `run out (${name(stat.out.fielderId)})` : 'run out';
    case 'timedout': return 'timed out';
    case 'hittwice': return 'hit the ball twice';
    case 'retiredout': return 'retired out';
    case 'obstructing': return 'obstructing the field';
  }
}

export const WICKET_LABEL: Record<WicketKind, string> = {
  bowled: 'Bowled',
  caught: 'Caught',
  lbw: 'LBW',
  runout: 'Run out',
  stumped: 'Stumped',
  hitwicket: 'Hit wicket',
  timedout: 'Timed out',
  hittwice: 'Hit the ball twice',
  retiredout: 'Retired out',
  obstructing: 'Obstructing the field',
};

/* ---------- match state ---------- */
export function currentInnings(m: Match): Innings {
  return m.innings[m.innings.length - 1];
}

export type Need = 'striker' | 'nonStriker' | 'bowler' | null;
export function needOf(m: Match): Need {
  if (m.status !== 'live') return null;
  const inn = currentInnings(m);
  if (inn.status === 'done') return null;
  if (!inn.striker) return 'striker';
  if (!inn.nonStriker) return 'nonStriker';
  if (!inn.bowler) return 'bowler';
  return null;
}

function doneReason(m: Match, inn: Innings): string | null {
  const t = totals(inn);
  if (t.wickets >= maxWickets(m, inn)) return 'All out';
  if (t.legal >= m.overs * 6) return 'Overs completed';
  if (inn.target !== undefined && t.runs >= inn.target) return 'Target reached';
  return null;
}

export function teamScore(m: Match, teamId: string) {
  const inn = m.innings.find((i) => i.battingTeamId === teamId);
  if (!inn) return null;
  const t = totals(inn);
  return { runs: t.runs, wickets: t.wickets, legal: t.legal, done: inn.status === 'done' };
}

function computeResult(m: Match) {
  const [a, b] = m.innings;
  const ta = totals(a);
  const tb = totals(b);
  const name = (id: string) => m.teams[id]?.name ?? 'Team';
  if (tb.runs > ta.runs) {
    const w = maxWickets(m, b) - tb.wickets;
    return { winnerId: b.battingTeamId, text: `${name(b.battingTeamId)} won by ${w} wicket${w === 1 ? '' : 's'}` };
  }
  if (tb.runs < ta.runs) {
    const r = ta.runs - tb.runs;
    return { winnerId: a.battingTeamId, text: `${name(a.battingTeamId)} won by ${r} run${r === 1 ? '' : 's'}` };
  }
  return { winnerId: null, text: 'Match tied' };
}

function finalize(m: Match): Match {
  if (m.innings.length === 2 && m.innings[1].status === 'done') {
    return {
      ...m,
      status: 'completed',
      result: { ...computeResult(m), playerOfMatchId: matchAwards(m).playerOfMatchId ?? undefined },
    };
  }
  return m;
}

export function setPlayerOfMatch(m: Match, playerId: string): Match {
  if (m.status !== 'completed' || !Object.values(m.squads).some((squad) => squad.includes(playerId)) || !m.result) return m;
  return { ...m, result: { ...m.result, playerOfMatchId: playerId } };
}

function replaceLast(m: Match, inn: Innings): Match {
  const innings = m.innings.slice();
  innings[innings.length - 1] = inn;
  return { ...m, innings };
}

const freshInnings = (battingTeamId: string, bowlingTeamId: string, target?: number): Innings => ({
  battingTeamId,
  bowlingTeamId,
  balls: [],
  striker: null,
  nonStriker: null,
  bowler: null,
  lastOverBowler: null,
  target,
  status: 'live',
});

export function createMatch(cfg: NewMatchConfig, teams: Team[], players: Player[]): Match {
  const tA = teams.find((t) => t.id === cfg.teamAId)!;
  const tB = teams.find((t) => t.id === cfg.teamBId)!;
  const snapPlayers: Record<string, PlayerSnap> = {};
  [...cfg.squadA, ...cfg.squadB].forEach((id) => {
    const p = players.find((x) => x.id === id);
    if (p) snapPlayers[id] = { name: p.name, teamId: p.teamId, role: p.role };
  });
  const batFirst = cfg.decision === 'bat' ? cfg.tossWinnerId : cfg.tossWinnerId === tA.id ? tB.id : tA.id;
  const bowlFirst = batFirst === tA.id ? tB.id : tA.id;
  return {
    id: uid(),
    createdAt: Date.now(),
    format: cfg.format,
    overs: cfg.overs,
    bowlerOversLimit: cfg.bowlerOversLimit,
    allowConsecutiveOvers: cfg.allowConsecutiveOvers,
    teamAId: tA.id,
    teamBId: tB.id,
    squads: { [tA.id]: cfg.squadA, [tB.id]: cfg.squadB },
    teams: {
      [tA.id]: { name: tA.name, short: tA.short, color: tA.color, badge: tA.badge },
      [tB.id]: { name: tB.name, short: tB.short, color: tB.color, badge: tB.badge },
    },
    players: snapPlayers,
    tossWinnerId: cfg.tossWinnerId,
    tossDecision: cfg.decision,
    innings: [freshInnings(batFirst, bowlFirst)],
    status: 'live',
  };
}

export function setCrease(
  m: Match,
  patch: Partial<Pick<Innings, 'striker' | 'nonStriker' | 'bowler'>>,
): Match {
  if (m.status !== 'live') return m;
  return replaceLast(m, { ...currentInnings(m), ...patch });
}

export function swapStrike(m: Match): Match {
  const inn = currentInnings(m);
  if (m.status !== 'live' || !inn.striker || !inn.nonStriker) return m;
  return replaceLast(m, { ...inn, striker: inn.nonStriker, nonStriker: inn.striker });
}

export interface BallInput {
  shotAngle?: number;
  shotDistance?: number;
  runs: number;
  extra?: ExtraType;
  wicket?: { kind: WicketKind; playerOutId?: string; fielderId?: string };
}

export function applyBall(m: Match, input: BallInput): Match {
  const inn = currentInnings(m);
  const noDelivery = input.wicket?.kind === 'timedout' || input.wicket?.kind === 'retiredout';
  if (m.status !== 'live' || inn.status !== 'live') return m;
  if (!noDelivery && (!inn.striker || !inn.nonStriker || !inn.bowler)) return m;
  const playerOutId = input.wicket?.playerOutId ?? inn.striker;
  if (noDelivery) {
    if (!playerOutId || !m.squads[inn.battingTeamId]?.includes(playerOutId)) return m;
    if (inn.balls.some((b) => b.wicket?.playerOutId === playerOutId)) return m;
    if (input.wicket?.kind === 'retiredout' && playerOutId !== inn.striker && playerOutId !== inn.nonStriker) return m;
    if (input.wicket?.kind === 'timedout' && battingOrder(inn).includes(playerOutId)) return m;
    if (input.wicket?.kind === 'timedout' && inn.striker && inn.nonStriker) return m;
  }
  const t = totals(inn);
  const legal = !noDelivery && input.extra !== 'wd' && input.extra !== 'nb';
  let runs = 0;
  let extraRuns = 0;
  switch (noDelivery ? undefined : input.extra) {
    case 'wd':
      extraRuns = 1 + input.runs;
      break;
    case 'nb':
      runs = input.runs;
      extraRuns = 1;
      break;
    case 'b':
    case 'lb':
      extraRuns = input.runs;
      break;
    default:
      runs = noDelivery ? 0 : input.runs;
  }
  const ball: Ball = {
    ...(runs > 0 && Number.isFinite(input.shotAngle) ? { shotAngle: ((input.shotAngle! % 360) + 360) % 360 } : {}),
    ...(runs > 0 && Number.isFinite(input.shotAngle) && Number.isFinite(input.shotDistance) ? { shotDistance: Math.max(0, Math.min(1, input.shotDistance!)) } : {}),
    id: uid(),
    over: Math.floor(t.legal / 6),
    batterId: inn.striker ?? playerOutId!,
    nonStrikerId: inn.nonStriker ?? playerOutId!,
    bowlerId: inn.bowler ?? '',
    runs,
    extra: noDelivery ? undefined : input.extra,
    extraRuns,
    legal,
    ...(noDelivery ? { noDelivery: true } : {}),
    wicket: input.wicket
      ? {
          kind: input.wicket.kind,
          playerOutId: playerOutId!,
          fielderId: input.wicket.fielderId,
        }
      : undefined,
    prev: { striker: inn.striker, nonStriker: inn.nonStriker, bowler: inn.bowler, lastOverBowler: inn.lastOverBowler },
  };

  let striker: string | null = inn.striker;
  let nonStriker: string | null = inn.nonStriker;
  let bowler: string | null = inn.bowler;
  let last = inn.lastOverBowler;

  if (runsRan(ball) % 2 === 1) [striker, nonStriker] = [nonStriker, striker];
  if (legal && (t.legal + 1) % 6 === 0) {
    [striker, nonStriker] = [nonStriker, striker];
    last = ball.bowlerId;
    bowler = null;
  }
  if (ball.wicket) {
    if (striker === ball.wicket.playerOutId) striker = null;
    else if (nonStriker === ball.wicket.playerOutId) nonStriker = null;
  }

  const next: Innings = { ...inn, balls: [...inn.balls, ball], striker, nonStriker, bowler, lastOverBowler: last };
  const reason = doneReason(m, next);
  if (reason) {
    next.status = 'done';
    next.endReason = reason;
  }
  return finalize(replaceLast(m, next));
}

export function undoBall(m: Match): Match {
  const inn = currentInnings(m);
  if (!inn.balls.length) return m;
  const last = inn.balls[inn.balls.length - 1];
  const next: Innings = {
    ...inn,
    balls: inn.balls.slice(0, -1),
    ...last.prev,
    status: 'live',
    endReason: undefined,
  };
  return { ...replaceLast(m, next), status: 'live', result: undefined };
}

export function startNextInnings(m: Match): Match {
  if (m.innings.length !== 1 || m.innings[0].status !== 'done') return m;
  const first = m.innings[0];
  const target = totals(first).runs + 1;
  return { ...m, innings: [...m.innings, freshInnings(first.bowlingTeamId, first.battingTeamId, target)] };
}

export function endInnings(m: Match): Match {
  const inn = currentInnings(m);
  if (m.status !== 'live' || inn.status === 'done') return m;
  return finalize(replaceLast(m, { ...inn, status: 'done', endReason: 'Innings closed' }));
}

/* ---------- career statistics ---------- */
export interface Career {
  id: string;
  name: string;
  teamId: string;
  role: string;
  matches: number;
  innings: number;
  notOuts: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  highest: number;
  highestNotOut: boolean;
  fifties: number;
  hundreds: number;
  ducks: number;
  bowlBalls: number;
  bowlRuns: number;
  wickets: number;
  maidens: number;
  bestW: number;
  bestR: number;
  catches: number;
  stumpings: number;
}

export function careerStats(matches: Match[]): Record<string, Career> {
  const out: Record<string, Career> = {};
  const get = (m: Match, id: string): Career => {
    if (!out[id]) {
      const p = m.players[id];
      out[id] = {
        id,
        name: p?.name ?? 'Player',
        teamId: p?.teamId ?? '',
        role: p?.role ?? 'Batter',
        matches: 0,
        innings: 0,
        notOuts: 0,
        runs: 0,
        balls: 0,
        fours: 0,
        sixes: 0,
        highest: 0,
        highestNotOut: false,
        fifties: 0,
        hundreds: 0,
        ducks: 0,
        bowlBalls: 0,
        bowlRuns: 0,
        wickets: 0,
        maidens: 0,
        bestW: 0,
        bestR: 0,
        catches: 0,
        stumpings: 0,
      };
    }
    return out[id];
  };
  for (const m of matches) {
    if (!m.innings.some((i) => i.balls.length)) continue;
    Object.values(m.squads)
      .flat()
      .forEach((id) => {
        get(m, id).matches++;
      });
    for (const inn of m.innings) {
      for (const s of battingCard(inn)) {
        const c = get(m, s.id);
        c.innings++;
        c.runs += s.runs;
        c.balls += s.balls;
        c.fours += s.fours;
        c.sixes += s.sixes;
        const notOut = !s.out;
        if (notOut) c.notOuts++;
        if (s.runs > c.highest || (s.runs === c.highest && notOut && !c.highestNotOut)) {
          c.highest = s.runs;
          c.highestNotOut = notOut;
        }
        if (s.runs >= 100) c.hundreds++;
        else if (s.runs >= 50) c.fifties++;
        if (s.runs === 0 && s.out) c.ducks++;
      }
      for (const s of bowlingCard(inn)) {
        const c = get(m, s.id);
        c.bowlBalls += s.balls;
        c.bowlRuns += s.runs;
        c.wickets += s.wickets;
        c.maidens += s.maidens;
        if (s.wickets > c.bestW || (s.wickets === c.bestW && s.wickets > 0 && s.runs < c.bestR)) {
          c.bestW = s.wickets;
          c.bestR = s.runs;
        }
      }
      for (const b of inn.balls) {
        if (b.wicket?.fielderId) {
          if (b.wicket.kind === 'caught') get(m, b.wicket.fielderId).catches++;
          if (b.wicket.kind === 'stumped') get(m, b.wicket.fielderId).stumpings++;
        }
      }
    }
  }
  return out;
}

export const battingAvg = (c: Career) => {
  const outs = c.innings - c.notOuts;
  return outs > 0 ? (c.runs / outs).toFixed(1) : c.runs > 0 ? `${c.runs}*` : '-';
};
export const strikeRate = (runs: number, balls: number) => (balls > 0 ? ((runs / balls) * 100).toFixed(1) : '-');
export const economy = (runs: number, balls: number) => (balls > 0 ? ((runs / balls) * 6).toFixed(2) : '-');
