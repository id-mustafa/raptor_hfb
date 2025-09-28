import '@/global.css';

import { NAV_THEME } from '@/lib/theme';
import { ThemeProvider } from '@react-navigation/native';
import { PortalHost } from '@rn-primitives/portal';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'nativewind';
import { useEffect } from 'react';
import { AuthProvider } from '../utils/AuthProvider';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { LogBox } from 'react-native';

export {
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { setColorScheme } = useColorScheme();

  useEffect(() => {
    setColorScheme('dark');
  }, []);

  LogBox.ignoreAllLogs();

  return (
    <AuthProvider>
      <GestureHandlerRootView style={{ flex: 1, backgroundColor: NAV_THEME.dark.colors.background }}>
        <ThemeProvider value={NAV_THEME.dark}>
          <StatusBar style="light" />
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: NAV_THEME.dark.colors.background,
              },
              headerTintColor: NAV_THEME.dark.colors.text,
              headerShadowVisible: false,
            }}
          />
          <PortalHost />
        </ThemeProvider>
      </GestureHandlerRootView>
    </AuthProvider>
  );
}