import React from 'react';
import { Tabs } from 'expo-router';
import { TabIcon } from "@/src/features/navigation/components/TabIcon";
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
        tabBarLabelPosition: 'below-icon',
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 11 },
        tabBarStyle: createTabBarStyle(colors, insets.bottom),
        sceneStyle: { backgroundColor: colors.bg },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, focused }) => <TabIcon name="home" color={color} focused={focused} /> }} />
      <Tabs.Screen name="teams" options={{ title: 'Teams', tabBarIcon: ({ color, focused }) => <TabIcon name="teams" color={color} focused={focused} /> }} />
      <Tabs.Screen name="history" options={{ title: 'Matches', tabBarIcon: ({ color, focused }) => <TabIcon name="matches" color={color} focused={focused} /> }} />
      <Tabs.Screen name="stats" options={{ title: 'Stats', tabBarIcon: ({ color, focused }) => <TabIcon name="stats" color={color} focused={focused} /> }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings', tabBarIcon: ({ color, focused }) => <TabIcon name="settings" color={color} focused={focused} /> }} />
    </Tabs>
  );
}
