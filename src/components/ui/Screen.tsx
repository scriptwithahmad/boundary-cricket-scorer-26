import React, { ReactNode } from 'react';
import { LayoutChangeEvent, ScrollView, StyleProp, View, ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '@/src/theme';
import { styles } from './styles';

export function Screen({
  children,
  scroll = true,
  fillContent = false,
  edges = ['top'],
  footer,
  contentStyle,
  onLayout,
}: {
  children: ReactNode;
  scroll?: boolean;
  fillContent?: boolean;
  edges?: ('top' | 'bottom')[];
  footer?: ReactNode;
  contentStyle?: StyleProp<ViewStyle>;
  onLayout?: (event: LayoutChangeEvent) => void;
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView edges={edges} style={{ flex: 1, backgroundColor: colors.bg }}>
      {scroll ? (
        <ScrollView
          onLayout={onLayout}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.scrollContent, fillContent && { flexGrow: 1 }, contentStyle]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={[styles.maxWidth, fillContent && { flexGrow: 1 }]}>{children}</View>
        </ScrollView>
      ) : (
        <View onLayout={onLayout} style={[{ flex: 1 }, styles.scrollContent, contentStyle]}>
          <View style={[styles.maxWidth, { flex: 1 }]}>{children}</View>
        </View>
      )}
      {footer ? (
        <View style={[styles.footer, { borderTopColor: colors.border, backgroundColor: colors.bg }]}>
          <View style={styles.maxWidth}>{footer}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}
