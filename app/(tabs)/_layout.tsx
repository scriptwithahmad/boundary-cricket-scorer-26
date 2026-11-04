import React from 'react';
import { Tabs } from 'expo-router';
import { House, History, Settings, TrendingUp, Users } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fonts, useTheme } from '@/src/theme';
import { createTabBarStyle } from '@/src/theme/tabBar';
import { haptic } from '@/src/lib/haptics';

export default function TabLayout() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenListeners={{ tabPress: () => haptic.tap() }}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textFaint,
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: createTabBarStyle(colors, insets.bottom),
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color }) => <House size={22} color={color} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="teams" options={{ title: 'Teams', tabBarIcon: ({ color }) => <Users size={22} color={color} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Matches', tabBarIcon: ({ color }) => <History size={22} color={color} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: ({ color }) => <TrendingUp size={22} color={color} strokeWidth={2.2} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color }) => <Settings size={22} color={color} strokeWidth={2.2} /> }} />
    </Tabs>
  );
}
