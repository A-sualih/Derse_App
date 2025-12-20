import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAudio } from '../context/AudioContext';

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

    if (!currentUri) return null;

    // Extract filename from URI for display
    const fileName = decodeURIComponent(currentUri.split('/').pop() || 'Audio');

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title} numberOfLines={1}>{fileName}</Text>
                <TouchableOpacity onPress={pauseSound} style={styles.playBtn}>
                    {isLoading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Ionicons
                            name={isPlaying ? "pause" : "play"}
                            size={28}
                            color="#fff"
                        />
                    )}
                </TouchableOpacity>
            </View>

            <View style={styles.controlsRow}>
                <TouchableOpacity onPress={() => skip(-10)} style={styles.skipBtn}>
                    <Ionicons name="refresh-outline" size={24} color="#fff" />
                </TouchableOpacity>

                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={duration}
                    value={position}
                    onSlidingComplete={seekScroll}
                    minimumTrackTintColor="#fff"
                    maximumTrackTintColor="rgba(255,255,255,0.3)"
                    thumbTintColor="#fff"
                />

                <TouchableOpacity onPress={() => skip(10)} style={styles.skipBtn}>
                    <Ionicons name="refresh-outline" size={24} color="#fff" style={{ transform: [{ scaleX: -1 }] }} />
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
        padding: 10,
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    title: {
        color: '#fff',
        fontSize: 14,
        fontWeight: 'bold',
        flex: 1,
        marginRight: 10,
    },
    playBtn: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    slider: {
        flex: 1,
        height: 30,
    },
    skipBtn: {
        padding: 5,
    }
});
