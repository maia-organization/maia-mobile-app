import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BrandButton } from '../components/BrandButton';
import {
  createPlannedWorkout,
  deletePlannedWorkout,
  getPlanning,
  movePlannedWorkout
} from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const choices = [
  { label: 'Douce', type: 'gentle' },
  { label: 'Progressive', type: 'progressive' },
  { label: 'Dynamique', type: 'dynamic' }
];
const phaseColors = {
  follicular: colors.success,
  luteal: colors.honey,
  menstrual: colors.roseLight,
  ovulatory: colors.rose
};

function toDate(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function weekDays(weekStart) {
  const start = toDate(weekStart);
  return Array.from({ length: 7 }, (_, index) => new Date(start.getTime() + index * DAY_IN_MS));
}

function initialWeek() {
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  now.setDate(now.getDate() - mondayOffset);
  return formatDate(now);
}

export function PlanningScreen() {
  const [planning, setPlanning] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selectedType, setSelectedType] = useState('progressive');
  const [weekStart, setWeekStart] = useState(initialWeek);

  const loadPlanning = useCallback(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    getPlanning(weekStart)
      .then((result) => active && setPlanning(result))
      .catch((nextError) => active && setError(nextError.message))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [weekStart]);

  useFocusEffect(loadPlanning);

  const refresh = async () => {
    setIsLoading(true);
    try {
      setPlanning(await getPlanning(weekStart));
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsLoading(false);
    }
  };

  const addWorkout = async (date) => {
    if (isSaving || date < formatDate(new Date())) return;
    setIsSaving(true);
    try {
      await createPlannedWorkout({ planned_date: date, type: selectedType });
      await refresh();
    } catch (nextError) {
      Alert.alert('Impossible de planifier la séance', nextError.message);
    } finally {
      setIsSaving(false);
    }
  };

  const manageWorkout = (workout) => {
    const tomorrow = formatDate(new Date(toDate(workout.date).getTime() + DAY_IN_MS));
    Alert.alert(workout.title, 'Déplace ou retire cette séance de ton planning.', [
      { text: 'Annuler', style: 'cancel' },
      {
        text: 'Déplacer à demain',
        onPress: () =>
          void movePlannedWorkout(workout.id, tomorrow)
            .then(refresh)
            .catch((nextError) =>
              Alert.alert('Impossible de déplacer la séance', nextError.message)
            )
      },
      {
        style: 'destructive',
        text: 'Retirer',
        onPress: () =>
          void deletePlannedWorkout(workout.id)
            .then(refresh)
            .catch((nextError) => Alert.alert('Impossible de retirer la séance', nextError.message))
      }
    ]);
  };

  const changeWeek = (offset) =>
    setWeekStart((current) =>
      formatDate(new Date(toDate(current).getTime() + offset * 7 * DAY_IN_MS))
    );
  const sessionsByDate = new Map(
    (planning?.sessions || []).map((session) => [session.date, session])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>MON PLANNING</Text>
        <Text style={styles.title}>Ta semaine, à ton rythme.</Text>
        <Text style={styles.subtitle}>
          Chaque proposition s’ajuste à la phase prévue de ton cycle.
        </Text>
        <View style={styles.weekControls}>
          <BrandButton onPress={() => changeWeek(-1)} variant="ghost">
            Semaine précédente
          </BrandButton>
          <BrandButton onPress={() => changeWeek(1)} variant="ghost">
            Semaine suivante
          </BrandButton>
        </View>
        <View accessibilityRole="radiogroup" style={styles.choices}>
          {choices.map((choice) => (
            <Pressable
              accessibilityRole="radio"
              accessibilityState={{ selected: selectedType === choice.type }}
              key={choice.type}
              onPress={() => setSelectedType(choice.type)}
              style={[styles.choice, selectedType === choice.type && styles.choiceActive]}
            >
              <Text style={styles.choiceText}>{choice.label}</Text>
            </Pressable>
          ))}
        </View>
        {isLoading ? <ActivityIndicator color={colors.honey} /> : null}
        {error ? (
          <View style={styles.error}>
            <Text style={styles.errorText}>{error}</Text>
            <BrandButton onPress={() => void refresh()} variant="secondary">
              Réessayer
            </BrandButton>
          </View>
        ) : null}
        <View style={styles.days}>
          {weekDays(planning?.week_start || weekStart).map((day) => {
            const date = formatDate(day);
            const workout = sessionsByDate.get(date);
            return (
              <View key={date} style={styles.day}>
                <Text style={styles.dayLabel}>
                  {day.toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                    timeZone: 'UTC'
                  })}
                </Text>
                {workout ? (
                  <Pressable
                    accessibilityLabel={`Modifier ${workout.title}`}
                    onPress={() => manageWorkout(workout)}
                    style={styles.workout}
                  >
                    <Text style={[styles.phase, { color: phaseColors[workout.phase] }]}>
                      {workout.phase_label}
                    </Text>
                    <Text style={styles.workoutTitle}>{workout.title}</Text>
                    <Text style={styles.details}>
                      {workout.duration} min · {workout.intensity}
                    </Text>
                  </Pressable>
                ) : (
                  <BrandButton
                    disabled={isSaving || date < formatDate(new Date())}
                    onPress={() => void addWorkout(date)}
                    variant="secondary"
                  >
                    + Ajouter une séance
                  </BrandButton>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: {
    backgroundColor: colors.ink,
    gap: spacing.md,
    padding: spacing.lg,
    paddingBottom: spacing.xxl
  },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  title: { ...type.title, color: colors.white },
  subtitle: { color: colors.cream, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  weekControls: { flexDirection: 'row', justifyContent: 'space-between' },
  choices: { flexDirection: 'row', gap: spacing.sm },
  choice: {
    borderColor: colors.borderLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    flex: 1,
    padding: spacing.sm
  },
  choiceActive: { backgroundColor: colors.honey },
  choiceText: { color: colors.white, fontFamily: fonts.strong, textAlign: 'center' },
  days: { gap: spacing.sm },
  day: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    gap: spacing.sm,
    padding: spacing.md
  },
  dayLabel: { color: colors.cream, fontFamily: fonts.strong, textTransform: 'capitalize' },
  workout: {
    backgroundColor: colors.honeySoft,
    borderRadius: radius.sm,
    gap: spacing.xs,
    padding: spacing.md
  },
  phase: { fontFamily: fonts.strong, fontSize: 12 },
  workoutTitle: { color: colors.white, fontFamily: fonts.strong, fontSize: 16 },
  details: { color: colors.cream, fontFamily: fonts.body },
  error: { gap: spacing.sm },
  errorText: { color: colors.roseLight, fontFamily: fonts.body }
});
