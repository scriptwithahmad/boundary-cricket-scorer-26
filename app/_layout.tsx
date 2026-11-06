if (typeof document !== 'undefined' && String(console.error).indexOf('gvSvgOrigin') < 0) {
  var __gvConsoleError = console.error;
  console.error = function gvSvgOrigin() {
    var __gvMsg = Array.prototype.join.call(arguments, ' ');
    if (__gvMsg.indexOf('Invalid DOM property') >= 0 && __gvMsg.indexOf('transform-origin') >= 0) return;
    return __gvConsoleError.apply(console, Array.prototype.slice.call(arguments));
  };
}

if (typeof document !== 'undefined' && !document.getElementById('genvibe-inspector')) {
  var __gvInspector = document.createElement('script');
  __gvInspector.id = 'genvibe-inspector';
  __gvInspector.src = 'https://genvibe.pro/inspector-script.js?v=e2b-capture2';
  document.head.appendChild(__gvInspector);
}

import { useCallback, useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFonts } from 'expo-font';
import { PlusJakartaSans_400Regular } from '@expo-google-fonts/plus-jakarta-sans/400Regular';
import { PlusJakartaSans_500Medium } from '@expo-google-fonts/plus-jakarta-sans/500Medium';
import { PlusJakartaSans_600SemiBold } from '@expo-google-fonts/plus-jakarta-sans/600SemiBold';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { PlusJakartaSans_800ExtraBold } from '@expo-google-fonts/plus-jakarta-sans/800ExtraBold';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ThemeProvider, useTheme } from '@/src/theme';
import { StoreProvider } from '@/src/store';
import { StartupScreen } from '@/src/components/StartupScreen';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Shell({ onReady }: { onReady: () => void }) {
  const { colors, isDark } = useTheme();
  useEffect(onReady, [onReady]);
  return (
    <>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.bg },
          animation: 'slide_from_right',
        }}
      >
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="match/new" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="+not-found" />
      </Stack>
      <StatusBar style={isDark ? 'light' : 'dark'} />
    </>
  );
}

export default function RootLayout() {
  useFrameworkReady();
  const [appReady, setAppReady] = useState(false);
  const [showStartup, setShowStartup] = useState(true);
  const markReady = useCallback(() => setAppReady(true), []);
  const finishStartup = useCallback(() => setShowStartup(false), []);
  const hideNativeSplash = useCallback(() => SplashScreen.hideAsync().catch(() => {}), []);
  const [loaded, error] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  // Gesture handler's GestureDetector / ReanimatedSwipeable only work inside this root
  // view — without it they throw a render error on device.
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      {(loaded || error) ? <SafeAreaProvider>
        <ThemeProvider>
          <StoreProvider>
            <Shell onReady={markReady} />
          </StoreProvider>
        </ThemeProvider>
      </SafeAreaProvider> : null}
      {showStartup ? <StartupScreen ready={appReady} onFinish={finishStartup} onLayout={hideNativeSplash} /> : null}
    </GestureHandlerRootView>
  );
}
