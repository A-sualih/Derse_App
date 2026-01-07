import { Colors, Radius, Spacing } from '@/constants/theme';
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
        Alert.alert('ተሳክቷል', 'መረጃዎ በትክክል ተቀምጧል!');
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: 'የሸህ አቡ ኒብራስ ደርሶችን ለማግኘት ይህን አፕ ይጠቀሙ: https://expo.dev/artifacts/eas/7v7M1p3o2AUhYEGczPV24E.apk',
            });
        } catch (error) {
            Alert.alert('ስህተት', 'ሊጋራ አልቻለም።');
        }
    };

    return (
        <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={[styles.backButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Ionicons name="chevron-back" size={24} color={theme.primary} />
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.text }]}>መገለጫ</Text>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.profileSection}>
                    <View style={[styles.avatarContainer, { backgroundColor: theme.primary + '10' }]}>
                        <Ionicons name="person" size={40} color={theme.primary} />
                    </View>
                    <Text style={[styles.profileHint, { color: theme.secondaryText }]}>መረጃዎትን እዚህ ማስተካከል ይችላሉ</Text>
                </View>

                <View style={styles.form}>
                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>ስም</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
                            value={name}
                            onChangeText={setName}
                            placeholder="ስምዎን ያስገቡ"
                            placeholderTextColor={theme.secondaryText + '80'}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>የተጠቃሚ ስም</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
                            value={username}
                            onChangeText={setUsername}
                            placeholder="የተጠቃሚ ስም ያስገቡ"
                            placeholderTextColor={theme.secondaryText + '80'}
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={[styles.label, { color: theme.text }]}>ስልክ ቁጥር</Text>
                        <TextInput
                            style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]}
                            value={phoneNumber}
                            onChangeText={setPhoneNumber}
                            placeholder="ስልክ ቁጥር ያስገቡ"
                            keyboardType="phone-pad"
                            placeholderTextColor={theme.secondaryText + '80'}
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.primaryButton, { backgroundColor: theme.primary }]}
                        onPress={handleSave}
                    >
                        <Text style={styles.buttonText}>መረጃን አድን</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.contactSection}>
                    <Text style={[styles.sectionTitle, { color: theme.text }]}>አግኙን</Text>

                    <TouchableOpacity
                        style={[styles.contactItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => Linking.openURL('tel:+251926342943')}
                    >
                        <Ionicons name="call-outline" size={20} color={theme.primary} />
                        <Text style={[styles.contactText, { color: theme.text }]}>+251 926 342 943</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.contactItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={() => Linking.openURL('https://t.me/SofleetoAllah26')}
                    >
                        <Ionicons name="paper-plane-outline" size={20} color={theme.primary} />
                        <Text style={[styles.contactText, { color: theme.text }]}>ቴሌግራም @SofleetoAllah26</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.contactItem, { backgroundColor: theme.surface, borderColor: theme.border }]}
                        onPress={handleShare}
                    >
                        <Ionicons name="share-social-outline" size={20} color={theme.primary} />
                        <Text style={[styles.contactText, { color: theme.text }]}>አፑን ለሌሎች ያጋሩ</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.secondaryText }]}>
                        Developed with ❤️ by Derse Team
                    </Text>
                    <Text style={[styles.versionText, { color: theme.secondaryText }]}>
                        ስሪት 1.0.0
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
        paddingHorizontal: Spacing.md,
        paddingTop: Spacing.md,
        paddingBottom: Spacing.sm,
    },
    backButton: {
        width: 44,
        height: 44,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        letterSpacing: -0.5,
    },
    content: {
        paddingHorizontal: Spacing.lg,
        paddingBottom: Spacing.xxl,
    },
    profileSection: {
        alignItems: 'center',
        marginVertical: Spacing.xl,
    },
    avatarContainer: {
        width: 80,
        height: 80,
        borderRadius: Radius.xxl,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    profileHint: {
        fontSize: 14,
        fontWeight: '500',
    },
    form: {
        marginBottom: Spacing.xl,
    },
    inputGroup: {
        marginBottom: Spacing.md,
    },
    label: {
        fontSize: 14,
        marginBottom: 6,
        fontWeight: '700',
        marginLeft: 4,
    },
    input: {
        borderWidth: 1,
        borderRadius: Radius.lg,
        padding: 14,
        fontSize: 16,
    },
    primaryButton: {
        marginTop: Spacing.md,
        padding: 16,
        borderRadius: Radius.lg,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 2,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    contactSection: {
        marginTop: Spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        marginBottom: Spacing.md,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: Radius.lg,
        borderWidth: 1,
        marginBottom: Spacing.sm,
        gap: Spacing.md,
    },
    contactText: {
        fontSize: 15,
        fontWeight: '600',
    },
    footer: {
        marginTop: Spacing.xxl,
        alignItems: 'center',
    },
    footerText: {
        fontSize: 13,
        fontWeight: '500',
    },
    versionText: {
        fontSize: 11,
        fontWeight: '400',
        marginTop: 4,
    }
});
