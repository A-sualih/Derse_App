import { Colors } from '@/constants/theme';
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
      <View style={[styles.header, { backgroundColor: theme.background, borderBottomColor: colorScheme === 'dark' ? '#333' : '#e0e0e0' }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>ደርሶች</Text>
          <View style={styles.headerActions}>
            <TouchableOpacity onPress={() => router.push('/about')} style={styles.iconButton}>
              <Ionicons
                name="person-circle-outline"
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
            <TouchableOpacity onPress={toggleTheme} style={styles.themeToggle}>
              <Ionicons
                name={colorScheme === 'dark' ? "sunny" : "moon"}
                size={24}
                color={theme.text}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
      <FlatList
        data={CATEGORIES}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <CategoryCard
            category={item}
            onPress={() => router.push({
              pathname: '/derse-detail',
              params: { categoryId: item.id }
            })}
          />
        )}
        contentContainerStyle={styles.listContent}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 16,
    borderBottomWidth: 1,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    flex: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 8,
    marginRight: 8,
  },
  themeToggle: {
    padding: 8,
  },
  listContent: {
    paddingVertical: 10,
  },
});
