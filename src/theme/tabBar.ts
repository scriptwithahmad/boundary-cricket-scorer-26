import { Platform, type ViewStyle } from 'react-native';
import type { Palette } from './index';

export function createTabBarStyle(colors: Palette, insetBottom: number): ViewStyle {
  const bottom = Math.max(insetBottom, Platform.OS === 'android' ? 8 : 0);

  return {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 72 + bottom,
    paddingBottom: bottom + 10,
    paddingTop: 10,
    elevation: 0,
  };
}
