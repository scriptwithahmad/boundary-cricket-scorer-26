import React from 'react';
import { Platform } from 'react-native';
import { Tabs } from 'expo-router';
import { House, History, TrendingUp, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, useTheme } from '@/src/theme';
import { haptic } from '@/src/lib/haptics';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottom = Math.max(insets.bottom, Platform.OS === 'android' ? 8 : 0);
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.tap() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72 + bottom,
          paddingBottom: bottom + 10,
          paddingTop: 10,
          elevation: 0,
        },
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <House size={22} color={color} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="teams" options={{ title: 'Teams', tabBarIcon: ({ color }) => <Users size={22} color={color} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Matches', tabBarIcon: ({ color }) => <History size={22} color={color} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: ({ color }) => <TrendingUp size={22} color={color} strokeWidth={2.2} /> }} />
    </Tabs>
  );
}
