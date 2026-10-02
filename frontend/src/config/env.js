import { NativeModules, Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

function getNativeBundleHost() {
  const scriptUrl = NativeModules.SourceCode?.scriptURL || '';
  const hostMatch = scriptUrl.match(/^https?:\/\/([^/:]+)/);

  return hostMatch?.[1] || '';
}

function resolveApiUrl() {
  if (Platform.OS === 'web') {
    return configuredApiUrl;
  }

  const bundleHost = getNativeBundleHost();

  if (!bundleHost) {
    return configuredApiUrl;
  }

  return configuredApiUrl.replace('localhost', bundleHost).replace('127.0.0.1', bundleHost);
}

export const API_URL = resolveApiUrl();
