import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '../components/BrandButton';
import { getSessionHistory, getStats } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';

function formatDistance(value) {
  const distance = Math.round(Number(value || 0) * 10) / 10;
  return `${String(distance).replace('.', ',')} km`;
}

function formatDate(value) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(value));
}

function formatDuration(value) {
  const minutes = Math.max(0, Math.round(Number(value || 0) / 60));

  return `${minutes} min`;
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
  const [sessions, setSessions] = useState([]);
  const [stats, setStats] = useState(null);
  const [sortDirection, setSortDirection] = useState('desc');

  const loadStats = useCallback(() => {
    let isActive = true;
    setError('');
    setIsLoading(true);

    Promise.all([getStats(), getSessionHistory()])
      .then(([nextStats, history]) => {
        if (isActive) {
          setStats(nextStats);
          setSessions(history.sessions);
        }
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

  const sortedSessions = [...sessions].sort((first, second) => {
    const difference = new Date(second.start_time) - new Date(first.start_time);
    return sortDirection === 'desc' ? difference : -difference;
  });

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
          <>
            <View style={styles.stats}>
              <StatCard label="Séances effectuées" value={String(stats.total_sessions)} />
              <StatCard label="Distance totale" value={formatDistance(stats.total_distance)} />
              <StatCard
                label="Distance moyenne par séance"
                value={formatDistance(stats.average_distance)}
              />
            </View>

            <View style={styles.history}>
              <View style={styles.historyHeading}>
                <Text style={styles.historyTitle}>Ton historique</Text>
                <Text style={styles.historySubtitle}>Chaque sortie nourrit ta régularité.</Text>
              </View>
              <View accessibilityLabel="Trier l'historique par date" style={styles.sortControls}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: sortDirection === 'desc' }}
                  onPress={() => setSortDirection('desc')}
                  style={[styles.sortButton, sortDirection === 'desc' && styles.sortButtonActive]}
                >
                  <Text
                    style={[styles.sortText, sortDirection === 'desc' && styles.sortTextActive]}
                  >
                    Récentes
                  </Text>
                </Pressable>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ selected: sortDirection === 'asc' }}
                  onPress={() => setSortDirection('asc')}
                  style={[styles.sortButton, sortDirection === 'asc' && styles.sortButtonActive]}
                >
                  <Text style={[styles.sortText, sortDirection === 'asc' && styles.sortTextActive]}>
                    Anciennes
                  </Text>
                </Pressable>
              </View>

              {sortedSessions.length ? (
                <View style={styles.sessionList}>
                  {sortedSessions.map((session) => (
                    <View
                      accessibilityLabel={`${formatDate(session.start_time)}, Course à pied, ${formatDuration(session.duration)}, ${session.status === 'completed' ? 'terminée' : 'en cours'}`}
                      accessible
                      key={session.id}
                      style={styles.sessionCard}
                    >
                      <View>
                        <Text style={styles.sessionDate}>{formatDate(session.start_time)}</Text>
                        <Text style={styles.sessionType}>Course à pied</Text>
                      </View>
                      <View style={styles.sessionDetails}>
                        <Text style={styles.sessionDuration}>
                          {formatDuration(session.duration)}
                        </Text>
                        <Text style={styles.sessionStatus}>
                          {session.status === 'completed' ? '✓ Terminée' : 'En cours'}
                        </Text>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyHistory}>
                  <Text style={styles.emptyHistoryText}>
                    Tes prochaines séances apparaîtront ici, à ton rythme.
                  </Text>
                </View>
              )}
            </View>
          </>
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
  history: { gap: spacing.md },
  historyHeading: { gap: spacing.xs },
  historyTitle: { ...type.subtitle, color: colors.white },
  historySubtitle: { color: colors.cream, fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  sortControls: { flexDirection: 'row', gap: spacing.sm },
  sortButton: {
    borderColor: colors.cream,
    borderRadius: radius.sm,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  sortButtonActive: { backgroundColor: colors.rose, borderColor: colors.rose },
  sortText: { color: colors.cream, fontFamily: fonts.strong, fontSize: 14 },
  sortTextActive: { color: colors.white },
  sessionList: { gap: spacing.sm },
  sessionCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg
  },
  sessionDate: { color: colors.white, fontFamily: fonts.strong, fontSize: 16, lineHeight: 22 },
  sessionType: { color: colors.cream, fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  sessionDetails: { alignItems: 'flex-end', gap: spacing.xs },
  sessionDuration: { color: colors.honey, fontFamily: fonts.strong, fontSize: 15 },
  sessionStatus: { color: colors.rose, fontFamily: fonts.strong, fontSize: 13 },
  emptyHistory: {
    borderColor: colors.cream,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.lg
  },
  emptyHistoryText: { color: colors.cream, fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
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
