import type { CoinSide } from '../constants';
import React from 'react';
import { View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Crown, Shield } from 'lucide-react-native';
import { AppText } from '@/src/components/ui';

export function CoinFace({ side }: { side: CoinSide }) {
  const Emblem = side === 'Heads' ? Crown : Shield;
  return (
    <View
      style={{
        position: 'absolute',
        left: 5,
        top: 5,
        right: 5,
        bottom: 5,
        borderRadius: 60,
        borderWidth: 2,
        borderColor: '#FFF0A3',
        overflow: 'hidden',
        backfaceVisibility: 'hidden',
      }}
    >
      <LinearGradient
        colors={['#FFF1A8', '#E6AD37', '#F6D36B', '#C8871C']}
        start={{ x: 0.1, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
      >
        <View
          style={{
            position: 'absolute',
            left: 7,
            top: 7,
            right: 7,
            bottom: 7,
            borderRadius: 55,
            borderWidth: 1.5,
            borderColor: 'rgba(111,68,9,0.6)',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 3,
          }}
        >
          <Emblem size={26} color="#68430D" strokeWidth={2.2} />
          <AppText variant="label" style={{ color: '#50330B', fontSize: 10, letterSpacing: 1.5 }}>
            {side}
          </AppText>
          <View style={{ flexDirection: 'row', gap: 5 }}>
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: '#68430D' }} />
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: '#68430D' }} />
            <View style={{ width: 3, height: 3, borderRadius: 2, backgroundColor: '#68430D' }} />
          </View>
        </View>
      </LinearGradient>
    </View>
  );
}
