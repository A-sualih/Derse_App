import { Colors } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { Category } from '../types';

interface CategoryCardProps {
    category: Category;
    onPress: () => void;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onPress }) => {
    const { colorScheme } = useTheme();
    const theme = Colors[colorScheme];

    return (
        <TouchableOpacity
            style={[styles.card, { backgroundColor: colorScheme === 'dark' ? '#1e1e1e' : '#fff', borderColor: colorScheme === 'dark' ? '#333' : '#eee' }]}
            onPress={onPress}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.tint + '20' }]}>
                <Ionicons name="library" size={32} color={theme.tint} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.title, { color: theme.text }]}>{category.title}</Text>
                {category.description && (
                    <Text style={[styles.description, { color: theme.secondaryText }]}>{category.description}</Text>
                )}
                <Text style={[styles.fileCount, { color: theme.tint }]}>
                    {category.files.length} {category.files.length === 1 ? 'file' : 'files'}
                </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={theme.secondaryText} />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 8,
        borderRadius: 12,
        borderWidth: 1,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 60,
        height: 60,
        borderRadius: 30,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    cardContent: {
        flex: 1,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    description: {
        fontSize: 14,
        marginBottom: 4,
    },
    fileCount: {
        fontSize: 12,
        fontWeight: '600',
    },
});
