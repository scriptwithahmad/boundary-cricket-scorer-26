import React, { useState } from 'react';
import { Platform, View, type GestureResponderEvent } from 'react-native';
import Svg, { Circle, Line, Rect, Text as SvgText } from 'react-native-svg';
import { useTheme } from '@/src/theme';
import { AppText } from '@/src/components/ui';

export type Shot = { runs: number; shotAngle?: number; shotDistance?: number };
// Right-handed batter facing down the screen: off side left, leg side right.
const FIELD_POSITIONS = [
  { name: 'BEHIND SQUARE', angle: 0 },
  { name: 'FINE LEG', angle: 36 },
  { name: 'SQUARE LEG', angle: 90 },
  { name: 'MID-WICKET', angle: 126 },
  { name: 'LONG ON', angle: 153 },
  { name: 'STRAIGHT', angle: 180 },
  { name: 'LONG OFF', angle: 207 },
  { name: 'COVER', angle: 234 },
  { name: 'POINT', angle: 270 },
  { name: 'THIRD MAN', angle: 324 },
];
export function WagonWheel({ shots, angle, distance, onSelect }: { shots: Shot[]; angle?: number; distance?: number; onSelect?: (angle: number, distance: number) => void }) {
  const { colors } = useTheme();
  const [fieldWidth, setFieldWidth] = useState(300);
  const shotColor = (runs: number) => runs === 4 ? colors.four : runs === 6 ? colors.six : colors.primary;
  const endpoint = (direction: number, radius: number) => ({ x: 150 + Math.sin(direction * Math.PI / 180) * radius, y: 150 - Math.cos(direction * Math.PI / 180) * radius });
  const updateShot = (event: GestureResponderEvent) => {
    const locationX = event.nativeEvent.locationX * 300 / fieldWidth;
    const locationY = event.nativeEvent.locationY * 300 / fieldWidth;
    const radius = Math.hypot(locationX - 150, locationY - 150);
    onSelect?.((Math.atan2(locationX - 150, 150 - locationY) * 180 / Math.PI + 360) % 360, Math.min(radius / 130, 1));
  };
  return (
    <View style={{ gap: 12, alignItems: 'center' }}>
      <View accessibilityLabel={onSelect ? 'Cricket field. Tap where the shot landed; straight is at the bottom.' : 'Player wagon wheel'}
        onStartShouldSetResponder={() => Boolean(onSelect)}
        onMoveShouldSetResponder={() => Boolean(onSelect)}
        onResponderTerminationRequest={() => !onSelect}
        onResponderGrant={updateShot}
        onResponderMove={updateShot}
        onResponderRelease={updateShot}
        onLayout={(event) => setFieldWidth(event.nativeEvent.layout.width)}
        style={{ width: 300, aspectRatio: 1, maxWidth: '100%', ...(onSelect && Platform.OS === 'web' ? { touchAction: 'none', userSelect: 'none' } as const : {}) }}>
        <Svg width="100%" height="100%" viewBox="0 0 300 300" pointerEvents="none">
          <Circle cx={150} cy={150} r={130} fill={colors.primarySoft} stroke={colors.primary} strokeOpacity={0.35} />
          <Circle cx={150} cy={150} r={85} fill="none" stroke={colors.primary} strokeOpacity={0.16} strokeDasharray="4 5" />
          {[0, 45, 90, 135].map((direction) => {
            const a = endpoint(direction, 130); const b = endpoint(direction + 180, 130);
            return <Line key={direction} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={colors.primary} strokeOpacity={0.12} />;
          })}
          <Rect x={144} y={126} width={12} height={48} rx={3} fill={colors.primary} fillOpacity={0.15} stroke={colors.primary} strokeOpacity={0.35} />
          {shots.filter((shot) => Number.isFinite(shot.shotAngle)).map((shot, index) => {
            const end = endpoint(shot.shotAngle!, shot.shotDistance !== undefined ? Math.max(0, Math.min(1, shot.shotDistance)) * 130 : shot.runs >= 4 ? 125 : 55 + Math.min(shot.runs, 3) * 17);
            return <React.Fragment key={index}><Line x1={150} y1={150} x2={end.x} y2={end.y} stroke={shotColor(shot.runs)} strokeWidth={2} strokeOpacity={0.7} /><Circle cx={end.x} cy={end.y} r={3} fill={shotColor(shot.runs)} /></React.Fragment>;
          })}
          {angle !== undefined ? (() => { const end = endpoint(angle, (distance ?? 1) * 130); return <><Line x1={150} y1={150} x2={end.x} y2={end.y} stroke={colors.text} strokeWidth={3} /><Circle cx={end.x} cy={end.y} r={6} fill={colors.primary} stroke={colors.text} strokeWidth={2} /></>; })() : null}
          <Circle cx={150} cy={150} r={4} fill={colors.text} />
          {FIELD_POSITIONS.map((position) => {
            const point = endpoint(position.angle, 141);
            const rotation = position.angle > 90 && position.angle < 270 ? position.angle - 180 : position.angle;
            return (
              <SvgText key={position.name} x={point.x} y={point.y + 3} textAnchor="middle" fontSize={8.5} fontWeight="600" letterSpacing={0.4} fill={colors.textMuted} transform={`rotate(${rotation}, ${point.x}, ${point.y})`}>
                {position.name}
              </SvgText>
            );
          })}
        </Svg>
      </View>
      <AppText variant="caption" color="textFaint" style={{ fontSize: 10 }}>Field positions shown for a right-handed batter</AppText>
      <View style={{ flexDirection: 'row', gap: 18 }}>
        {[{ label: '1–3 runs', runs: 1 }, { label: 'Four', runs: 4 }, { label: 'Six', runs: 6 }].map((item) => (
          <View key={item.runs} style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}><View style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: shotColor(item.runs) }} /><AppText variant="caption" color="textMuted">{item.label}</AppText></View>
        ))}
      </View>
    </View>
  );
}
