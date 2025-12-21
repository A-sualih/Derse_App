import { useTheme } from '@/src/context/ThemeContext';

export const useColorScheme = () => {
    const { colorScheme } = useTheme();
    return colorScheme;
};
