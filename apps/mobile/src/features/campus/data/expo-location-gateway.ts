import * as Location from 'expo-location';
import { Linking } from 'react-native';
import type { LocationGateway } from '../domain/location';

export const expoLocationGateway: LocationGateway = {
  async getForegroundPermission() {
    const permission = await Location.getForegroundPermissionsAsync();

    return {
      granted: permission.granted,
      canAskAgain: permission.canAskAgain,
    };
  },

  async requestForegroundPermission() {
    const permission = await Location.requestForegroundPermissionsAsync();

    return {
      granted: permission.granted,
      canAskAgain: permission.canAskAgain,
    };
  },

  areLocationServicesEnabled: () => Location.hasServicesEnabledAsync(),

  async getCurrentPosition() {
    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: false,
    });

    return {
      latitude: position.coords.latitude,
      longitude: position.coords.longitude,
    };
  },

  openSettings: () => Linking.openSettings(),
};
