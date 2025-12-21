import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useDeviceColorScheme } from 'react-native';

type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeContextType {
    themePreference: ThemePreference;
    colorScheme: 'light' | 'dark';
    setThemePreference: (pref: ThemePreference) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = 'user-theme-preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const deviceColorScheme = useDeviceColorScheme() ?? 'light';
    const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');

    useEffect(() => {
        const loadPreference = async () => {
            try {
                const saved = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (saved === 'light' || saved === 'dark' || saved === 'system') {
                    setThemePreferenceState(saved);
                }
            } catch (e) {
                console.error('Failed to load theme preference', e);
            }
        };
        loadPreference();
    }, []);

    const setThemePreference = async (pref: ThemePreference) => {
        setThemePreferenceState(pref);
        try {
            await AsyncStorage.setItem(THEME_STORAGE_KEY, pref);
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    };

    const colorScheme = themePreference === 'system' ? deviceColorScheme : themePreference;

    return (
        <ThemeContext.Provider value={{ themePreference, colorScheme, setThemePreference }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
