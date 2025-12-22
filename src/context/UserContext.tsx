import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

type UserProfile = {
    name: string;
    phoneNumber: string;
    username: string;
};

type UserContextType = {
    userProfile: UserProfile;
    saveProfile: (profile: UserProfile) => Promise<void>;
    loadProfile: () => Promise<void>;
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [userProfile, setUserProfile] = useState<UserProfile>({
        name: '',
        phoneNumber: '',
        username: '',
    });

    const loadProfile = async () => {
        try {
            const storedProfile = await AsyncStorage.getItem('userProfile');
            if (storedProfile) {
                setUserProfile(JSON.parse(storedProfile));
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
        }
    };

    const saveProfile = async (profile: UserProfile) => {
        try {
            await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
            setUserProfile(profile);
        } catch (error) {
            console.error('Failed to save user profile:', error);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    return (
        <UserContext.Provider value={{ userProfile, saveProfile, loadProfile }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => {
    const context = useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
};
