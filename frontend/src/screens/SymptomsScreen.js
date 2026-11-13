import { useCallback, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '../components/BrandButton';
import { getSymptoms, saveTodaySymptoms } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';

const options = [
  { id: 'pain', label: 'Douleurs' },
  { id: 'fatigue', label: 'Fatigue' },
  { id: 'low_mood', label: 'Humeur basse' }
];

function dateLabel(value) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long' }).format(
    new Date(value)
  );
}

export function SymptomsScreen({ navigation }) {
  const [entries, setEntries] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [selected, setSelected] = useState([]);

  const load = useCallback(() => {
    let active = true;
    setError('');
    setIsLoading(true);
    getSymptoms()
      .then((data) => {
        if (!active) return;
        setEntries(data.entries);
        const today = new Date().toISOString().slice(0, 10);
        setSelected(data.entries.find((entry) => entry.recorded_on === today)?.symptoms || []);
      })
      .catch((nextError) => active && setError(nextError.message))
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, []);

  useFocusEffect(load);

  const toggle = (symptom) => {
    setSelected((current) =>
      current.includes(symptom) ? current.filter((item) => item !== symptom) : [...current, symptom]
    );
  };

  const save = async () => {
    if (!selected.length || isSaving) return;
    setError('');
    setIsSaving(true);
    try {
      const entry = await saveTodaySymptoms(selected);
      setEntries((current) => [
        entry,
        ...current.filter((item) => item.recorded_on !== entry.recorded_on)
      ]);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MON RESSENTI</Text>
          <Text style={styles.title}>Comment te sens-tu ?</Text>
          <Text style={styles.subtitle}>
            Facultatif, rapide, et utile pour alléger ta séance si besoin.
          </Text>
        </View>
        {isLoading ? <ActivityIndicator color={colors.honey} /> : null}
        {error ? (
          <View style={styles.errorCard}>
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
            <BrandButton onPress={load} variant="secondary">
              Réessayer
            </BrandButton>
          </View>
        ) : null}
        {!isLoading ? (
          <>
            <View style={styles.options}>
              {options.map((option) => {
                const isSelected = selected.includes(option.id);
                return (
                  <Pressable
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: isSelected }}
                    key={option.id}
                    onPress={() => toggle(option.id)}
                    style={[styles.option, isSelected && styles.optionSelected]}
                  >
                    <Text style={[styles.optionText, isSelected && styles.optionTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <BrandButton disabled={!selected.length || isSaving} onPress={() => void save()}>
              {isSaving ? 'Enregistrement…' : 'Enregistrer mon ressenti'}
            </BrandButton>
            <BrandButton onPress={() => navigation.navigate('Home')} variant="ghost">
              Passer cette étape
            </BrandButton>
            <View style={styles.history}>
              <Text style={styles.historyTitle}>Historique des symptômes</Text>
              {entries.length ? (
                entries.map((entry) => (
                  <View key={entry.recorded_on} style={styles.historyItem}>
                    <Text style={styles.historyDate}>{dateLabel(entry.recorded_on)}</Text>
                    <Text style={styles.historySymptoms}>
                      {entry.symptoms
                        .map((item) => options.find((option) => option.id === item)?.label)
                        .join(' · ')}
                    </Text>
                  </View>
                ))
              ) : (
                <Text style={styles.empty}>Aucun symptôme renseigné pour le moment.</Text>
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
  screen: { gap: spacing.xl, padding: spacing.xl },
  header: { gap: spacing.md },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  title: { ...type.title, color: colors.white },
  subtitle: { color: colors.cream, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  options: { gap: spacing.sm },
  option: {
    borderColor: colors.cream,
    borderRadius: radius.sm,
    borderWidth: 1,
    padding: spacing.lg
  },
  optionSelected: { backgroundColor: colors.honey, borderColor: colors.honey },
  optionText: { color: colors.cream, fontFamily: fonts.strong, fontSize: 16 },
  optionTextSelected: { color: colors.ink },
  errorCard: {
    borderColor: colors.rose,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.md,
    padding: spacing.lg
  },
  error: { color: colors.white, fontFamily: fonts.body },
  history: { gap: spacing.sm },
  historyTitle: { ...type.subtitle, color: colors.white },
  historyItem: {
    backgroundColor: colors.surface,
    borderRadius: radius.sm,
    gap: spacing.xs,
    padding: spacing.md
  },
  historyDate: { color: colors.honey, fontFamily: fonts.strong },
  historySymptoms: { color: colors.cream, fontFamily: fonts.body },
  empty: { color: colors.cream, fontFamily: fonts.body }
});
