import AsyncStorage from '@react-native-async-storage/async-storage';
import { Audio, AVPlaybackStatus } from 'expo-av';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';

interface AudioContextType {
    isPlaying: boolean;
    isLoading: boolean;
    currentUri: string | null;
    position: number;
    duration: number;
    playSound: (uri: string) => Promise<void>;
    pauseSound: (savePosition?: boolean) => Promise<void>;
    seekScroll: (value: number) => Promise<void>;
    skip: (seconds: number) => Promise<void>;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sound, setSound] = useState<Audio.Sound>();
    const [isPlaying, setIsPlaying] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [currentUri, setCurrentUri] = useState<string | null>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);
    const positionSaveInterval = useRef<any>(null);

    const getPersistenceKey = (uri: string) => `audio_pos_${encodeURIComponent(uri)}`;

    const onPlaybackStatusUpdate = useCallback((status: AVPlaybackStatus) => {
        if (status.isLoaded) {
            setPosition(status.positionMillis);
            setDuration(status.durationMillis || 0);

            if (status.didJustFinish) {
                setIsPlaying(false);
                setPosition(0);
                if (sound) {
                    sound.setPositionAsync(0);
                }
                // Clear persistence on finish
                if (currentUri) {
                    AsyncStorage.removeItem(getPersistenceKey(currentUri));
                }
            }
        } else if (status.error) {
            console.error('Playback object error:', status.error);
        }
    }, [sound, currentUri]);

    // Save position periodically when playing
    useEffect(() => {
        if (isPlaying && currentUri) {
            positionSaveInterval.current = setInterval(() => {
                AsyncStorage.setItem(getPersistenceKey(currentUri), position.toString());
            }, 5000); // Save every 5 seconds
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

    const playSound = async (uri: string) => {
        setIsLoading(true);
        try {
            if (sound) {
                if (currentUri === uri) {
                    if (isPlaying) {
                        await sound.pauseAsync();
                        setIsPlaying(false);
                    } else {
                        await sound.playAsync();
                        setIsPlaying(true);
                    }
                    setIsLoading(false);
                    return;
                } else {
                    await sound.unloadAsync();
                    setPosition(0);
                    setDuration(0);
                }
            }

            console.log('Loading Sound from:', uri);
            const { sound: newSound, status } = await Audio.Sound.createAsync(
                { uri },
                { shouldPlay: false },
                onPlaybackStatusUpdate
            );

            if (!status.isLoaded) {
                throw new Error(`Sound failed to load. Status: ${JSON.stringify(status)}`);
            }

            // Check for saved position
            const savedPos = await AsyncStorage.getItem(getPersistenceKey(uri));
            if (savedPos) {
                const pos = parseInt(savedPos, 10);
                if (pos < (status.durationMillis || 0)) {
                    await newSound.setPositionAsync(pos);
                    setPosition(pos);
                }
            }

            setSound(newSound);
            setCurrentUri(uri);
            setDuration(status.durationMillis || 0);

            console.log('Playing Sound (Resumed if available)');
            await newSound.playAsync();
            setIsPlaying(true);

        } catch (error: any) {
            console.error('Error playing sound', error);
            if (Platform.OS === 'web' && uri.includes('drive.google.com')) {
                const message = 'Google Drive audio links cannot stream directly in the browser. Open in new tab?';
                if (window.confirm(message)) {
                    Linking.openURL(uri);
                }
            } else {
                Alert.alert('Playback Error', `Error playing audio: ${error.message || error}`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const pauseSound = async () => {
        if (sound && isPlaying) {
            await sound.pauseAsync();
            setIsPlaying(false);
            if (currentUri) {
                AsyncStorage.setItem(getPersistenceKey(currentUri), position.toString());
            }
        }
    };

    const seekScroll = async (value: number) => {
        if (sound) {
            await sound.setPositionAsync(value);
            setPosition(value);
            if (currentUri) {
                AsyncStorage.setItem(getPersistenceKey(currentUri), value.toString());
            }
        }
    };

    const skip = async (seconds: number) => {
        if (sound) {
            const newPosition = position + seconds * 1000;
            const clampedPosition = Math.max(0, Math.min(newPosition, duration));
            await sound.setPositionAsync(clampedPosition);
            setPosition(clampedPosition);
            if (currentUri) {
                AsyncStorage.setItem(getPersistenceKey(currentUri), clampedPosition.toString());
            }
        }
    };

    useEffect(() => {
        return sound ? () => { sound.unloadAsync(); } : undefined;
    }, [sound]);

    return (
        <AudioContext.Provider value={{
            isPlaying, isLoading, currentUri, position, duration,
            playSound, pauseSound, seekScroll, skip
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
