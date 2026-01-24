import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DRIVE_FILES } from '@/src/constants/mockData';
import { useAudio } from '@/src/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

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

    const audioFiles = DRIVE_FILES.filter(file => file.type === 'audio');
    const trackName = currentTitle || 'ተከታታይ ደርሶች';

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
            <View style={[styles.container, { backgroundColor: theme.surface, borderTopColor: theme.border }, Shadows.lg]}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.infoContainer}>
                            <Ionicons name="musical-note" size={20} color={theme.primary} style={styles.titleIcon} />
                            <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{trackName}</Text>
                        </View>
                        <View style={styles.headerButtons}>
                            <TouchableOpacity onPress={handleSpeedCycle} style={[styles.speedBtn, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}>
                                <Text style={[styles.speedText, { color: theme.primary }]}>{playbackSpeed}x</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => setShowTrackList(true)} style={styles.iconBtn}>
                                <Ionicons name="list" size={24} color={theme.icon} />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <Slider
                        style={styles.slider}
                        minimumValue={0}
                        maximumValue={duration}
                        value={position}
                        onSlidingComplete={seekScroll}
                        minimumTrackTintColor={theme.primary}
                        maximumTrackTintColor={theme.border}
                        thumbTintColor={theme.primary}
                    />

                    <View style={styles.controlsRow}>
                        <View style={styles.timeRow}>
                            <Text style={[styles.timeText, { color: theme.secondaryText }]}>
                                {(() => {
                                    const totalSeconds = Math.floor(position / 1000);
                                    const minutes = Math.floor(totalSeconds / 60);
                                    const seconds = Math.floor(totalSeconds % 60);
                                    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                })()}
                            </Text>
                            <Text style={[styles.timeText, { color: theme.secondaryText }]}>
                                {(() => {
                                    const totalSeconds = Math.floor(duration / 1000);
                                    const minutes = Math.floor(totalSeconds / 60);
                                    const seconds = Math.floor(totalSeconds % 60);
                                    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
                                })()}
                            </Text>
                        </View>

                        <View style={styles.mainControls}>
                            <TouchableOpacity onPress={previousTrack} style={styles.iconBtn}>
                                <Ionicons name="play-skip-back" size={20} color={theme.text} />
                            </TouchableOpacity>

                            {/* Circular Skip -10 */}
                            <TouchableOpacity onPress={() => skip(-10)} style={[styles.skipCircleBtn, { borderColor: theme.secondaryText }]}>
                                <Text style={[styles.skipText, { color: theme.secondaryText }]}>-10</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={handlePlayPause} style={[styles.playBtn, { backgroundColor: theme.primary }]}>
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="small" />
                                ) : (
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={28}
                                        color="#fff"
                                        style={!isPlaying ? { marginLeft: 3 } : null}
                                    />
                                )}
                            </TouchableOpacity>

                            {/* Circular Skip +10 */}
                            <TouchableOpacity onPress={() => skip(10)} style={[styles.skipCircleBtn, { borderColor: theme.secondaryText }]}>
                                <Text style={[styles.skipText, { color: theme.secondaryText }]}>+10</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={nextTrack} style={styles.iconBtn}>
                                <Ionicons name="play-skip-forward" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
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
                            <View>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>ደርሶች</Text>
                                <Text style={[styles.modalSubTitle, { color: theme.secondaryText }]}>{audioFiles.length} ፋይሎች</Text>
                            </View>
                            <TouchableOpacity onPress={() => setShowTrackList(false)} style={[styles.closeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                <Ionicons name="close" size={24} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                        <FlatList
                            data={audioFiles}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.trackItem,
                                        {
                                            backgroundColor: item.url === currentUri ? theme.primary + '15' : theme.surface,
                                            borderColor: item.url === currentUri ? theme.primary + '30' : theme.border
                                        }
                                    ]}
                                    onPress={() => {
                                        playSound(item.url, item.name, undefined, item.id);
                                        setShowTrackList(false);
                                    }}
                                >
                                    <View style={styles.trackInfo}>
                                        <Ionicons
                                            name={item.url === currentUri ? "volume-medium" : "musical-note-outline"}
                                            size={20}
                                            color={item.url === currentUri ? theme.primary : theme.icon}
                                            style={styles.trackIcon}
                                        />
                                        <Text style={[
                                            styles.trackName,
                                            {
                                                color: item.url === currentUri ? theme.primary : theme.text,
                                                fontWeight: item.url === currentUri ? '700' : '500'
                                            }
                                        ]} numberOfLines={1}>
                                            {item.name}
                                        </Text>
                                    </View>
                                    {item.url === currentUri && (
                                        <Ionicons name="checkmark-circle" size={20} color={theme.primary} />
                                    )}
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.modalList}
                            showsVerticalScrollIndicator={false}
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
        bottom: Platform.OS === 'ios' ? 20 : 10,
        left: Spacing.sm,
        right: Spacing.sm,
        paddingBottom: Spacing.sm,
        backgroundColor: 'rgba(255, 255, 255, 0.95)', // Glass-like feel (dynamic in dark mode in real app, here checking theme)
        borderRadius: Radius.xl,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
        elevation: 10,
    },
    content: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.sm,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    infoContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
        marginRight: Spacing.md,
    },
    titleIcon: {
        marginRight: Spacing.xs,
        opacity: 0.8,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
    },
    iconBtn: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    speedBtn: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: Radius.full,
        borderWidth: 1,
        marginRight: 4,
    },
    speedText: {
        fontSize: 10,
        fontWeight: '800',
    },
    controlsRow: {
        marginTop: 0,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: Spacing.xs,
        paddingHorizontal: Spacing.xs,
    },
    timeText: {
        fontSize: 10,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
        opacity: 0.6,
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between', // Distribute evenly
        paddingHorizontal: Spacing.lg,
        paddingBottom: 4,
    },
    playBtn: {
        width: 58,
        height: 58,
        borderRadius: 29,
        alignItems: 'center',
        justifyContent: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
    },
    slider: {
        width: '100%',
        height: 24, // Lower height to be less obtrusive
        marginVertical: 4,
    },
    skipCircleBtn: {
        width: 44,
        height: 44,
        borderRadius: 22,
        borderWidth: 1.5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.02)',
    },
    skipText: {
        fontSize: 11,
        fontWeight: '800',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        height: '80%',
        borderTopLeftRadius: Radius.xxl,
        borderTopRightRadius: Radius.xxl,
        padding: Spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.xl,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    modalSubTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginTop: 2,
    },
    closeBtn: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    modalList: {
        paddingBottom: Spacing.xl,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: Spacing.md,
        borderRadius: Radius.lg,
        marginBottom: Spacing.sm,
        borderWidth: 1,
    },
    trackInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    trackIcon: {
        marginRight: Spacing.md,
    },
    trackName: {
        fontSize: 16,
        flex: 1,
    },
});
