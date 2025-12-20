import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { MiniPlayer } from '../src/components/MiniPlayer';
import NativePdf from '../src/components/NativePdf';

export default function PdfViewer() {
    const { url, name } = useLocalSearchParams<{ url: string; name: string }>();
    const router = useRouter();
    const [initialPage, setInitialPage] = useState<number | null>(null);
    const [totalPages, setTotalPages] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);

    const persistenceKey = `pdf_page_${name}`;

    useEffect(() => {
        const loadPage = async () => {
            try {
                const saved = await AsyncStorage.getItem(persistenceKey);
                if (saved) {
                    setInitialPage(parseInt(saved, 10));
                } else {
                    setInitialPage(1);
                }
            } catch (e) {
                setInitialPage(1);
            }
        };
        loadPage();
    }, [name]);

    const handlePageChanged = (page: number) => {
        setCurrentPage(page);
        AsyncStorage.setItem(persistenceKey, page.toString());
    };

    if (initialPage === null) {
        return (
            <View style={styles.loading}>
                <ActivityIndicator size="large" color="#007AFF" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="chevron-back" size={24} color="#007AFF" />
                    <Text style={styles.backText}>Back</Text>
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                    <Text style={styles.title} numberOfLines={1}>{name}</Text>
                    {totalPages > 0 && (
                        <Text style={styles.subtitle}>Page {currentPage} of {totalPages}</Text>
                    )}
                </View>
                <View style={{ width: 60 }} />
            </View>

            <View style={styles.pdfContainer}>
                <NativePdf
                    url={url as string}
                    page={initialPage}
                    onLoadComplete={(n) => setTotalPages(n)}
                    onPageChanged={handlePageChanged}
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
    titleContainer: {
        flex: 1,
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#333',
    },
    subtitle: {
        fontSize: 11,
        color: '#888',
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
