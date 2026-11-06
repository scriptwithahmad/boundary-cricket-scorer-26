import React, { ReactNode, useEffect, useState } from 'react';
import { View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import Animated, { Easing, useAnimatedStyle, useReducedMotion, useSharedValue, withTiming } from 'react-native-reanimated';
import { AppText, Tap } from '@/src/components/ui';
import { Avatar } from '@/src/components/cricket/Avatar';
import { ColorPicker } from '@/src/features/teams/components/ColorPicker';
import { TeamBadgePicker } from '@/src/features/teams/components/TeamBadgePicker';
import type { TeamBadge } from '@/src/types/teamBadge';
import { useTheme } from '@/src/theme';

function PickerSection({ title, preview, children }: { title: string; preview: ReactNode; children: ReactNode }) {
  const { colors } = useTheme();
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(true);
  const [height, setHeight] = useState(0);
  const duration = reduced ? 0 : 240;
  const progress = useSharedValue(1);
  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration, easing: Easing.bezier(0.22, 1, 0.36, 1) });
  }, [open, duration, progress]);
  const bodyStyle = useAnimatedStyle(() => ({
    height: progress.value * height,
    opacity: progress.value,
  }));
  const arrowStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 180}deg` }],
  }));
  return (
    <View style={{ backgroundColor: colors.surfaceAlt, borderRadius: 16, overflow: 'hidden' }}>
      <Tap onPress={() => setOpen((value) => !value)} accessibilityRole="button" accessibilityLabel={title} accessibilityState={{ expanded: open }} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 56, paddingHorizontal: 14, borderRadius: 16, backgroundColor: colors.surfaceAlt }}>
        <AppText variant="label" color="textMuted" style={{ flex: 1 }}>{title}</AppText>
        {preview}
        <Animated.View style={arrowStyle}><ChevronDown size={18} color={colors.textMuted} /></Animated.View>
      </Tap>
      <Animated.View style={[{ height: 0, opacity: 0, minHeight: 0, overflow: 'hidden' }, bodyStyle]} pointerEvents={open ? 'auto' : 'none'} accessibilityElementsHidden={!open} importantForAccessibility={open ? 'auto' : 'no-hide-descendants'}>
        <View onLayout={(event) => setHeight(event.nativeEvent.layout.height)} style={{ position: 'absolute', top: 0, left: 0, right: 0, paddingTop: 8, paddingBottom: 14, paddingHorizontal: 14 }}>
          {children}
        </View>
      </Animated.View>
    </View>
  );
}

export function TeamAppearancePicker({ color, onColorChange, badge, onBadgeChange, name }: { color: string; onColorChange: (value: string) => void; badge: TeamBadge; onBadgeChange: (value: TeamBadge) => void; name: string }) {
  return (
    <View style={{ gap: 12 }}>
      <PickerSection title="Team colour" preview={<View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: color }} />}>
        <ColorPicker value={color} onChange={onColorChange} />
      </PickerSection>
      <PickerSection title="Team badge" preview={<Avatar name={name || 'XI'} color={color} size={32} badge={badge} />}>
        <TeamBadgePicker value={badge} onChange={onBadgeChange} color={color} name={name} showLabel={false} plainIcons />
      </PickerSection>
    </View>
  );
}
