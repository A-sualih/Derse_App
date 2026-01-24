import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, InterruptionModeAndroid, InterruptionModeIOS } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { DRIVE_FILES } from '../constants/mockData';
import { DriveFile } from '../types';
import { checkFileExists, getLocalUri } from '../utils/fileSystem';

interface AudioContextType {
    isPlaying: boolean;
    isLoading: boolean;
    currentUri: string | null;
    currentTitle: string | null;
    currentFileId: string | null;
    position: number;
    duration: number;
    playSound: (uri: string, title?: string, queue?: DriveFile[], fileId?: string) => Promise<void>;
    pauseSound: (savePosition?: boolean) => Promise<void>;
    seekScroll: (value: number) => Promise<void>;
    skip: (seconds: number) => Promise<void>;
    nextTrack: () => void;
    previousTrack: () => void;
    playbackSpeed: number;
    setPlaybackSpeed: (speed: number) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sound, setSound] = useState<Audio.Sound | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUri, setCurrentUri] = useState<string | null>(null);
    const [currentTitle, setCurrentTitle] = useState<string | null>(null);
    const [currentFileId, setCurrentFileId] = useState<string | null>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackSpeed, setPlaybackSpeedState] = useState(1.0);

    // Queue management
    const [currentQueue, setCurrentQueue] = useState<DriveFile[]>(DRIVE_FILES);
    const pendingSeekPosition = useRef<number | null>(null);

    useEffect(() => {
        // Configure audio mode
        const setupAudio = async () => {
            try {
                await Audio.setAudioModeAsync({
                    allowsRecordingIOS: false,
                    staysActiveInBackground: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    interruptionModeAndroid: InterruptionModeAndroid.DuckOthers,
                    interruptionModeIOS: InterruptionModeIOS.DuckOthers,
                    playThroughEarpieceAndroid: false
                });
                console.log('Audio mode configured (expo-av)');
            } catch (error) {
                console.error('Error setting audio mode:', error);
            }
        };
        setupAudio();

        // Load saved speed
        AsyncStorage.getItem('audio_playback_speed').then(savedSpeed => {
            if (savedSpeed) setPlaybackSpeedState(parseFloat(savedSpeed));
        });

        return () => {
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, []);

    const getPersistenceKey = (uri: string) => `audio_pos_${encodeURIComponent(uri)}`;

    const onPlaybackStatusUpdate = async (status: any) => {
        if (!status.isLoaded) {
            if (status.error) {
                console.error(`Encountered a fatal error during playback: ${status.error}`);
            }
            return;
        }

        setPosition(status.positionMillis);
        setDuration(status.durationMillis || 0);
        setIsPlaying(status.isPlaying);
        setIsLoading(status.isBuffering);

        // Auto-save position every ~1s (expo-av default update is 500ms)
        if (status.isPlaying && currentUri) {
            // We can throttle this saving if needed, but simple setItem is usually fine.
            AsyncStorage.setItem(getPersistenceKey(currentUri), status.positionMillis.toString()).catch(() => { });
        }

        // Handle finite completion
        if (status.didJustFinish && !status.isLooping) {
            // Check for next track or just seek to start
            if (currentUri) {
                AsyncStorage.removeItem(getPersistenceKey(currentUri)).catch(() => { });
            }
            // Optional: Auto-advance could go here
            // nextTrack(); 
        }
    };

    const setPlaybackSpeed = async (speed: number) => {
        try {
            setPlaybackSpeedState(speed);
            if (sound) {
                await sound.setRateAsync(speed, true);
            }
            await AsyncStorage.setItem('audio_playback_speed', speed.toString());
        } catch (e) {
            console.error('Error setting playback speed:', e);
        }
    };

    const playSound = async (uri: string, title?: string, queue?: DriveFile[], fileId?: string) => {
        try {
            // Identifying Queue / Title logic
            let foundTitle = title;
            let foundId = fileId;
            const searchList = queue || currentQueue || DRIVE_FILES;
            if (queue) setCurrentQueue(queue);

            if (!foundTitle || !foundId) {
                const foundFile = searchList.find(f => f.url === uri || (fileId && f.id === fileId));
                if (foundFile) {
                    if (!foundTitle) foundTitle = foundFile.name;
                    if (!foundId) foundId = foundFile.id;
                }
            }

            // If same file, just toggle play
            if (currentUri === uri && sound) {
                const status = await sound.getStatusAsync();
                if (status.isLoaded) {
                    if (status.isPlaying) {
                        await sound.pauseAsync();
                    } else {
                        await sound.playAsync();
                    }
                    return;
                }
            }

            // New Track Loading
            setIsLoading(true);
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
            }

            setCurrentUri(uri);
            setCurrentTitle(foundTitle || 'Audio');
            setCurrentFileId(foundId || null);

            // Restore position logic
            const savedPos = await AsyncStorage.getItem(getPersistenceKey(uri));
            const initialPos = savedPos ? parseInt(savedPos, 10) : 0;

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri },
                {
                    shouldPlay: true,
                    positionMillis: initialPos,
                    rate: playbackSpeed,
                    shouldCorrectPitch: true,
                    progressUpdateIntervalMillis: 100
                },
                onPlaybackStatusUpdate
            );

            setSound(newSound);
            setIsLoading(false);

        } catch (error: any) {
            console.error('Error playing sound (expo-av):', error);
            setIsLoading(false);
            if (Platform.OS === 'web' && uri.includes('drive.google.com')) {
                const message = 'Google Drive audio links cannot stream directly in the browser. Open in new tab?';
                if (window.confirm(message)) Linking.openURL(uri);
            } else {
                Alert.alert('Playback Error', `Error playing audio: ${error.message || error}`);
            }
        }
    };

    const pauseSound = async (savePosition = true) => {
        if (sound) {
            await sound.pauseAsync();
            if (savePosition && currentUri && position > 0) {
                AsyncStorage.setItem(getPersistenceKey(currentUri), position.toString());
            }
        }
    };

    const seekScroll = async (value: number) => {
        if (sound) {
            await sound.setPositionAsync(value);
        }
    };

    const skip = async (seconds: number) => {
        if (sound) {
            const status = await sound.getStatusAsync();
            if (status.isLoaded) {
                const currentPos = status.positionMillis;
                const totalDur = status.durationMillis || 0; // Use 0 if unknown
                const newPos = currentPos + (seconds * 1000);

                // If duration is known (>0), clamp. Else just go to newPos (but at least 0).
                const clamped = Math.max(0, totalDur > 0 ? Math.min(newPos, totalDur) : newPos);

                console.log('[AudioContext] Skipping:', { currentPos, totalDur, newPos, clamped, seconds });
                await sound.setPositionAsync(clamped);
            }
        }
    };

    const nextTrack = async () => {
        const audioFiles = currentQueue.filter(file => file.type === 'audio');
        if (audioFiles.length === 0) return;

        let currentIndex = -1;
        if (currentFileId) {
            currentIndex = audioFiles.findIndex(file => file.id === currentFileId);
        }
        if (currentIndex === -1) {
            currentIndex = audioFiles.findIndex(file => file.url === currentUri || getLocalUri(file.name) === currentUri);
        }

        const nextIndex = (currentIndex + 1) % audioFiles.length;
        const nextFile = audioFiles[nextIndex];

        // Handle local vs remote URI
        const isDownloaded = await checkFileExists(nextFile.name); // Note: checkFileExists still uses name? We should update this later if we use ID logic. 
        // But for now, we follow existing logic. 
        // Wait, checkFileExists helper might need update if we changed filenames in FileListItem only.
        // Actually, downloader uses ID based filenames now. checkFileExists takes a filename.
        // We need to construct the filename same way as FileListItem.
        // Let's rely on FileListItem passing correct URI or just check logic.
        // Re-using same logic as before:

        // Helper to guess filename if we don't have it handy?
        // Ideally nextTrack should just use the ID derived filename.
        // Let's simplify: try to just play the URL, if useFileDownloader in FileListItem handled it, maybe good. 
        // But here we need to know if local exists to play local.

        // For consistent ID filenames:
        const ext = nextFile.extension || 'mp3';
        const safeFilename = `${nextFile.id}.${ext}`;
        const isLocal = await checkFileExists(safeFilename);
        const nextUri = isLocal ? getLocalUri(safeFilename) || nextFile.url : nextFile.url;

        playSound(nextUri, nextFile.name, currentQueue, nextFile.id);
    };

    const previousTrack = async () => {
        const audioFiles = currentQueue.filter(file => file.type === 'audio');
        if (audioFiles.length === 0) return;

        let currentIndex = audioFiles.findIndex(file => file.id === currentFileId);
        if (currentIndex === -1) currentIndex = 0;

        let prevIndex = currentIndex - 1;
        if (prevIndex < 0) prevIndex = audioFiles.length - 1;

        const prevFile = audioFiles[prevIndex];

        const ext = prevFile.extension || 'mp3';
        const safeFilename = `${prevFile.id}.${ext}`;
        const isLocal = await checkFileExists(safeFilename);
        const prevUri = isLocal ? getLocalUri(safeFilename) || prevFile.url : prevFile.url;

        playSound(prevUri, prevFile.name, currentQueue, prevFile.id);
    };

    return (
        <AudioContext.Provider value={{
            isPlaying, isLoading, currentUri, currentTitle, currentFileId, position, duration,
            playSound, pauseSound, seekScroll, skip, nextTrack, previousTrack,
            playbackSpeed, setPlaybackSpeed
        }}>
            {children}
        </AudioContext.Provider>
    );
};

export const useAudio = () => {
    const context = useContext(AudioContext);
    if (!context) throw new Error('useAudio must be used within an AudioProvider');
    return context;
};
