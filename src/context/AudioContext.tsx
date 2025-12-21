import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Audio as ExpoAV } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { DRIVE_FILES } from '../constants/mockData';

interface AudioContextType {
    isPlaying: boolean;
    isLoading: boolean;
    currentUri: string | null;
    currentTitle: string | null;
    position: number;
    duration: number;
    playSound: (uri: string, title?: string) => Promise<void>;
    pauseSound: (savePosition?: boolean) => Promise<void>;
    seekScroll: (value: number) => Promise<void>;
    skip: (seconds: number) => Promise<void>;
    nextTrack: () => void;
    previousTrack: () => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUri, setCurrentUri] = useState<string | null>(null);
    const [currentTitle, setCurrentTitle] = useState<string | null>(null);
    const player = useAudioPlayer(currentUri);
    const status = useAudioPlayerStatus(player);
    const [isLoading, setIsLoading] = useState(false);
    const positionSaveInterval = useRef<any>(null);
    const pendingSeekPosition = useRef<number | null>(null);
    const shouldAutoPlay = useRef(false);

    // Sync status back to our context-friendly state
    const isPlaying = status.playing;
    const position = status.currentTime * 1000; // status is in seconds, we use ms for compatibility
    const duration = status.duration * 1000;

    useEffect(() => {
        // Configure audio mode for background playback
        const setupAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    shouldPlayInBackground: true,
                    // casting to any because expo-audio types expect a string union, but native expects an Enum value
                    interruptionMode: ExpoAV.INTERRUPTION_MODE_ANDROID_DUCK_OTHERS as any,
                });
                console.log('Audio mode configured for background playback');
            } catch (error) {
                console.error('Error setting audio mode:', error);
            }
        };
        setupAudio();
    }, []);

    // Auto-play and restore position when a new track is loaded
    useEffect(() => {
        if (!currentUri || !shouldAutoPlay.current) return;

        // Check if we have a pending position to restore
        if (pendingSeekPosition.current !== null && status.duration > 0) {
            const posToRestore = pendingSeekPosition.current;
            pendingSeekPosition.current = null;

            console.log('Restoring position:', posToRestore / 1000, 'seconds');
            player.seekTo(posToRestore / 1000)
                .then(() => {
                    player.play();
                    shouldAutoPlay.current = false;
                    setIsLoading(false);
                })
                .catch((error) => {
                    console.error('Error restoring position:', error);
                    player.play();
                    shouldAutoPlay.current = false;
                    setIsLoading(false);
                });
        } else if (status.duration > 0) {
            // No saved position, just play
            player.play();
            shouldAutoPlay.current = false;
            setIsLoading(false);
        }
    }, [currentUri, status.duration, player]);

    const getPersistenceKey = (uri: string) => `audio_pos_${encodeURIComponent(uri)} `;

    // Handle completion
    useEffect(() => {
        if (status.didJustFinish) {
            player.seekTo(0).catch(err => console.error('Seek to start error:', err));
            if (currentUri) {
                AsyncStorage.removeItem(getPersistenceKey(currentUri));
            }
        }
    }, [status.didJustFinish, currentUri, player]);

    // Save position periodically when playing
    useEffect(() => {
        if (isPlaying && currentUri) {
            positionSaveInterval.current = setInterval(() => {
                AsyncStorage.setItem(getPersistenceKey(currentUri), position.toString());
            }, 1000); // Save every 1 second for more precision
        } else {
            if (positionSaveInterval.current) {
                clearInterval(positionSaveInterval.current);
            }
            // Save one last time on pause
            if (currentUri && position > 0) {
                AsyncStorage.setItem(getPersistenceKey(currentUri), position.toString());
            }
        }
        return () => {
            if (positionSaveInterval.current) clearInterval(positionSaveInterval.current);
        };
    }, [isPlaying, currentUri, position]);

    const playSound = async (uri: string, title?: string) => {
        try {
            if (currentUri === uri) {
                if (status.playing) {
                    player.pause();
                } else {
                    player.play();
                }
                return;
            }

            setIsLoading(true);
            console.log('Loading Sound from:', uri);

            // Set title
            if (title) {
                setCurrentTitle(title);
            } else {
                // Try to find name in mock data
                const foundFile = DRIVE_FILES.find(f => f.url === uri);
                setCurrentTitle(foundFile ? foundFile.name : 'Audio');
            }

            // Check for saved position
            const savedPos = await AsyncStorage.getItem(getPersistenceKey(uri));
            if (savedPos) {
                const pos = parseInt(savedPos, 10);
                pendingSeekPosition.current = pos;
            } else {
                pendingSeekPosition.current = null;
            }

            shouldAutoPlay.current = true;

            // Change the current URI (this will trigger player reload and the useEffect above)
            setCurrentUri(uri);

        } catch (error: any) {
            console.error('Error playing sound', error);
            setIsLoading(false);
            if (Platform.OS === 'web' && uri.includes('drive.google.com')) {
                const message = 'Google Drive audio links cannot stream directly in the browser. Open in new tab?';
                if (window.confirm(message)) {
                    Linking.openURL(uri);
                }
            } else {
                Alert.alert('Playback Error', `Error playing audio: ${error.message || error} `);
            }
        }
    };

    const pauseSound = async () => {
        if (player.playing) {
            player.pause();
            if (currentUri) {
                AsyncStorage.setItem(getPersistenceKey(currentUri), position.toString());
            }
        }
    };

    const seekScroll = async (value: number) => {
        try {
            await player.seekTo(value / 1000);
            if (currentUri) {
                AsyncStorage.setItem(getPersistenceKey(currentUri), value.toString());
            }
        } catch (error) {
            console.error('Seek error:', error);
        }
    };

    const skip = async (seconds: number) => {
        try {
            const newPosition = position + seconds * 1000;
            const clampedPosition = Math.max(0, Math.min(newPosition, duration));
            await player.seekTo(clampedPosition / 1000);
            if (currentUri) {
                AsyncStorage.setItem(getPersistenceKey(currentUri), clampedPosition.toString());
            }
        } catch (error) {
            console.error('Skip error:', error);
        }
    };

    const nextTrack = () => {
        const audioFiles = DRIVE_FILES.filter(file => file.type === 'audio');
        const currentIndex = audioFiles.findIndex(file => file.url === currentUri);
        if (currentIndex !== -1 && currentIndex < audioFiles.length - 1) {
            playSound(audioFiles[currentIndex + 1].url);
        }
    };

    const previousTrack = () => {
        const audioFiles = DRIVE_FILES.filter(file => file.type === 'audio');
        const currentIndex = audioFiles.findIndex(file => file.url === currentUri);
        if (currentIndex > 0) {
            playSound(audioFiles[currentIndex - 1].url);
        }
    };


    return (
        <AudioContext.Provider value={{
            isPlaying, isLoading, currentUri, currentTitle, position, duration,
            playSound, pauseSound, seekScroll, skip, nextTrack, previousTrack
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
