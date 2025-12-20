import React from 'react';
import { FlatList, SafeAreaView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { FileListItem } from './src/components/FileListItem';
import { DRIVE_FILES } from './src/constants/mockData';
import { useAudioPlayer } from './src/hooks/useAudioPlayer';

export default function App() {
    const { playSound, pauseSound, isPlaying, currentUri, isLoading } = useAudioPlayer();

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Drive Files</Text>
            </View>
            <FlatList
                data={DRIVE_FILES}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                    <FileListItem
                        file={item}
                        onPlay={playSound}
                        onPause={pauseSound}
                        isPlaying={isPlaying}
                        isCurrent={currentUri?.endsWith(encodeURIComponent(item.name))}
                        isAudioLoading={isLoading}
                    />
                )}
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
