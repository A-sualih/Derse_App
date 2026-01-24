import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { DRIVE_FILES } from '@/src/constants/mockData';
import { useAudio } from '@/src/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React, { useState } from 'react';
import { ActivityIndicator, Dimensions, FlatList, Modal, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const { width, height } = Dimensions.get('window');

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
    const [isExpanded, setIsExpanded] = useState(false);
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

    const formatTime = (ms: number) => {
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const getProgressPercent = () => {
        if (duration === 0) return 0;
        return (position / duration) * 100;
    };

    // Mini Player Component
    const MiniBar = () => (
        <TouchableOpacity
            style={[
                styles.miniContainer,
                { backgroundColor: theme.surface, borderTopColor: theme.border },
                Shadows.lg
            ]}
            onPress={() => setIsExpanded(true)}
            activeOpacity={0.9}
        >
            {/* Progress Bar Line */}
            <View style={[styles.miniProgressBar, { backgroundColor: theme.border }]}>
                <View style={[styles.miniProgressFill, { width: `${getProgressPercent()}%`, backgroundColor: theme.primary }]} />
            </View>

            <View style={styles.miniContent}>
                <View style={[styles.miniIconBg, { backgroundColor: theme.primary + '15' }]}>
                    <Ionicons name="musical-notes" size={20} color={theme.primary} />
                </View>

                <View style={styles.miniTextContainer}>
                    <Text style={[styles.miniTitle, { color: theme.text }]} numberOfLines={1}>
                        {trackName}
                    </Text>
                    <Text style={[styles.miniSubtitle, { color: theme.secondaryText }]} numberOfLines={1}>
                        {isPlaying ? 'Playing' : 'Paused'} • {formatTime(position)} / {formatTime(duration)}
                    </Text>
                </View>

                <TouchableOpacity
                    onPress={(e) => {
                        e.stopPropagation();
                        handlePlayPause();
                    }}
                    style={[styles.miniPlayBtn, { backgroundColor: theme.primary }]}
                >
                    {isLoading ? (
                        <ActivityIndicator color="#fff" size="small" />
                    ) : (
                        <Ionicons name={isPlaying ? "pause" : "play"} size={22} color="#fff" style={!isPlaying ? { marginLeft: 2 } : null} />
                    )}
                </TouchableOpacity>
            </View>
        </TouchableOpacity>
    );

    // Full Player Component
    return (
        <>
            <MiniBar />

            <Modal
                visible={isExpanded}
                animationType="slide"
                presentationStyle="pageSheet"
                onRequestClose={() => setIsExpanded(false)}
            >
                <View style={[styles.fullContainer, { backgroundColor: theme.background }]}>

                    {/* Header */}
                    <View style={styles.fullHeader}>
                        <TouchableOpacity onPress={() => setIsExpanded(false)} style={styles.headerBtn}>
                            <Ionicons name="chevron-down" size={28} color={theme.text} />
                        </TouchableOpacity>
                        <Text style={[styles.headerTitle, { color: theme.secondaryText }]}>NOW PLAYING</Text>
                        <TouchableOpacity onPress={() => setShowTrackList(true)} style={styles.headerBtn}>
                            <Ionicons name="list" size={24} color={theme.text} />
                        </TouchableOpacity>
                    </View>

                    {/* Album Art / Icon */}
                    <View style={styles.artContainer}>
                        <View style={[styles.albumArt, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                            <Ionicons name="musical-note" size={80} color={theme.primary} />
                        </View>
                    </View>

                    {/* Track Info */}
                    <View style={styles.trackDetails}>
                        <Text style={[styles.fullTitle, { color: theme.text }]} numberOfLines={2}>
                            {trackName}
                        </Text>
                    </View>

                    {/* Slider & Time */}
                    <View style={styles.sliderContainer}>
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
                        <View style={styles.timeRow}>
                            <Text style={[styles.timeText, { color: theme.secondaryText }]}>{formatTime(position)}</Text>
                            <Text style={[styles.timeText, { color: theme.secondaryText }]}>{formatTime(duration)}</Text>
                        </View>
                    </View>

                    {/* Controls */}
                    <View style={styles.controlsContainer}>
                        <View style={styles.row}>
                            <TouchableOpacity onPress={handleSpeedCycle} style={[styles.speedBtn, { backgroundColor: theme.primary + '15' }]}>
                                <Text style={[styles.speedText, { color: theme.primary }]}>{playbackSpeed}x</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={styles.mainControls}>
                            <TouchableOpacity onPress={previousTrack} style={styles.controlBtn}>
                                <Ionicons name="play-skip-back" size={28} color={theme.text} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => skip(-10)} style={styles.skipBtn}>
                                <Ionicons name="reload-circle-outline" size={32} color={theme.secondaryText} style={{ transform: [{ scaleX: -1 }] }} />
                            </TouchableOpacity>


                            <TouchableOpacity onPress={handlePlayPause} style={[styles.playBtnLarge, { backgroundColor: theme.primary, shadowColor: theme.primary }]}>
                                {isLoading ? (
                                    <ActivityIndicator color="#fff" size="large" />
                                ) : (
                                    <Ionicons
                                        name={isPlaying ? "pause" : "play"}
                                        size={36}
                                        color="#fff"
                                        style={!isPlaying ? { marginLeft: 4 } : null}
                                    />
                                )}
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => skip(10)} style={styles.skipBtn}>
                                <Ionicons name="reload-circle-outline" size={32} color={theme.secondaryText} />
                            </TouchableOpacity>

                            <TouchableOpacity onPress={nextTrack} style={styles.controlBtn}>
                                <Ionicons name="play-skip-forward" size={28} color={theme.text} />
                            </TouchableOpacity>
                        </View>
                    </View>
                    <View style={{ height: 40 }} />
                </View>

                {/* Playlist Modal (Nested) */}
                <Modal
                    visible={showTrackList}
                    animationType="slide"
                    transparent={true}
                    onRequestClose={() => setShowTrackList(false)}
                >
                    <View style={styles.modalOverlay}>
                        <View style={[styles.playlistContent, { backgroundColor: theme.background }]}>
                            <View style={styles.modalHeader}>
                                <Text style={[styles.modalTitle, { color: theme.text }]}>Up Next</Text>
                                <TouchableOpacity onPress={() => setShowTrackList(false)} style={[styles.closeBtn, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                                    <Ionicons name="close" size={20} color={theme.text} />
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
                                                backgroundColor: item.url === currentUri ? theme.primary + '15' : 'transparent',
                                            }
                                        ]}
                                        onPress={() => {
                                            playSound(item.url, item.name, undefined, item.id);
                                            setShowTrackList(false);
                                        }}
                                    >
                                        <View style={styles.trackInfo}>
                                            <Ionicons
                                                name={item.url === currentUri ? "stats-chart" : "musical-note"}
                                                size={18}
                                                color={item.url === currentUri ? theme.primary : theme.secondaryText}
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
                                    </TouchableOpacity>
                                )}
                                contentContainerStyle={styles.modalList}
                                showsVerticalScrollIndicator={false}
                            />
                        </View>
                    </View>
                </Modal>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    // Mini Player Styles
    miniContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 24 : 16,
        left: Spacing.md,
        right: Spacing.md,
        height: 64,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
        justifyContent: 'center',
        elevation: 8,
    },
    miniProgressBar: {
        position: 'absolute',
        top: 0,
        left: 16,
        right: 16,
        height: 3,
        borderRadius: 2,
        overflow: 'hidden',
    },
    miniProgressFill: {
        height: '100%',
        borderRadius: 2,
    },
    miniContent: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    miniIconBg: {
        width: 40,
        height: 40,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: Spacing.sm,
    },
    miniTextContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    miniTitle: {
        fontSize: 14,
        fontWeight: '700',
        marginBottom: 2,
    },
    miniSubtitle: {
        fontSize: 11,
        fontWeight: '500',
    },
    miniPlayBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: Spacing.sm,
    },

    // Full Player Styles
    fullContainer: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 48 : 24,
        paddingHorizontal: Spacing.lg,
    },
    fullHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: Spacing.xl,
    },
    headerBtn: {
        padding: Spacing.xs,
        opacity: 0.8,
    },
    headerTitle: {
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
    },
    artContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginVertical: Spacing.xl,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 20 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
        elevation: 10,
    },
    albumArt: {
        width: width * 0.7,
        height: width * 0.7,
        borderRadius: 24,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trackDetails: {
        alignItems: 'center',
        marginBottom: Spacing.xl,
        marginTop: Spacing.md,
    },
    fullTitle: {
        fontSize: 22,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: -0.5,
    },
    sliderContainer: {
        marginBottom: Spacing.xl,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -10,
        paddingHorizontal: Spacing.xs,
    },
    timeText: {
        fontSize: 12,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
    },
    controlsContainer: {
        alignItems: 'center',
    },
    row: {
        flexDirection: 'row',
        marginBottom: Spacing.lg,
    },
    speedBtn: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: Radius.full,
    },
    speedText: {
        fontSize: 12,
        fontWeight: '700',
    },
    mainControls: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: '100%',
        paddingHorizontal: Spacing.md,
    },
    controlBtn: {
        padding: Spacing.sm,
    },
    skipBtn: {
        padding: Spacing.sm,
        opacity: 0.8,
    },
    playBtnLarge: {
        width: 72,
        height: 72,
        borderRadius: 36,
        alignItems: 'center',
        justifyContent: 'center',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 12,
        elevation: 12,
    },

    // Playlist Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    playlistContent: {
        height: '60%',
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        padding: Spacing.lg,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.md,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: '700',
    },
    closeBtn: {
        padding: 4,
        borderRadius: 12,
        borderWidth: 1,
    },
    modalList: {
        paddingBottom: Spacing.xl,
    },
    trackItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.03)',
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
        fontSize: 15,
        flex: 1,
    },
});
