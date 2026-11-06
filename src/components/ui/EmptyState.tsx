import React, { ReactNode } from 'react';
import { View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import type { LucideIcon } from 'lucide-react-native';
import { useTheme } from '@/src/theme';
import { AppText } from './AppText';

export function EmptyState({
  icon: Icon,
  title,
  text,
  children,
}: {
  icon: LucideIcon;
  title: string;
  text: string;
  children?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeInDown.duration(400)} style={{ alignItems: 'center', paddingVertical: 48, paddingHorizontal: 24, gap: 12 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' }}>
        <Icon size={32} color={colors.primary} strokeWidth={2} />
      </View>
      <AppText variant="heading" style={{ textAlign: 'center' }}>
        {title}
      </AppText>
      <AppText variant="body" color="textMuted" style={{ textAlign: 'center', maxWidth: 320 }}>
        {text}
      </AppText>
      {children ? <View style={{ alignSelf: 'stretch', gap: 12, marginTop: 12 }}>{children}</View> : null}
    </Animated.View>
  );
}
