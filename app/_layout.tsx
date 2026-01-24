import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';
import { MiniPlayer } from '../src/components/MiniPlayer';
import { AudioProvider } from '../src/context/AudioContext';
import { ThemeProvider as AppThemeProvider } from '../src/context/ThemeContext';
import { UserProvider } from '../src/context/UserContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AudioProvider>
        <UserProvider>
          <LayoutContent />
          <MiniPlayer />
        </UserProvider>
      </AudioProvider>
    </AppThemeProvider>
  );
}

function LayoutContent() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="pdf-viewer" options={{ title: 'PDF Viewer' }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="derse-detail" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

