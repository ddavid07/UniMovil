import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../../shared/theme';

export function MapAttribution() {
  const [error, setError] = useState(false);

  function openAttribution(): void {
    setError(false);
    void Linking.openURL('https://www.openstreetmap.org/copyright').catch(() => {
      setError(true);
    });
  }

  return (
    <View>
      <View style={styles.container}>
        <Pressable
          accessibilityLabel="Créditos y licencia de OpenStreetMap"
          accessibilityRole="link"
          onPress={openAttribution}
          style={styles.link}
        >
          <Text style={styles.linkText}>© OpenStreetMap contributors</Text>
        </Pressable>
        <Text style={styles.detail}>Datos ODbL 1.0 · Mapa base OpenStreetMap</Text>
      </View>
      {error && (
        <Text accessibilityRole="alert" style={styles.detail}>
          No se pudieron abrir los créditos de OpenStreetMap.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 44,
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    columnGap: 8,
  },
  link: {
    minHeight: 44,
    justifyContent: 'center',
    paddingRight: 4,
  },
  linkText: {
    color: colors.universityRedDark,
    fontSize: 12,
    fontWeight: '700',
    textDecorationLine: 'underline',
  },
  detail: {
    color: colors.muted,
    fontSize: 11,
  },
});
