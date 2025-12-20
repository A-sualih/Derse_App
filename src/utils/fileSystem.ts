import * as FileSystem from 'expo-file-system/legacy';
import { Platform } from 'react-native';

// Lazy resolve the directory to ensure native module is ready
const getRootDir = () => {
    let dir = FileSystem.documentDirectory || FileSystem.cacheDirectory;

    // Check known potential locations in newer SDKs
    if (!dir) {
        if (FileSystem.Paths) {
            dir = FileSystem.Paths.documentDirectory || FileSystem.Paths.cacheDirectory;
        }
    }

    // Last ditch: check if 'Directory' object has it (based on keys log)
    // @ts-ignore
    if (!dir && FileSystem.Directory) {
        console.log('FileSystem.Directory found:', JSON.stringify(FileSystem.Directory));
        // @ts-ignore
        dir = FileSystem.Directory.document || FileSystem.Directory.cache;
    }

    if (!dir) {
        // Fallback for Android Expo Go specifically if everything else failed
        // This is a common path for Expo Go cache
        if (Platform.OS === 'android') {
            console.warn('Attempting hardcoded fallback for Android Expo Go');
            return 'file:///data/user/0/host.exp.exponent/cache/';
        }

        return null;
    }
    return dir;
};

export const getFilesDirectory = () => {
    const root = getRootDir();
    return root ? `${root}files/` : null;
}

export const ensureDirectoryExists = async () => {
    const dir = getFilesDirectory();
    if (!dir) return; // Can't do anything if no root
    if (Platform.OS === 'web') return;

    try {
        const dirInfo = await FileSystem.getInfoAsync(dir);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
        }
    } catch (e) {
        console.warn('ensureDirectoryExists error:', e);
    }
};

export const getLocalUri = (filename: string) => {
    const dir = getFilesDirectory();
    return dir ? dir + encodeURIComponent(filename) : null;
};

export const checkFileExists = async (filename: string): Promise<boolean> => {
    const dir = getFilesDirectory();
    if (!dir) return false;
    try {
        const uri = getLocalUri(filename);
        if (!uri) return false;
        const fileInfo = await FileSystem.getInfoAsync(uri);
        return fileInfo.exists;
    } catch (e) {
        console.log('Error checking file existence:', e);
        return false;
    }
};

export const downloadFile = async (url: string, filename: string): Promise<string> => {
    if (Platform.OS === 'web') {
        // On web, we can't save to file system accessibly for Audio player in the same way.
        // We will return the remote URL so it 'looks' downloaded or just fail gracefully.
        // For this app's requirement "Play after download", on Web we might just stream it.
        // But let's try to support "fake" download for UI testing.
        console.warn('Download on web: returning remote URL');
        return url;
    }

    // Ensure directory exists first, which checks root availability
    await ensureDirectoryExists();

    const fileUri = getLocalUri(filename);
    if (!fileUri) {
        // Only throw here if we really can't get a path
        const pathsLog = FileSystem.Paths ? `Paths: ${JSON.stringify(FileSystem.Paths)}` : 'Paths: undefined';
        throw new Error(`Document directory is not available. Platform: ${Platform.OS}. Debug: ${pathsLog}`);
    }

    console.log(`Attempting to download ${url} to ${fileUri}`);
    try {
        const downloadRes = await FileSystem.downloadAsync(url, fileUri);
        console.log('Download finished:', downloadRes);
        if (downloadRes.status !== 200) {
            throw new Error(`Download failed with status ${downloadRes.status}`);
        }
        return downloadRes.uri;
    } catch (error) {
        console.error('FileSystem download error:', error);
        throw error;
    }
};

export const deleteFile = async (filename: string) => {
    const uri = getLocalUri(filename);
    if (uri) {
        await FileSystem.deleteAsync(uri, { idempotent: true });
    }
}
