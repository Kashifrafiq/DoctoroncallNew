const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Firebase Auth's React Native entry (getReactNativePersistence) is incompatible
// with Metro's package.json "exports" resolution. Disable it so sessions persist
// via AsyncStorage instead of falling back to in-memory auth.
// See: https://docs.expo.dev/guides/using-firebase/
config.resolver.unstable_enablePackageExports = false;

module.exports = config;
