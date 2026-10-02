import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BrandButton } from '../components/BrandButton';
import { getTodayWorkout, startSession } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';

const maiaIcon = require('../../assets/maia-app-icon.png');

const intensityLabels = {
  high: 'Élevée',
  low: 'Douce',
  moderate: 'Modérée',
  progressive: 'Progressive'
};

export function HomeScreen({ navigation, onLogout }) {
  const [error, setError] = useState('');
  const [isLoadingWorkout, setIsLoadingWorkout] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [workout, setWorkout] = useState(null);

  const loadWorkout = useCallback(() => {
    let isActive = true;
    setError('');
    setIsLoadingWorkout(true);

    getTodayWorkout()
      .then((nextWorkout) => {
        if (isActive) setWorkout(nextWorkout);
      })
      .catch((nextError) => {
        if (isActive) setError(nextError.message);
      })
      .finally(() => {
        if (isActive) setIsLoadingWorkout(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  useFocusEffect(loadWorkout);

  const handleLogout = async () => {
    await onLogout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }]
    });
  };

  const handleStartWorkout = async () => {
    if (isStarting) return;

    setIsStarting(true);
    try {
      const { session_id: sessionId } = await startSession();
      navigation.navigate('Session', { sessionId });
    } catch (nextError) {
      Alert.alert('Impossible de démarrer la séance', nextError.message);
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={maiaIcon} style={styles.logo} />
          <Text style={styles.eyebrow}>ESPACE MAÏA</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.title}>Ta séance du jour.</Text>
            <Text style={styles.subtitle}>
              Une recommandation adaptée à ton niveau, ton objectif et ta phase de cycle.
            </Text>
          </View>

          {isLoadingWorkout ? (
            <View style={styles.todayCard}>
              <ActivityIndicator color={colors.ink} />
              <Text style={styles.loadingText}>Préparation de ta séance…</Text>
            </View>
          ) : null}

          {error ? (
            <View style={styles.errorCard}>
              <Text accessibilityLiveRegion="polite" style={styles.errorText}>
                {error}
              </Text>
              <BrandButton onPress={loadWorkout} variant="secondary">
                Réessayer
              </BrandButton>
            </View>
          ) : null}

          {workout ? (
            <View style={styles.todayCard}>
              <Text style={styles.cardEyebrow}>AUJOURD’HUI · {workout.phase}</Text>
              {workout.completed ? (
                <View
                  accessibilityLabel="Séance du jour terminée et ajoutée à ton historique"
                  accessible
                  style={styles.completedBanner}
                >
                  <Text style={styles.completedBadge}>✓ TERMINÉE</Text>
                  <Text style={styles.completedText}>
                    Bravo, ta séance du jour est ajoutée à ton historique.
                  </Text>
                </View>
              ) : null}
              <Text style={styles.cardTitle}>{workout.title}</Text>
              <View style={styles.workoutDetails}>
                <Text style={styles.detailText}>{workout.duration} minutes</Text>
                <Text style={styles.detailText}>
                  Intensité {intensityLabels[workout.intensity] || workout.intensity}
                </Text>
              </View>
              {workout.adaptation ? (
                <Text style={styles.adaptation}>{workout.adaptation}</Text>
              ) : null}
              <BrandButton
                disabled={isStarting}
                onPress={() => void handleStartWorkout()}
                variant="primary"
              >
                {isStarting
                  ? 'Démarrage…'
                  : workout.completed
                    ? 'Lancer une nouvelle séance'
                    : 'Lancer ma séance'}
              </BrandButton>
            </View>
          ) : null}
        </View>

        <View style={styles.actions}>
          <BrandButton onPress={() => navigation.navigate('Profile')} variant="secondary">
            Consulter mon profil
          </BrandButton>
          <BrandButton onPress={() => navigation.navigate('Cycle')} variant="secondary">
            Consulter mon cycle
          </BrandButton>
          <BrandButton onPress={() => navigation.navigate('ProfileSetup')}>
            Compléter mon profil
          </BrandButton>
          <BrandButton onPress={handleLogout} variant="ghost">
            Se déconnecter
          </BrandButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: colors.ink,
    flex: 1
  },
  screen: {
    backgroundColor: colors.ink,
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: spacing.xl
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md
  },
  logo: {
    borderRadius: radius.sm,
    height: 48,
    width: 48
  },
  eyebrow: {
    ...type.eyebrow,
    color: colors.rose
  },
  content: {
    gap: spacing.xl,
    paddingVertical: spacing.xxl
  },
  hero: {
    gap: spacing.lg
  },
  title: {
    ...type.title,
    color: colors.white
  },
  subtitle: {
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 17,
    letterSpacing: 0,
    lineHeight: 25
  },
  todayCard: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    gap: spacing.md,
    padding: spacing.lg
  },
  errorCard: {
    borderColor: colors.rose,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  errorText: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 15,
    lineHeight: 21
  },
  loadingText: {
    color: colors.ink,
    fontFamily: fonts.strong,
    fontSize: 16,
    textAlign: 'center'
  },
  cardEyebrow: {
    ...type.eyebrow,
    color: colors.ink
  },
  completedBanner: {
    alignItems: 'flex-start',
    gap: spacing.xs
  },
  completedBadge: {
    ...type.eyebrow,
    backgroundColor: colors.ink,
    borderRadius: radius.round,
    color: colors.success,
    overflow: 'hidden',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs
  },
  completedText: {
    color: colors.ink,
    fontFamily: fonts.strong,
    fontSize: 15,
    lineHeight: 21
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fonts.heading,
    fontSize: 22,
    letterSpacing: 0,
    lineHeight: 27
  },
  workoutDetails: { gap: spacing.xs },
  detailText: { color: colors.ink, fontFamily: fonts.strong, fontSize: 16, lineHeight: 22 },
  adaptation: { color: colors.ink, fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  actions: {
    gap: spacing.md
  }
});
