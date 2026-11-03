import React from 'react';
import { View } from 'react-native';
import {
  battingCard,
  bowlingCard,
  dismissalText,
  economy,
  fallOfWickets,
  oversText,
  strikeRate,
  totals,
} from '../engine/cricket';
import type { Match } from '../types';
import { AppText, Card } from './ui';
import { useTheme } from '../theme';

function Cell({ children, w, bold, color, align = 'right' }: { children: React.ReactNode; w?: number; bold?: boolean; color?: string; align?: 'left' | 'right' }) {
  return (
    <AppText
      variant={bold ? 'bodyStrong' : 'caption'}
      color={color ?? (bold ? 'text' : 'textMuted')}
      style={{ width: w, flex: w ? undefined : 1, textAlign: align, fontVariant: ['tabular-nums'] }}
      numberOfLines={1}
    >
      {children}
    </AppText>
  );
}

function Row({ children, head }: { children: React.ReactNode; head?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: head ? 6 : 10,
        borderBottomWidth: head ? 0 : 1,
        borderBottomColor: colors.border,
        gap: 4,
      }}
    >
      {children}
    </View>
  );
}

export function InningsScorecard({ match, inningsIndex }: { match: Match; inningsIndex: number }) {
  const { colors } = useTheme();
  const inn = match.innings[inningsIndex];
  if (!inn) return null;
  const t = totals(inn);
  const bat = battingCard(inn);
  const bowl = bowlingCard(inn);
  const fow = fallOfWickets(inn);
  const team = match.teams[inn.battingTeamId];
  const name = (id: string) => match.players[id]?.name ?? 'Player';
  const yetToBat = (match.squads[inn.battingTeamId] ?? []).filter((id) => !bat.some((b) => b.id === id));
  const atCrease = (id: string) => inn.status === 'live' && (inn.striker === id || inn.nonStriker === id);

  return (
    <View style={{ gap: 16 }}>
      <Card style={{ gap: 16 }}>
        <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
          <AppText variant="heading">{team.name}</AppText>
          <AppText variant="title" style={{ fontVariant: ['tabular-nums'] }}>
            {t.runs}/{t.wickets}{' '}
            <AppText variant="caption" color="textMuted">
              ({oversText(t.legal)} ov)
            </AppText>
          </AppText>
        </View>

        <View>
          <Row head>
            <Cell w={undefined} align="left" color="textFaint">
              BATTER
            </Cell>
            <Cell w={32} color="textFaint">R</Cell>
            <Cell w={32} color="textFaint">B</Cell>
            <Cell w={28} color="textFaint">4s</Cell>
            <Cell w={28} color="textFaint">6s</Cell>
            <Cell w={48} color="textFaint">SR</Cell>
          </Row>
          {bat.map((b) => (
            <Row key={b.id}>
              <View style={{ flex: 1 }}>
                <AppText variant="bodyStrong" numberOfLines={1}>
                  {name(b.id)}
                  {atCrease(b.id) && inn.striker === b.id ? ' *' : ''}
                </AppText>
                <AppText variant="caption" color={b.out ? 'textMuted' : 'primary'} numberOfLines={1}>
                  {atCrease(b.id) ? 'batting' : dismissalText(match, b)}
                </AppText>
              </View>
              <Cell w={32} bold>{b.runs}</Cell>
              <Cell w={32}>{b.balls}</Cell>
              <Cell w={28}>{b.fours}</Cell>
              <Cell w={28}>{b.sixes}</Cell>
              <Cell w={48}>{strikeRate(b.runs, b.balls)}</Cell>
            </Row>
          ))}
          <Row>
            <View style={{ flex: 1 }}>
              <AppText variant="bodyStrong">Extras</AppText>
              <AppText variant="caption" color="textMuted">
                wd {t.extras.wd} · nb {t.extras.nb} · b {t.extras.b} · lb {t.extras.lb}
              </AppText>
            </View>
            <Cell w={32} bold>{t.extrasTotal}</Cell>
          </Row>
        </View>
        {yetToBat.length ? (
          <AppText variant="caption" color="textMuted">
            <AppText variant="caption" color="textFaint">
              Yet to bat:{' '}
            </AppText>
            {yetToBat.map(name).join(', ')}
          </AppText>
        ) : null}
      </Card>

      <Card style={{ gap: 8 }}>
        <Row head>
          <Cell w={undefined} align="left" color="textFaint">
            BOWLER
          </Cell>
          <Cell w={40} color="textFaint">O</Cell>
          <Cell w={28} color="textFaint">M</Cell>
          <Cell w={32} color="textFaint">R</Cell>
          <Cell w={28} color="textFaint">W</Cell>
          <Cell w={48} color="textFaint">ECO</Cell>
        </Row>
        {bowl.length === 0 ? (
          <AppText variant="caption" color="textFaint">
            No deliveries bowled yet.
          </AppText>
        ) : (
          bowl.map((b) => (
            <Row key={b.id}>
              <Cell align="left" bold color="text">
                {name(b.id)}
              </Cell>
              <Cell w={40}>{oversText(b.balls)}</Cell>
              <Cell w={28}>{b.maidens}</Cell>
              <Cell w={32}>{b.runs}</Cell>
              <Cell w={28} bold color={b.wickets ? colors.danger : 'text'}>
                {b.wickets}
              </Cell>
              <Cell w={48}>{economy(b.runs, b.balls)}</Cell>
            </Row>
          ))
        )}
      </Card>

      {fow.length ? (
        <Card style={{ gap: 8 }}>
          <AppText variant="label" color="textMuted">
            Fall of wickets
          </AppText>
          <AppText variant="caption" color="textMuted" style={{ lineHeight: 22 }}>
            {fow.map((f) => `${f.runs}-${f.n} (${name(f.playerId)}, ${f.overs} ov)`).join('   ·   ')}
          </AppText>
        </Card>
      ) : null}
    </View>
  );
}
