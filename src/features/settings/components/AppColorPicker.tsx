import React from 'react';
import { View } from 'react-native';
import { Check } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { AppText, Card, Tap } from '@/src/components/ui';
import { createPalette, THEME_COLORS } from '@/src/theme';
import type { useSettingsController } from '../hooks/useSettingsController';

type Props = Pick<ReturnType<typeof useSettingsController>, 'colors' | 'isDark' | 'themeColor' | 'setThemeColor'>;

export function AppColorPicker({ controller }: { controller: Props }) {
  const { colors, isDark, themeColor, setThemeColor } = controller;
  return (<Card style={{ marginTop: 12, gap: 14 }}>
    <View style={{ gap: 3 }}>
      <AppText variant="bodyStrong">App color</AppText>
      <AppText variant="caption" color="textMuted">
        Personalize backgrounds, cards, buttons and input highlights.
      </AppText>
    </View>
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {THEME_COLORS.map((option) => {
        const selected = themeColor === option.value;
        const preview = createPalette(option.value, isDark);
        return (
          <Tap
            key={option.value}
            onPress={() => setThemeColor(option.value)}
            accessibilityLabel={`${option.label} app theme`}
            accessibilityState={{ selected }}
            style={{
              flexBasis: '28%', flexGrow: 1, minHeight: 86, padding: 10,
              borderRadius: 16, gap: 8, alignItems: 'center',
              backgroundColor: preview.surfaceAlt,
              borderWidth: 2, borderColor: selected ? colors.primary : 'transparent',
            }}
          >
            <LinearGradient
              colors={[preview.primary, isDark ? preview.primary : preview.heroA]}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
              style={{ width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' }}
            >
              {selected ? <Check size={18} color={isDark ? '#11131A' : '#FFFFFF'} strokeWidth={3} /> : null}
            </LinearGradient>
            <AppText variant="caption" color={preview.text} style={{ fontWeight: selected ? '700' : '500' }}>
              {option.label}
            </AppText>
          </Tap>
        );
      })}
    </View>
  </Card>);
}
