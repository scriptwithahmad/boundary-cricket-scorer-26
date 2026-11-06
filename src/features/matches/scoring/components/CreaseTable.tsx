import React from 'react';
import { View } from 'react-native';
import { AppText, Card, Tap } from '@/src/components/ui';
import { economy, oversText, strikeRate } from '@/src/engine/cricket';
import type { useScoringController } from '../hooks/useScoringController';
import { cols } from '../constants';
import { styles } from '../constants';

type Props = Pick<NonNullable<ReturnType<typeof useScoringController>>, 'id' | 'colors' | 'store' | 'compact' | 'inn' | 'bowlTeam' | 'striker' | 'nonStriker' | 'bowlerStat' | 'name' | 'hasPlayedBall' | 'canChangeBowler' | 'openPlayerPicker' | 'live'>;

export function CreaseTable({ controller }: { controller: Props }) {
  const { id, colors, store, compact, inn, bowlTeam, striker, nonStriker, bowlerStat, name, hasPlayedBall, canChangeBowler, openPlayerPicker, live } = controller;
  return (<Card style={{ marginTop: compact ? 10 : 16, gap: compact ? 2 : 4, padding: compact ? 12 : 16 }}>
    <View style={[styles.tableRow, compact && { paddingVertical: 3 }]}>
      <AppText variant="label" color="textFaint" style={{ flex: 1 }}>
        Batter
      </AppText>
      {store.showPlayerStatistics ? <>{['R', 'B', '4s', '6s'].map((h) => (
        <AppText key={h} variant="label" color="textFaint" style={cols.n}>
          {h}
        </AppText>
      ))}
        <AppText variant="label" color="textFaint" style={cols.w}>
          SR
        </AppText>
      </> : null}
    </View>
    {[
      { s: striker, strike: true },
      { s: nonStriker, strike: false },
    ].map(({ s, strike }, i) => (
      <View key={i} style={styles.tableRow}>
        <View style={{ flex: 1 }}>
          {s && live && inn.status === 'live' && !hasPlayedBall(s.id) ? (
            <Tap
              onPress={() => openPlayerPicker(strike ? 'striker' : 'nonStriker')}
              accessibilityLabel={`Change ${strike ? 'striker' : 'non-striker'} ${name(s.id)}`}
              accessibilityHint="Opens the player picker"
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
                {strike ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary }} /> : null}
                <AppText variant="bodyStrong" numberOfLines={1} color={strike ? 'primary' : 'text'}>
                  {name(s.id)}
                </AppText>
              </View>
            </Tap>
          ) : (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              {s && strike ? <View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: colors.primary }} /> : null}
              <AppText variant="bodyStrong" style={{ flex: 1 }} numberOfLines={1} color={!s ? 'textFaint' : strike ? 'primary' : 'text'}>
                {s ? name(s.id) : 'Waiting…'}
              </AppText>
            </View>
          )}
        </View>
        {store.showPlayerStatistics ? <><AppText variant="bodyStrong" style={cols.n}>
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
        </> : null}
      </View>
    ))}
    <View style={[styles.divider, { backgroundColor: colors.border, marginVertical: compact ? 4 : 8 }]} />
    <View style={styles.tableRow}>
      <View style={{ flex: 1 }}>
        <AppText variant="label" color="textFaint">
          Bowler · {bowlTeam.short}
        </AppText>
        {inn.bowler && canChangeBowler ? (
          <Tap
            onPress={() => openPlayerPicker('bowler')}
            accessibilityLabel={`Change bowler ${name(inn.bowler)}`}
            accessibilityHint="Opens the bowler picker"
          >
            <AppText variant="bodyStrong" numberOfLines={1}>
              {name(inn.bowler)}
            </AppText>
          </Tap>
        ) : (
          <AppText variant="bodyStrong" numberOfLines={1} color={inn.bowler ? 'text' : 'textFaint'}>
            {inn.bowler ? name(inn.bowler) : 'Waiting…'}
          </AppText>
        )}
      </View>
      {store.showPlayerStatistics ? <View style={{ alignItems: 'flex-end', marginLeft: 12 }} accessibilityLabel={`${bowlerStat?.runs ?? 0} runs conceded, ${bowlerStat?.wickets ?? 0} wickets, ${oversText(bowlerStat?.balls ?? 0)} overs`}>
        <AppText variant="bodyStrong" style={{ fontVariant: ['tabular-nums'] }}>
          {bowlerStat?.runs ?? 0}/{bowlerStat?.wickets ?? 0}{' '}
          <AppText variant="caption" color="textMuted">({oversText(bowlerStat?.balls ?? 0)})</AppText>
        </AppText>
        <AppText variant="caption" color="textMuted" style={{ fontVariant: ['tabular-nums'] }}>
          Econ {economy(bowlerStat?.runs ?? 0, bowlerStat?.balls ?? 0)}
        </AppText>
      </View> : null}
    </View>
  </Card>);
}
