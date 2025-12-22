import { Colors } from '@/constants/theme';
import { useTheme } from '@/src/context/ThemeContext';
import { useUser } from '@/src/context/UserContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Linking, ScrollView, Share, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AboutScreen() {
    const router = useRouter();
    const { userProfile, saveProfile } = useUser();
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (userProfile) {
            setName(userProfile.name);
            setPhoneNumber(userProfile.phoneNumber);
            setUsername(userProfile.username);
        }
    }, [userProfile]);

    const handleSave = async () => {
        await saveProfile({ name, phoneNumber, username });
        Alert.alert('Success', 'Profile updated successfully!');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'Check out Derse App! Download it now: https://expo.dev/artifacts/eas/k7VYj8PW7dCaQNMKWzALoe.apk',
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to share the app.');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
            <View style={[styles.header, { borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color={theme.text} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>About Me</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Name</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: colorScheme === 'dark' ? '#555' : '#ccc', backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}
                        value={name}
                        onChangeText={setName}
                        placeholder="Enter your name"
                        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Username</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: colorScheme === 'dark' ? '#555' : '#ccc', backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="Enter your username"
                        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={[styles.label, { color: theme.text }]}>Phone Number</Text>
                    <TextInput
                        style={[styles.input, { color: theme.text, borderColor: colorScheme === 'dark' ? '#555' : '#ccc', backgroundColor: colorScheme === 'dark' ? '#222' : '#fff' }]}
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        placeholder="Enter your phone number"
                        keyboardType="phone-pad"
                        placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
                    />
                </View>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.tint }]}
                    onPress={handleSave}
                >
                    <Text style={styles.saveButtonText}>Save Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.tint, marginTop: 10 }]}
                    onPress={() => Linking.openURL('tel:+251926342943')}
                >
                    <Text style={styles.saveButtonText}>Contact Us +251 926 342 943</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: '#0088cc', marginTop: 10 }]}
                    onPress={() => Linking.openURL('https://t.me/SofleetoAllah26')}
                >
                    <Text style={styles.saveButtonText}>Telegram @SofleetoAllah26</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.saveButton, { backgroundColor: theme.tint, marginTop: 10 }]}
                    onPress={handleShare}
                >
                    <Text style={styles.saveButtonText}>Share App</Text>
                </TouchableOpacity>

                <View style={styles.infoSection}>
                    <Text style={[styles.infoText, { color: theme.secondaryText }]}>
                        Developed by Derse App Team.
                    </Text>
                    <Text style={[styles.versionText, { color: theme.secondaryText }]}>
                        Version 1.0.0
                    </Text>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        borderBottomWidth: 1,
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    content: {
        padding: 20,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        marginBottom: 8,
        fontWeight: '500',
    },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    saveButton: {
        marginTop: 20,
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    infoSection: {
        marginTop: 40,
        alignItems: 'center',
    },
    infoText: {
        fontSize: 14,
        marginBottom: 4,
    },
    versionText: {
        fontSize: 12,
    }
});
