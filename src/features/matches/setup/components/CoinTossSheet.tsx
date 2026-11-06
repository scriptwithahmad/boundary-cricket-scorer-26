import React from 'react';
import { View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Check, RotateCw } from 'lucide-react-native';
import { AppText, Button, Card, Sheet, Tap } from '@/src/components/ui';
import { Avatar } from '@/src/components/cricket/Avatar';
import type { useNewMatchController } from '../hooks/useNewMatchController';
import { CoinFace } from './CoinFace';

type Props = Pick<ReturnType<typeof useNewMatchController>, 'colors' | 'store' | 'teamA' | 'teamB' | 'tossWinner' | 'coinSheetOpen' | 'coinSide' | 'coinCallerTeamId' | 'setCoinCallerTeamId' | 'coinCall' | 'setCoinCall' | 'coinFlipping' | 'coinStyle' | 'closeCoinSheet' | 'flipCoin' | 'flipAgain' | 'teamName'>;

export function CoinTossSheet({ controller }: { controller: Props }) {
  const { colors, store, teamA, teamB, tossWinner, coinSheetOpen, coinSide, coinCallerTeamId, setCoinCallerTeamId, coinCall, setCoinCall, coinFlipping, coinStyle, closeCoinSheet, flipCoin, flipAgain, teamName } = controller;
  return (<Sheet
    visible={coinSheetOpen}
    onClose={closeCoinSheet}
    title="Flip the coin"
    subtitle="Choose a team and its call before flipping."
  >
    <View style={{ alignItems: 'center', gap: 16, paddingVertical: 8 }}>
      <Animated.View
        style={[
          {
            width: 144,
            height: 144,
            borderRadius: 72,
            alignItems: 'center',
            justifyContent: 'center',
            shadowColor: '#000000',
            shadowOpacity: 0.3,
            shadowRadius: 12,
            shadowOffset: { width: 0, height: 8 },
            elevation: 8,
          },
          coinStyle,
        ]}
      >
        <View
          style={{
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: 70,
            borderWidth: 3,
            borderColor: '#FFE58A',
            backgroundColor: '#A96E17',
            transform: [{ translateX: 3 }],
          }}
        />
        {coinSide ? <CoinFace side={coinSide} /> : (
          <View
            style={{
              position: 'absolute',
              left: 5,
              top: 5,
              right: 5,
              bottom: 5,
              borderRadius: 67,
              borderWidth: 2,
              borderColor: '#FFF0A3',
              backgroundColor: '#E8B747',
              alignItems: 'center',
              justifyContent: 'center',
              backfaceVisibility: 'hidden',
            }}
          >
            <AppText variant="title" style={{ color: '#50330B' }}>{coinFlipping ? '•' : '?'}</AppText>
          </View>
        )}
      </Animated.View>
      <AppText variant="bodyStrong" color="textMuted" style={{ textAlign: 'center' }}>
        {coinFlipping ? 'Flipping…' : coinSide ? `It landed on ${coinSide}.` : 'Tap below to flip.'}
      </AppText>
    </View>
    {!coinSide ? (
      <View style={{ gap: 12 }}>
        <AppText variant="label" color="textMuted">Which team is calling?</AppText>
        <View style={{ gap: 8 }}>
          {[teamA, teamB].map((teamId) => {
            const team = store.teams.find((item) => item.id === teamId);
            if (!team) return null;
            const selected = coinCallerTeamId === teamId;
            return (
              <Tap
                key={teamId}
                onPress={() => setCoinCallerTeamId(teamId)}
                accessibilityState={{ selected }}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                  padding: 12,
                  borderRadius: 16,
                  backgroundColor: selected ? colors.primarySoft : colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: selected ? colors.primary : 'transparent',
                }}
              >
                <Avatar name={team.short} color={team.color} size={38} badge={team.badge} />
                <AppText variant="bodyStrong" style={{ flex: 1 }}>{team.name}</AppText>
                {selected ? <Check size={18} color={colors.primary} strokeWidth={2.8} /> : null}
              </Tap>
            );
          })}
        </View>
        <AppText variant="label" color="textMuted">The team calls</AppText>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          {(['Heads', 'Tails'] as const).map((side) => (
            <View key={side} style={{ flex: 1 }}>
              <Button
                label={side}
                variant={coinCall === side ? 'soft' : 'secondary'}
                disabled={!coinCallerTeamId}
                onPress={() => setCoinCall(side)}
              />
            </View>
          ))}
        </View>
        <Button
          label="Flip coin"
          icon={RotateCw}
          variant="soft"
          disabled={!coinCallerTeamId || !coinCall}
          onPress={flipCoin}
        />
      </View>
    ) : (
      <View style={{ gap: 12 }}>
        <Card style={{ alignItems: 'center', gap: 6 }}>
          <AppText variant="label" color="textMuted">Toss winner</AppText>
          <AppText variant="title" color="primary">
            {teamName(tossWinner)}
          </AppText>
          <AppText variant="caption" color="textMuted" style={{ textAlign: 'center' }}>
            {teamName(coinCallerTeamId)} called {coinCall}. The coin landed on {coinSide}.
          </AppText>
        </Card>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <View style={{ flex: 1 }}>
            <Button label="Flip again" icon={RotateCw} variant="secondary" onPress={flipAgain} />
          </View>
          <View style={{ flex: 1 }}>
            <Button label="Use toss result" variant="soft" onPress={closeCoinSheet} />
          </View>
        </View>
      </View>
    )}
  </Sheet>);
}
