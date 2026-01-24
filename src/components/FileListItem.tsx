import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
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
    onPlay?: (uri: string, title?: string, queue?: any[], fileId?: string) => void;
    onPause?: () => void;
    onSeek?: (value: number) => void;
    isPlaying?: boolean;
    isCurrent?: boolean;
    isAudioLoading?: boolean;
    position?: number;
    duration?: number;
    playbackSpeed?: number;
    onSetSpeed?: (speed: number) => void;
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
    duration = 0,
    playbackSpeed = 1.0,
    onSetSpeed
}) => {
    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const getSafeFilename = (file: DriveFile) => {
        if (file.type === 'pdf') return `${file.id}.pdf`;
        const ext = file.extension || 'mp3';
        return `${file.id}.${ext}`;
    };

    const { downloaded, loading, download, remove, localUri } = useFileDownloader(getSafeFilename(file), file.url);
    const router = useRouter();

    const handleOpenPdf = async () => {
        if (localUri && downloaded) {
            if (Platform.OS === 'web') {
                Linking.openURL(localUri);
                return;
            }

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
            onPlay(localUri, file.name, undefined, file.id);
        }
    };

    const formatTime = (millis: number) => {
        if (!millis || isNaN(millis)) return '0:00';
        const totalSeconds = Math.floor(millis / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
    };

    const renderAction = () => {
        if (loading) {
            return (
                <View style={styles.actionContainer}>
                    <ActivityIndicator size="small" color={theme.primary} />
                </View>
            );
        }

        if (!downloaded) {
            return (
                <TouchableOpacity onPress={download} style={[styles.downloadButton, { backgroundColor: theme.primary + '10' }]}>
                    <Ionicons name="cloud-download" size={20} color={theme.primary} />
                </TouchableOpacity>
            );
        }

        return (
            <View style={styles.actions}>
                {file.type === 'audio' ? (
                    <TouchableOpacity onPress={handleAudioPress} style={styles.playIconBtn}>
                        {isAudioLoading && isCurrent ? (
                            <ActivityIndicator size="small" color={theme.primary} />
                        ) : (
                            <Ionicons
                                name={isCurrent && isPlaying ? "pause-circle" : "play-circle"}
                                size={44}
                                color={theme.primary}
                            />
                        )}
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity onPress={handleOpenPdf} style={styles.pdfIconBtn}>
                        <Ionicons name="document-text" size={32} color={theme.primary} />
                    </TouchableOpacity>
                )}

                <TouchableOpacity onPress={remove} style={styles.deleteBtn}>
                    <Ionicons name="close-circle" size={24} color={theme.error + '90'} />
                </TouchableOpacity>
            </View>
        );
    };

    return (
        <View style={[
            styles.container,
            {
                backgroundColor: isCurrent ? theme.primary + '05' : theme.surface,
                borderColor: isCurrent ? theme.primary + '30' : theme.border
            },
            Shadows.sm
        ]}>
            <View style={styles.mainRow}>
                <View style={styles.info}>
                    <View style={[styles.typeIconContainer, { backgroundColor: theme.primary + '10' }]}>
                        <Ionicons
                            name={file.type === 'audio' ? 'headset' : 'document-text'}
                            size={20}
                            color={theme.primary}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={[styles.name, { color: theme.text }]} numberOfLines={1}>{file.name}</Text>
                        <Text style={[styles.status, { color: theme.secondaryText }]}>
                            {downloaded ? 'ወርዷል' : 'አልወረደም'}
                        </Text>
                    </View>
                </View>
                {renderAction()}
            </View>

            {isCurrent && file.type === 'audio' && (
                <View style={styles.innerPlayer}>
                    <View style={styles.innerSliderRow}>
                        <Slider
                            style={styles.slider}
                            minimumValue={0}
                            maximumValue={duration}
                            value={position}
                            onSlidingComplete={onSeek}
                            minimumTrackTintColor={theme.primary}
                            maximumTrackTintColor={theme.border}
                            thumbTintColor={theme.primary}
                        />
                    </View>
                    <View style={styles.innerTimeRow}>
                        <Text style={[styles.innerTimeText, { color: theme.secondaryText }]}>{formatTime(position)}</Text>
                        <View style={styles.innerControls}>
                            <TouchableOpacity onPress={() => onSeek && onSeek(Math.max(0, position - 10000))} style={styles.innerControlBtn}>
                                <Ionicons name="refresh" size={20} color={theme.secondaryText} />
                                <Text style={[styles.innerControlText, { color: theme.secondaryText }]}>-10s</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => {
                                    const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
                                    const nextIndex = (speeds.indexOf(playbackSpeed) + 1) % speeds.length;
                                    onSetSpeed?.(speeds[nextIndex]);
                                }}
                                style={[styles.innerSpeedBtn, { backgroundColor: theme.primary + '15', borderColor: theme.primary + '30' }]}
                            >
                                <Text style={[styles.innerSpeedText, { color: theme.primary }]}>{playbackSpeed}x</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={() => onSeek && onSeek(Math.min(duration, position + 10000))} style={styles.innerControlBtn}>
                                <Ionicons name="refresh" size={20} color={theme.secondaryText} style={{ transform: [{ scaleX: -1 }] }} />
                                <Text style={[styles.innerControlText, { color: theme.secondaryText }]}>+10s</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={[styles.innerTimeText, { color: theme.secondaryText }]}>{formatTime(duration)}</Text>
                    </View>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginHorizontal: Spacing.md,
        marginVertical: Spacing.xs,
        borderRadius: Radius.lg,
        borderWidth: 1,
        paddingVertical: Spacing.xs,
    },
    mainRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
    },
    info: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    typeIconContainer: {
        width: 40,
        height: 40,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    name: {
        fontSize: 15,
        fontWeight: '700',
        letterSpacing: -0.2,
    },
    status: {
        fontSize: 12,
        fontWeight: '500',
        marginTop: 2,
    },
    actionContainer: {
        width: 44,
        alignItems: 'center',
    },
    downloadButton: {
        width: 44,
        height: 44,
        borderRadius: Radius.full,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
    },
    playIconBtn: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    pdfIconBtn: {
        width: 44,
        height: 44,
        justifyContent: 'center',
        alignItems: 'center',
    },
    deleteBtn: {
        padding: 4,
    },
    innerPlayer: {
        paddingHorizontal: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    innerSliderRow: {
        height: 30,
        justifyContent: 'center',
    },
    slider: {
        width: '100%',
        height: 30,
    },
    innerTimeRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    innerTimeText: {
        fontSize: 11,
        fontWeight: '600',
        fontVariant: ['tabular-nums'],
        minWidth: 40,
    },
    innerControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.lg,
    },
    innerControlBtn: {
        alignItems: 'center',
    },
    innerControlText: {
        fontSize: 9,
        fontWeight: '700',
        marginTop: -2,
    },
    innerSpeedBtn: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: Radius.sm,
        borderWidth: 1,
    },
    innerSpeedText: {
        fontSize: 11,
        fontWeight: '800',
    },
});
