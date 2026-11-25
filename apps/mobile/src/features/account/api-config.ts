import { Platform } from 'react-native';

const configuredApiUrl = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api';

export const API_BASE_URL =
  Platform.OS === 'android'
    ? configuredApiUrl.replace('localhost', '10.0.2.2').replace('127.0.0.1', '10.0.2.2')
    : configuredApiUrl;
