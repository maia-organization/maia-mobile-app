import { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BrandButton } from '../components/BrandButton';
import { CycleSettingsForm } from '../components/CycleSettingsForm';
import { CycleTimeline } from '../components/CycleTimeline';
import { getCycleView, updateCycle } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';
import { isNumberInRange, isValidIsoDate } from '../utils/validation';

const phaseColors = {
  follicular: colors.honey,
  luteal: colors.roseLight,
  menstrual: colors.rose,
  ovulatory: colors.success
};

export function CycleScreen({ navigation }) {
  const [cycle, setCycle] = useState(null);
  const [cycleStartDate, setCycleStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const cycleLengthValue = Number(cycleLength);
  const isValid =
    isValidIsoDate(cycleStartDate) &&
    Number.isInteger(cycleLengthValue) &&
    isNumberInRange(cycleLengthValue, 21, 40);

  const loadCycle = useCallback(() => {
    let isActive = true;
    setError('');
    setIsLoading(true);

    getCycleView()
      .then((nextCycle) => {
        if (!isActive) return;
        setCycle(nextCycle);
        setCycleStartDate(nextCycle.cycle_start_date);
        setCycleLength(String(nextCycle.cycle_length));
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

  useFocusEffect(loadCycle);

  const updateField = (setter) => (value) => {
    setter(value);
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!isValid) {
      setShowValidation(true);
      setError('Vérifie les informations de ton cycle.');
      return;
    }

    setIsSaving(true);
    try {
      const nextCycle = await updateCycle({
        cycle_length: cycleLengthValue,
        cycle_start_date: cycleStartDate
      });
      setCycle(nextCycle);
      setCycleStartDate(nextCycle.cycle_start_date);
      setCycleLength(String(nextCycle.cycle_length));
      setShowValidation(false);
      setSuccess('Cycle mis à jour. Tes prochaines séances s’adapteront à cette phase.');
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.honey} />
        </View>
      </SafeAreaView>
    );
  }

  if (error && !cycle) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorScreen}>
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
          <BrandButton onPress={loadCycle} variant="secondary">
            Réessayer
          </BrandButton>
          <BrandButton onPress={() => navigation.goBack()} variant="ghost">
            Retour
          </BrandButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MON CYCLE</Text>
          <Text style={styles.title}>À ton rythme.</Text>
          <Text style={styles.subtitle}>
            Tes informations permettent à Maïa de mieux ajuster tes conseils et tes runs.
          </Text>
        </View>

        {cycle ? (
          <>
            <View accessibilityLiveRegion="polite" style={styles.phaseCard}>
              <Text style={styles.phaseLabel}>AUJOURD’HUI · JOUR {cycle.cycle_day}</Text>
              <Text style={[styles.phaseTitle, { color: phaseColors[cycle.current_phase] }]}>
                {cycle.current_phase_label}
              </Text>
              <Text style={styles.phaseText}>
                Prochain cycle prévu le {cycle.next_cycle_start_date}.
              </Text>
            </View>
            <CycleTimeline
              currentPhase={cycle.current_phase}
              projections={cycle.phase_projections}
            />
          </>
        ) : null}

        <CycleSettingsForm
          cycleLength={cycleLength}
          cycleStartDate={cycleStartDate}
          error={error}
          isSaving={isSaving}
          onCycleLengthChange={updateField(setCycleLength)}
          onCycleStartDateChange={updateField(setCycleStartDate)}
          onSave={handleSave}
          onSecondaryAction={() => navigation.navigate('Profile')}
          primaryLabel="Mettre à jour mon cycle"
          savingLabel="Mise à jour…"
          secondaryLabel="Retour au profil"
          showValidation={showValidation}
          success={success}
          title="Ajuster mes informations"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  errorScreen: { flex: 1, gap: spacing.lg, justifyContent: 'center', padding: spacing.xl },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  header: { gap: spacing.md },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  phaseCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.xl
  },
  phaseLabel: { ...type.eyebrow, color: colors.cream },
  phaseText: { color: colors.cream, fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  phaseTitle: { fontFamily: fonts.heading, fontSize: 28, lineHeight: 34 },
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: { gap: spacing.xxl, padding: spacing.xl },
  subtitle: { color: colors.cream, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  title: { ...type.title, color: colors.white }
});
