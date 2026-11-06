import React, { useId } from 'react';
import type { ColorValue } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Path, Stop } from 'react-native-svg';
import { useTheme } from '@/src/theme';

type TabName = 'home' | 'teams' | 'matches' | 'stats' | 'settings';

export function TabIcon({ name, focused, color }: { name: TabName; focused: boolean; color: ColorValue }) {
  const { colors, isDark } = useTheme();
  const id = `tab-gradient-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  const fill = `url(#${id})`;
  const ink = focused ? colors.primary : color;
  const washOpacity = focused ? 0.24 : 0.12;
  return (
    <Svg width={22} height={22} viewBox="0 0 24 24" fill="none" strokeLinecap="round" strokeLinejoin="round">
      <Defs>
        <LinearGradient id={id} x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%" stopColor={ink} />
          <Stop offset="100%" stopColor={focused ? (isDark ? colors.onHeroMuted : colors.heroA) : color} />
        </LinearGradient>
      </Defs>
      {name === 'home' ? (
        <>
          <Path fill={fill} fillOpacity={washOpacity} stroke={ink} strokeWidth={1.8} d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z" />
          <Path fill={fill} stroke={ink} strokeWidth={1.8} d="M9 21v-8a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v8Z" />
        </>
      ) : null}
      {name === 'teams' ? <>
        <Circle cx={9} cy={7} r={4} fill={fill} fillOpacity={washOpacity} stroke={ink} strokeWidth={1.8} />
        <Path d="M2 21v-3a5 5 0 0 1 5-5h4a5 5 0 0 1 5 5v3Z" fill={fill} fillOpacity={washOpacity} stroke={ink} strokeWidth={1.8} />
        <Path d="M17 3.2a4 4 0 0 1 0 7.6M19 13.3a5 5 0 0 1 3 4.7v3" stroke={ink} strokeWidth={2.2} />
      </> : null}
      {name === 'matches' ? <>
        <Circle cx={12} cy={12} r={7} fill={fill} fillOpacity={washOpacity} />
        <Path d="M4.6 6A9 9 0 1 1 3 14M3 3v5h5" stroke={ink} strokeWidth={1.8} />
        <Path d="M12 7v5l3 2" stroke={ink} strokeWidth={2.2} />
      </> : null}
      {name === 'stats' ? <>
        <Path d="m3 17 5-5 5 4 8-9v14H3Z" fill={fill} fillOpacity={washOpacity} />
        <Path d="m3 13 5-5 5 4 8-9m-5 0h5v5" stroke={ink} strokeWidth={2.2} />
      </> : null}
      {name === 'settings' ? <>
        <Path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915Z" fill={fill} fillOpacity={washOpacity} stroke={ink} strokeWidth={1.8} />
        <Circle cx={12} cy={12} r={3} fill={colors.surface} stroke={ink} strokeWidth={2.2} />
      </> : null}
    </Svg>
  );
}
