const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add custom resolution logic if needed
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs'];

module.exports = config;
