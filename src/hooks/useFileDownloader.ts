import AsyncStorage from '@react-native-async-storage/async-storage';
import { useCallback, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { checkFileExists, deleteFile, downloadFile, getLocalUri } from '../utils/fileSystem';

const WEB_DOWNLOADS_KEY = 'web_downloads';

export const useFileDownloader = (filename: string, initialUrl: string) => {
    const [downloaded, setDownloaded] = useState(false);
    const [loading, setLoading] = useState(false);

    const checkStatus = useCallback(async () => {
        if (Platform.OS === 'web') {
            const stored = await AsyncStorage.getItem(WEB_DOWNLOADS_KEY);
            const downloads = stored ? JSON.parse(stored) : {};
            setDownloaded(!!downloads[filename]);
        } else {
            const exists = await checkFileExists(filename);
            setDownloaded(exists);
        }
    }, [filename]);

    useEffect(() => {
        checkStatus();
    }, [checkStatus]);

    const download = async () => {
        try {
            setLoading(true);
            await downloadFile(initialUrl, filename);

            if (Platform.OS === 'web') {
                const stored = await AsyncStorage.getItem(WEB_DOWNLOADS_KEY);
                const downloads = stored ? JSON.parse(stored) : {};
                downloads[filename] = true;
                await AsyncStorage.setItem(WEB_DOWNLOADS_KEY, JSON.stringify(downloads));
            }

            await checkStatus();
        } catch (error: any) {
            console.error('Download failed', error);
            alert(`Download failed: ${error.message || error}`);
        } finally {
            setLoading(false);
        }
    };

    const remove = async () => {
        try {
            setLoading(true);

            if (Platform.OS === 'web') {
                const stored = await AsyncStorage.getItem(WEB_DOWNLOADS_KEY);
                const downloads = stored ? JSON.parse(stored) : {};
                delete downloads[filename];
                await AsyncStorage.setItem(WEB_DOWNLOADS_KEY, JSON.stringify(downloads));
            } else {
                await deleteFile(filename);
            }

            await checkStatus();
        } catch (error) {
            console.error('Delete failed', error);
        } finally {
            setLoading(false);
        }
    };

    return {
        downloaded,
        loading,
        download,
        remove,
        localUri: Platform.OS === 'web' ? initialUrl : getLocalUri(filename)
    };
};
