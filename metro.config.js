const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

const { resolver } = config;

config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx', 'mjs', 'cjs'];

// Blacklist native-only modules from Web build
if (process.env.EXPO_PUBLIC_PLATFORM === 'web') {
    config.resolver.blacklistRE = [
        /node_modules\/react-native-pdf\/.*/,
        /node_modules\/react-native-blob-util\/.*/
    ];
}

module.exports = config;
