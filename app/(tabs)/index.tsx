import React from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { FileListItem } from '../../src/components/FileListItem';
import { DRIVE_FILES } from '../../src/constants/mockData';
import { useAudioPlayer } from '../../src/hooks/useAudioPlayer';

export default function App() {
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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Drive Files</Text>
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
    backgroundColor: '#F5F5F5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    paddingVertical: 10,
  },
});
