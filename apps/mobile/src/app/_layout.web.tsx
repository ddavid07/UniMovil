import 'leaflet/dist/leaflet.css';
import '../features/campus/map/leaflet.css';
import '../styles/web.css';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors } from '../shared/theme';
import { AuthProvider } from '../features/account/AuthProvider';

export default function WebRootLayout() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.canvas },
          }}
        />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
