import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAudioModeAsync, useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { Audio as ExpoAV } from 'expo-av';
import React, { createContext, ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import { DRIVE_FILES } from '../constants/mockData';
import { DriveFile } from '../types';

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
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUri, setCurrentUri] = useState<string | null>(null);
    const [currentTitle, setCurrentTitle] = useState<string | null>(null);
    const [currentFileId, setCurrentFileId] = useState<string | null>(null);
    const [localIsPlaying, setLocalIsPlaying] = useState(false);
    const player = useAudioPlayer(currentUri);
    const status = useAudioPlayerStatus(player);
    const [isLoading, setIsLoading] = useState(false);
    const positionSaveInterval = useRef<any>(null);
    const pendingSeekPosition = useRef<number | null>(null);
    const shouldAutoPlay = useRef(false);

    // Sync status back to our context-friendly state
    const isPlaying = localIsPlaying;
    const position = status.currentTime * 1000; // status is in seconds, we use ms for compatibility
    const duration = status.duration * 1000;

    // Sync localIsPlaying with native status, but skip while loading or during transitions
    useEffect(() => {
        if (!isLoading) {
            setLocalIsPlaying(status.playing);
        }
    }, [status.playing, isLoading]);

    useEffect(() => {
        // Configure audio mode for background playback
        const setupAudio = async () => {
            try {
                await setAudioModeAsync({
                    playsInSilentMode: true,
                    shouldPlayInBackground: true,
                    // casting to any because expo-audio types expect a string union, but native expects an Enum value
                    // @ts-ignore - Enum might be defined differently in this version of expo-av
                    interruptionMode: (ExpoAV as any).INTERRUPTION_MODE_ANDROID_DUCK_OTHERS,
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

    const [currentQueue, setCurrentQueue] = useState<DriveFile[]>(DRIVE_FILES);

    // ... (rest of the effects)

    const playSound = async (uri: string, title?: string, queue?: DriveFile[], fileId?: string) => {
        try {
            if (currentUri === uri) {
                if (status.playing) {
                    setLocalIsPlaying(false);
                    player.pause();
                } else {
                    setLocalIsPlaying(true);
                    player.play();
                }
                return;
            }

            // INSTANT STATE UPDATES
            setLocalIsPlaying(true);
            setIsLoading(true);

            // Determine Title and ID INSTANTLY
            let foundTitle = title;
            let foundId = fileId;
            const searchList = queue || currentQueue || DRIVE_FILES;

            if (!foundTitle || !foundId) {
                const foundFile = searchList.find(f => f.url === uri || (fileId && f.id === fileId));
                if (foundFile) {
                    if (!foundTitle) foundTitle = foundFile.name;
                    if (!foundId) foundId = foundFile.id;
                }
            }

            setCurrentTitle(foundTitle || 'Audio');
            setCurrentFileId(foundId || null);

            if (queue) {
                setCurrentQueue(queue);
            }

            // FIRE AND FORGET PERSISTENCE CHECK (don't await)
            AsyncStorage.getItem(getPersistenceKey(uri))
                .then(savedPos => {
                    if (savedPos) {
                        pendingSeekPosition.current = parseInt(savedPos, 10);
                    } else {
                        pendingSeekPosition.current = null;
                    }
                })
                .catch(e => console.error("Position restore error", e))
                .finally(() => {
                    // Finally set the URI to trigger loading
                    shouldAutoPlay.current = true;
                    setCurrentUri(uri);
                });

        } catch (error: any) {
            // ... (error handling)
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
        setLocalIsPlaying(false);
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
        const audioFiles = currentQueue.filter(file => file.type === 'audio');
        let currentIndex = -1;

        if (currentFileId) {
            currentIndex = audioFiles.findIndex(file => file.id === currentFileId);
        }

        if (currentIndex === -1) {
            currentIndex = audioFiles.findIndex(file => file.url === currentUri);
        }

        if (currentIndex !== -1 && currentIndex < audioFiles.length - 1) {
            const nextFile = audioFiles[currentIndex + 1];
            playSound(nextFile.url, nextFile.name, currentQueue, nextFile.id);
        }
    };

    const previousTrack = () => {
        const audioFiles = currentQueue.filter(file => file.type === 'audio');
        let currentIndex = -1;

        if (currentFileId) {
            currentIndex = audioFiles.findIndex(file => file.id === currentFileId);
        }

        if (currentIndex === -1) {
            currentIndex = audioFiles.findIndex(file => file.url === currentUri);
        }

        if (currentIndex > 0) {
            const prevFile = audioFiles[currentIndex - 1];
            playSound(prevFile.url, prevFile.name, currentQueue, prevFile.id);
        }
    };


    return (
        <AudioContext.Provider value={{
            isPlaying, isLoading, currentUri, currentTitle, currentFileId, position, duration,
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
