import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '../hooks/use-color-scheme';
import { AudioProvider } from '../src/context/AudioContext';
import { ThemeProvider as AppThemeProvider } from '../src/context/ThemeContext';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  return (
    <AppThemeProvider>
      <AudioProvider>
        <LayoutContent />
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
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

