import { Colors, Radius, Shadows, Spacing } from '@/constants/theme';
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
            style={[
                styles.card,
                {
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                },
                Shadows.sm
            ]}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.iconContainer, { backgroundColor: theme.primary + '10' }]}>
                <Ionicons name="folder-open" size={28} color={theme.primary} />
            </View>
            <View style={styles.cardContent}>
                <Text style={[styles.title, { color: theme.text }]} numberOfLines={1}>{category.title}</Text>
                {category.description && (
                    <Text style={[styles.description, { color: theme.secondaryText }]} numberOfLines={2}>{category.description}</Text>
                )}
                <View style={styles.metaRow}>
                    <Ionicons name="documents-outline" size={14} color={theme.primary} style={styles.metaIcon} />
                    <Text style={[styles.fileCount, { color: theme.primary }]}>
                        {category.files.length} {category.files.length === 1 ? 'ትምህርት' : 'ትምህርቶች'}
                    </Text>
                </View>
            </View>
            <View style={styles.arrowContainer}>
                <Ionicons name="chevron-forward" size={20} color={theme.icon} />
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        marginHorizontal: Spacing.md,
        marginVertical: Spacing.sm,
        borderRadius: Radius.lg,
        borderWidth: 1,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: Radius.md,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: Spacing.md,
    },
    cardContent: {
        flex: 1,
    },
    title: {
        fontSize: 17,
        fontWeight: '700',
        marginBottom: 2,
        letterSpacing: -0.2,
    },
    description: {
        fontSize: 13,
        lineHeight: 18,
        marginBottom: Spacing.xs,
    },
    metaRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    metaIcon: {
        marginRight: 4,
    },
    fileCount: {
        fontSize: 12,
        fontWeight: '600',
    },
    arrowContainer: {
        marginLeft: Spacing.sm,
    },
});
