import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAudio } from '@/src/context/AudioContext';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export const MiniPlayer: React.FC = () => {
    const {
        isPlaying,
        currentUri,
        isLoading,
        position,
        duration,
        playSound,
        pauseSound,
        seekScroll,
        skip
    } = useAudio();
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];

    if (!currentUri) return null;

    // Extract filename from URI for display
    const fileName = decodeURIComponent(currentUri.split('/').pop() || 'Audio');

    const handlePlayPause = () => {
        if (isPlaying) {
            pauseSound();
        } else if (currentUri) {
            playSound(currentUri);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.tint }]}>
            <View style={styles.header}>
                <Text style={[styles.title, { color: colorScheme === 'dark' ? '#000' : '#fff' }]} numberOfLines={1}>{fileName}</Text>
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

            <View style={styles.controlsRow}>
                <TouchableOpacity onPress={() => skip(-10)} style={styles.skipBtn} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    <Ionicons name="play-back-outline" size={28} color={colorScheme === 'dark' ? '#000' : '#fff'} />
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
                    <Ionicons name="play-forward-outline" size={28} color={colorScheme === 'dark' ? '#000' : '#fff'} />
                </TouchableOpacity>
            </View>
        </View>
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
    }
});
