import { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '../components/BrandButton';
import { getStats } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';

function formatDistance(value) {
  const distance = Math.round(Number(value || 0) * 10) / 10;
  return `${String(distance).replace('.', ',')} km`;
}

function StatCard({ label, value }) {
  return (
    <View accessibilityLabel={`${label} : ${value}`} accessible style={styles.statCard}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

export function StatsScreen() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);

  const loadStats = useCallback(() => {
    let isActive = true;
    setError('');
    setIsLoading(true);

    getStats()
      .then((nextStats) => {
        if (isActive) setStats(nextStats);
      })
      .catch((nextError) => {
        if (isActive) setError(nextError.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(loadStats);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>TES PROGRÈS</Text>
          <Text style={styles.title}>Tes statistiques.</Text>
          <Text style={styles.subtitle}>
            Chaque séance compte. Observe ta régularité à ton rythme.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.loadingCard}>
            <ActivityIndicator color={colors.honey} />
            <Text style={styles.loadingText}>Mise à jour de tes statistiques…</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.errorCard}>
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {error}
            </Text>
            <BrandButton onPress={loadStats} variant="secondary">
              Réessayer
            </BrandButton>
          </View>
        ) : null}

        {stats ? (
          <View style={styles.stats}>
            <StatCard label="Séances effectuées" value={String(stats.total_sessions)} />
            <StatCard label="Distance totale" value={formatDistance(stats.total_distance)} />
            <StatCard
              label="Distance moyenne par séance"
              value={formatDistance(stats.average_distance)}
            />
          </View>
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: { flexGrow: 1, gap: spacing.xl, padding: spacing.xl },
  heading: { gap: spacing.md },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  title: { ...type.title, color: colors.white },
  subtitle: { color: colors.cream, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  stats: { gap: spacing.md },
  statCard: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    gap: spacing.xs,
    padding: spacing.lg
  },
  statValue: { color: colors.ink, fontFamily: fonts.heading, fontSize: 35, lineHeight: 42 },
  statLabel: { color: colors.ink, fontFamily: fonts.strong, fontSize: 16, lineHeight: 22 },
  loadingCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    gap: spacing.md,
    padding: spacing.xl
  },
  loadingText: { color: colors.cream, fontFamily: fonts.body, fontSize: 16, textAlign: 'center' },
  errorCard: {
    borderColor: colors.rose,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  errorText: { color: colors.white, fontFamily: fonts.body, fontSize: 15, lineHeight: 21 }
});
