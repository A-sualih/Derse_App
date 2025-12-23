import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DRIVE_FILES } from '@/src/constants/mockData';
import { useAudio } from '@/src/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MiniPlayer: React.FC = () => {
    const {
        isPlaying,
        currentUri,
        currentTitle,
        isLoading,
        position,
        duration,
        playSound,
        pauseSound,
        seekScroll,
        skip,
        nextTrack,
        previousTrack,
        playbackSpeed,
        setPlaybackSpeed
    } = useAudio();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const [showTrackList, setShowTrackList] = useState(false);

    if (!currentUri) return null;

    // Define audioFiles for the list modal
    const audioFiles = DRIVE_FILES.filter(file => file.type === 'audio');

    // Use title from context, or fallback to "Audio"
    const trackName = currentTitle || 'Audio';

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseSound();
        } else if (currentUri) {
            playSound(currentUri);
        }
    };

    const handleSpeedCycle = () => {
        const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
        const currentIndex = speeds.indexOf(playbackSpeed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        setPlaybackSpeed(speeds[nextIndex]);
    };

    return (
        <>
            <View style={[styles.container, { backgroundColor: theme.tint }]}>
                <View style={styles.header}>
                    <Text style={[styles.title, { color: colorScheme === 'dark' ? '#000' : '#fff' }]} numberOfLines={1}>{trackName}</Text>
                    <View style={styles.headerButtons}>
                        <TouchableOpacity onPress={handleSpeedCycle} style={styles.speedBtn}>
                            <Text style={[styles.speedText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>{playbackSpeed}x</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => setShowTrackList(true)} style={styles.iconBtn}>
                            <Ionicons name="list" size={24} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={handlePlayPause} style={styles.playBtn}>
                            {isLoading ? (
                                <ActivityIndicator color={colorScheme === 'dark' ? '#000' : '#fff'} />
                            ) : (
                                <Ionicons
                                    name={isPlaying ? "pause" : "play"}
                                    size={28}
                                    color={colorScheme === 'dark' ? '#000' : '#fff'}
                                />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.controlsRow}>
                    <TouchableOpacity onPress={previousTrack} style={styles.skipBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="play-skip-back" size={24} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => skip(-10)} style={styles.skipBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="play-back" size={20} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                    </TouchableOpacity>

                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        onSlidingComplete={seekScroll}
                        minimumTrackTintColor={colorScheme === 'dark' ? '#000' : '#fff'}
                        maximumTrackTintColor={colorScheme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'}
                        thumbTintColor={colorScheme === 'dark' ? '#000' : '#fff'}
                    />

                    <TouchableOpacity onPress={() => skip(10)} style={styles.skipBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="play-forward" size={20} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={nextTrack} style={styles.skipBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                        <Ionicons name="play-skip-forward" size={24} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                    </TouchableOpacity>
                </View>
            </View>

            <Modal
                visible={showTrackList}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowTrackList(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.background }]}>
                        <View style={styles.modalHeader}>
                            <Text style={[styles.modalTitle, { color: theme.text }]}>All Audio Tracks</Text>
                            <TouchableOpacity onPress={() => setShowTrackList(false)}>
                                <Ionicons name="close" size={28} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={audioFiles}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.trackItem,
                                        { backgroundColor: item.url === currentUri ? theme.tint : 'transparent' }
                                    ]}
                                    onPress={() => {
                                        playSound(item.url, item.name, undefined, item.id);
                                        setShowTrackList(false);
                                    }}
                                >
                                    <Text style={[
                                        styles.trackName,
                                        { color: item.url === currentUri ? (colorScheme === 'dark' ? '#000' : '#fff') : theme.text }
                                    ]}>
                                        {item.name}
                                    </Text>
                                </TouchableOpacity>
                            )}
                        />
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#007AFF',
        padding: 15,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.3,
        shadowRadius: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 10,
    },
    title: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    iconBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedBtn: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)',
    },
    speedText: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    playBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    slider: {
        flex: 1,
        height: 40,
        marginHorizontal: 10,
    },
    skipBtn: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    trackItem: {
        padding: 15,
        borderRadius: 10,
        marginBottom: 8,
    },
    trackName: {
        fontSize: 16,
    },
});
