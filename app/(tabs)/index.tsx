import { Colors, Radius, Spacing } from '@/constants/theme';
import { CategoryCard } from '@/src/components/CategoryCard';
import { CATEGORIES } from '@/src/constants/mockData';
import { useTheme } from '@/src/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const router = useRouter();
  const { colorScheme, setThemePreference } = useTheme();
  const theme = Colors[colorScheme];

  const toggleTheme = () => {
    setThemePreference(colorScheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]} edges={['top', 'left', 'right']}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={[styles.greeting, { color: theme.secondaryText }]}>እንኳን ደህና መጡ</Text>
            <Text style={[styles.headerTitle, { color: theme.text }]}>የሸህ አቡ ኒብራስ ደርሶች</Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={toggleTheme} style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons
                name={colorScheme === 'dark' ? "sunny" : "moon"}
                size={20}
                color={theme.primary}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/about')} style={[styles.actionButton, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <Ionicons
                name="person-outline"
                size={20}
                color={theme.primary}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={[styles.statsBar, { backgroundColor: theme.primary + '10' }]}>
          <Ionicons name="information-circle" size={18} color={theme.primary} />
          <Text style={[styles.statsText, { color: theme.primary }]}>
            ያሉ የደርስ አይነቶች፡ {CATEGORIES.length}
          </Text>
        </View>
      </View>

      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => router.push({
              pathname: '/derse-detail' as any,
              params: { categoryId: item.id }
            })}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: Spacing.md,
  },
  greeting: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: Radius.md,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
  statsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: Radius.md,
    gap: Spacing.xs,
  },
  statsText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listContent: {
    paddingTop: Spacing.sm,
    paddingBottom: 100, // Space for mini player
  },
});
