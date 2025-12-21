import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useFileDownloader } from '@/src/hooks/useFileDownloader';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { DriveFile } from '../types';

interface FileListItemProps {
    file: DriveFile;
    onPlay?: (uri: string) => void;
    onPause?: () => void;
    onSeek?: (value: number) => void;
    isPlaying?: boolean;
    isCurrent?: boolean;
    isAudioLoading?: boolean;
    position?: number;
    duration?: number;
}

export const FileListItem: React.FC<FileListItemProps> = ({
    file,
    onPlay,
    onPause,
    onSeek,
    isPlaying,
    isCurrent,
    isAudioLoading,
    position = 0,
    duration = 0
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const { downloaded, loading, download, remove, localUri } = useFileDownloader(file.name, file.url);
    const router = useRouter();

    const handleOpenPdf = async () => {
        if (localUri && downloaded) {
            if (Platform.OS === 'web') {
                Linking.openURL(localUri);
                return;
            }

            // Navigate to In-App PDF Viewer
            router.push({
                pathname: '/pdf-viewer',
                params: {
                    url: localUri,
                    remoteUrl: file.url,
                    name: file.name
                }
            });
        }
    };

    const handleAudioPress = () => {
        if (!localUri) return;

        if (isCurrent && isPlaying && onPause) {
            onPause();
        } else if (onPlay) {
            onPlay(localUri);
        }
    };

    const formatTime = (millis: number) => {
        const totalSeconds = millis / 1000;
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const renderAction = () => {
        if (loading) {
            return (
                <View style={styles.actionContainer}>
                    <ActivityIndicator size="small" color={theme.tint} />
                </View>
            );
        }

        if (!downloaded) {
            return (
                <TouchableOpacity onPress={download} style={styles.downloadButton}>
                    <Ionicons name="cloud-download-outline" size={24} color={theme.tint} />
                </TouchableOpacity>
            );
        }

        // File is downloaded
        return (
            <View style={styles.actions}>
                {file.type === 'audio' ? (
                    <TouchableOpacity onPress={handleAudioPress} style={styles.actionButton}>
                        {isAudioLoading && isCurrent ? (
                            <ActivityIndicator size="small" color={theme.tint} />
                        ) : (
                            <Ionicons
                                name={isCurrent && isPlaying ? "pause-circle" : "play-circle"}
                                size={40}
                                color={theme.tint}
                            />
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleOpenPdf} style={styles.actionButton}>
                        <Ionicons name="document-text-outline" size={32} color={theme.tint} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={remove} style={[styles.actionButton, { marginLeft: 15 }]}>
                    <Ionicons name="trash-outline" size={24} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: theme.background, borderBottomColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }]}>
            <View style={styles.mainRow}>
                <View style={styles.info}>
                    <Ionicons
                        name={file.type === 'audio' ? 'musical-note' : 'document'}
                        size={24}
                        color={theme.icon}
                        style={styles.icon}
                    />
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{file.name}</Text>
                        <Text style={[styles.status, { color: theme.icon + '80' }]}>
                            {downloaded ? 'Downloaded' : 'Not downloaded'}
                        </Text>
                    </View>
                </View>
                {renderAction()}
            </View>

            {isCurrent && file.type === 'audio' && (
                <View style={styles.progressContainer}>
                    <View style={styles.controlsRow}>
                        <TouchableOpacity onPress={() => onSeek && onSeek(Math.max(0, position - 10000))} style={styles.controlBtn}>
                            <Ionicons name="refresh-outline" size={24} color="#007AFF" />
                            <Text style={styles.controlText}>-10s</Text>
                        </TouchableOpacity>

                        <View style={{ flex: 1 }}>
                            <Slider
                                style={styles.slider}
                                minimumValue={0}
                                maximumValue={duration}
                                value={position}
                                onSlidingComplete={onSeek}
                                minimumTrackTintColor="#007AFF"
                                maximumTrackTintColor="#D1D1D1"
                                thumbTintColor="#007AFF"
                            />
                        </View>

                        <TouchableOpacity onPress={() => onSeek && onSeek(Math.min(duration, position + 10000))} style={styles.controlBtn}>
                            <Ionicons name="refresh-outline" size={24} color="#007AFF" style={{ transform: [{ scaleX: -1 }] }} />
                            <Text style={styles.controlText}>+10s</Text>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.timeLabels}>
                        <Text style={styles.timeText}>{formatTime(position)}</Text>
                        <Text style={styles.timeText}>{formatTime(duration)}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
        paddingVertical: 8,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    icon: {
        marginRight: 12,
    },
    name: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
    },
    status: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    actionContainer: {
        width: 40,
        alignItems: 'center',
    },
    downloadButton: {
        padding: 8,
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    progressContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    controlBtn: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 5,
    },
    controlText: {
        fontSize: 10,
        color: '#007AFF',
        marginTop: -2,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: -8,
        paddingHorizontal: 40,
    },
    timeText: {
        fontSize: 12,
        color: '#666',
    },
});
