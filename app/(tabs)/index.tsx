import { Colors } from '@/constants/theme';
import { FileListItem } from '@/src/components/FileListItem';
import { DRIVE_FILES } from '@/src/constants/mockData';
import { useTheme } from '@/src/context/ThemeContext';
import { useAudioPlayer } from '@/src/hooks/useAudioPlayer';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const router = useRouter();
  const { colorScheme, setThemePreference } = useTheme();
  const theme = Colors[colorScheme];

  const {
    playSound,
    pauseSound,
    seekScroll,
    isPlaying,
    currentUri,
    isLoading,
    position,
    duration
  } = useAudioPlayer();

  const toggleTheme = () => {
    setThemePreference(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>ሙምቲዕ ደርስ በ ኡስታዝ አቡ ጁወይሪያ</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/about')} style={styles.iconButton}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <Ionicons
                name={colorScheme === 'dark' ? "sunny" : "moon"}
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <FlatList
        data={DRIVE_FILES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isItemCurrent = currentUri?.endsWith(encodeURIComponent(item.name));
          return (
            <FileListItem
              file={item}
              onPlay={playSound}
              onPause={pauseSound}
              onSeek={seekScroll}
              isPlaying={isPlaying}
              isCurrent={isItemCurrent}
              isAudioLoading={isLoading}
              position={isItemCurrent ? position : 0}
              duration={isItemCurrent ? duration : 0}
            />
          );
        }}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
  themeToggle: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 10,
  },
});
