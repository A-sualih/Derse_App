import { Colors, Radius, Spacing } from '@/constants/theme';
import { FileListItem } from '@/src/components/FileListItem';
import { CATEGORIES } from '@/src/constants/mockData';
import { useTheme } from '@/src/context/ThemeContext';
import { useAudioPlayer } from '@/src/hooks/useAudioPlayer';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DerseDetailScreen() {
    const router = useRouter();
    const { categoryId } = useLocalSearchParams<{ categoryId: string }>();
    const { colorScheme, setThemePreference } = useTheme();
    const theme = Colors[colorScheme];

    const category = CATEGORIES.find(c => c.id === categoryId);

    const {
        playSound,
        pauseSound,
        seekScroll,
        isPlaying,
        currentUri,
        isLoading,
        position,
        duration,
        playbackSpeed,
        setPlaybackSpeed
    } = useAudioPlayer();

    const toggleTheme = () => {
        setThemePreference(colorScheme === 'dark' ? 'light' : 'dark');
    };

    if (!category) {
        return (
            <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
                <View style={styles.emptyContainer}>
                    <Ionicons name="alert-circle-outline" size={48} color={theme.secondaryText} />
                    <Text style={[styles.emptyText, { color: theme.text }]}>ዘርፉ አልተገኘም</Text>
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

            <View style={styles.header}>
                <View style={styles.headerTop}>
                    <TouchableOpacity
                        onPress={() => router.back()}
                        style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}
                    >
                        <Ionicons name="chevron-back" size={24} color={theme.primary} />
                    </TouchableOpacity>
                    <View style={styles.titleContainer}>
                        <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>{category.title}</Text>
                        <Text style={[styles.subTitle, { color: theme.secondaryText }]}>{category.files.length} ትምህርቶች</Text>
                    </View>
                    <TouchableOpacity onPress={toggleTheme} style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                        <Ionicons
                            name={colorScheme === 'dark' ? "sunny" : "moon"}
                            size={20}
                            color={theme.primary}
                        />
                    </TouchableOpacity>
                </View>
            </View>

            <FlatList
                data={category.files}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                    const isItemCurrent = currentUri === item.url || currentUri?.endsWith(encodeURIComponent(item.name));
                    return (
                        <FileListItem
                            file={item}
                            queue={category.files}
                            onPlay={playSound}
                            onPause={pauseSound}
                            onSeek={seekScroll}
                            isPlaying={isPlaying}
                            isCurrent={isItemCurrent}
                            isAudioLoading={isLoading}
                            position={isItemCurrent ? position : 0}
                            duration={isItemCurrent ? duration : 0}
                            playbackSpeed={isItemCurrent ? playbackSpeed : 1.0}
                            onSetSpeed={setPlaybackSpeed}
                        />
                    );
                }}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    headerTop: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: Spacing.md,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    titleContainer: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    subTitle: {
        fontSize: 13,
        fontWeight: '500',
    },
    actionButton: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    listContent: {
        paddingTop: Spacing.sm,
        paddingBottom: 100,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: Spacing.xl,
    },
    emptyText: {
        marginTop: Spacing.md,
        fontSize: 18,
        fontWeight: '600',
    },
});
