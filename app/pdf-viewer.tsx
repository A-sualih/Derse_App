import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { MiniPlayer } from '@/src/components/MiniPlayer';
import NativePdf from '@/src/components/NativePdf';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Linking, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PdfViewer() {
    const { url, remoteUrl, name } = useLocalSearchParams<{ url: string; remoteUrl: string; name: string }>();
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [isPageLoaded, setIsPageLoaded] = useState(false);

    const colorScheme = useColorScheme() ?? 'light';
    const theme = Colors[colorScheme];
    const persistenceKey = `pdf_res_page_${name}`;

    useEffect(() => {
        const loadPage = async () => {
            try {
                const saved = await AsyncStorage.getItem(persistenceKey);
                if (saved && !isPageLoaded) {
                    setCurrentPage(parseInt(saved, 10));
                }
            } catch (e) {
            } finally {
                setIsPageLoaded(true);
            }
        };
        loadPage();
    }, [name, persistenceKey]);

    const [zoom, setZoom] = useState(1.0);

    const handleZoom = (type: 'in' | 'out') => {
        setZoom(prev => {
            if (type === 'in') return Math.min(prev + 0.25, 3.0);
            return Math.max(prev - 0.25, 0.75);
        });
    };

    const handlePageUpdate = (page: number) => {
        AsyncStorage.setItem(persistenceKey, page.toString());
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: colorScheme === 'dark' ? '#333' : '#eee' }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color={theme.tint} />
                    <Text style={[styles.backText, { color: theme.tint }]}>Back</Text>
                </TouchableOpacity>

                <View style={styles.zoomControls}>
                    <TouchableOpacity onPress={() => handleZoom('out')} style={styles.zoomBtn}>
                        <Ionicons name="remove-circle-outline" size={24} color={theme.tint} />
                    </TouchableOpacity>
                    <Text style={[styles.zoomText, { color: theme.text }]}>{Math.round(zoom * 100)}%</Text>
                    <TouchableOpacity onPress={() => handleZoom('in')} style={styles.zoomBtn}>
                        <Ionicons name="add-circle-outline" size={24} color={theme.tint} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    onPress={() => Linking.openURL(remoteUrl || url)}
                    style={styles.headerRight}
                >
                    <Ionicons name="open-outline" size={24} color={theme.tint} />
                </TouchableOpacity>
            </View>

            <View style={[styles.pdfContainer, { backgroundColor: colorScheme === 'dark' ? '#1a1a1b' : '#F5F5F5' }]}>
                <NativePdf
                    url={url as string}
                    remoteUrl={remoteUrl as string}
                    targetPage={currentPage}
                    zoom={zoom}
                    onPageChanged={handlePageUpdate}
                />
            </View>


            <MiniPlayer />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        width: 70,
    },
    backText: {
        color: '#007AFF',
        fontSize: 16,
    },
    zoomControls: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    zoomBtn: {
        padding: 5,
    },
    zoomText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#333',
        marginHorizontal: 10,
        minWidth: 40,
        textAlign: 'center',
    },
    headerRight: {
        width: 70,
        alignItems: 'flex-end',
    },
    pdfContainer: {
        flex: 1,
        backgroundColor: '#F5F5F5',
    },
    loading: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#fff',
    },
});
