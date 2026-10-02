import { useCallback, useState } from 'react';
import { ActivityIndicator, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BrandButton } from '../components/BrandButton';
import { CycleFields } from '../components/CycleFields';
import { TextField } from '../components/TextField';
import { getProfile, updateProfile } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';
import { isNumberInRange, isValidIsoDate } from '../utils/validation';

const levels = [
  { label: 'Débutante', value: 'debutante' },
  { label: 'Intermédiaire', value: 'intermediaire' },
  { label: 'Avancée', value: 'avancee' }
];
const goals = [
  { label: 'Régularité', value: 'regularite' },
  { label: 'Endurance', value: 'endurance' },
  { label: 'Performance', value: 'performance' }
];

export function ProfileSetupScreen({ navigation }) {
  const [birthdate, setBirthdate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [level, setLevel] = useState('debutante');
  const [goal, setGoal] = useState('regularite');
  const [cycleStartDate, setCycleStartDate] = useState('');
  const [cycleLength, setCycleLength] = useState('28');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showValidation, setShowValidation] = useState(false);
  const birthdateIsValid = isValidIsoDate(birthdate);
  const weightIsValid = isNumberInRange(weight, 30, 300);
  const heightIsValid = isNumberInRange(height, 120, 230);
  const cycleLengthValue = Number(cycleLength);
  const cycleIsValid =
    isValidIsoDate(cycleStartDate) &&
    Number.isInteger(cycleLengthValue) &&
    isNumberInRange(cycleLengthValue, 21, 40);
  const formIsValid = birthdateIsValid && weightIsValid && heightIsValid && cycleIsValid;
  const updateField = (setter) => (value) => {
    setter(value);
    setError('');
    setSuccess('');
  };
  const selectOption = (setter, value) => {
    setter(value);
    setError('');
    setSuccess('');
  };

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      setError('');
      setSuccess('');
      setIsLoading(true);

      getProfile()
        .then(({ user }) => {
          if (!isActive) return;
          setBirthdate(user.birthdate || '');
          setWeight(String(user.weight || ''));
          setHeight(String(user.height || ''));
          setLevel(user.level || 'debutante');
          setGoal(user.goal || 'regularite');
          setCycleStartDate(user.cycleStartDate || '');
          setCycleLength(String(user.cycleLength || 28));
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
    }, [])
  );

  const handleSave = async () => {
    setError('');
    setSuccess('');

    if (!formIsValid) {
      setShowValidation(true);
      setError('Vérifie les champs indiqués avant de sauvegarder.');
      return;
    }

    setIsSaving(true);

    try {
      await updateProfile({
        birthdate,
        cycle_length: Number(cycleLength),
        cycle_start_date: cycleStartDate,
        goal,
        height: Number(height),
        level,
        weight: Number(weight)
      });
      setSuccess('Profil sauvegardé. Tes prochaines recommandations utiliseront ces informations.');
      setShowValidation(false);
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

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.eyebrow}>PROFIL MVP</Text>
          <Text style={styles.title}>Personnalise tes runs.</Text>
          <Text style={styles.subtitle}>
            Maïa utilise ces infos pour ajuster intensité, récupération et rythme.
          </Text>
        </View>

        <View style={styles.form}>
          <TextField
            error={
              showValidation && !birthdateIsValid
                ? "Entre une date valide qui n'est pas dans le futur."
                : ''
            }
            helperText="Format : AAAA-MM-JJ"
            keyboardType="numbers-and-punctuation"
            label="Date de naissance"
            maxLength={10}
            onChangeText={updateField(setBirthdate)}
            placeholder="AAAA-MM-JJ"
            value={birthdate}
          />
          <View style={styles.inlineFields}>
            <View style={styles.inlineField}>
              <TextField
                error={showValidation && !weightIsValid ? 'Saisis un poids de 30 à 300 kg.' : ''}
                helperText="En kg"
                keyboardType="decimal-pad"
                label="Poids"
                maxLength={6}
                onChangeText={updateField(setWeight)}
                placeholder="60"
                value={weight}
              />
            </View>
            <View style={styles.inlineField}>
              <TextField
                error={showValidation && !heightIsValid ? 'Saisis une taille de 120 à 230 cm.' : ''}
                helperText="En cm"
                keyboardType="number-pad"
                label="Taille"
                maxLength={3}
                onChangeText={updateField(setHeight)}
                placeholder="165"
                value={height}
              />
            </View>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.groupLabel}>Niveau</Text>
            <View style={styles.optionGrid}>
              {levels.map((option) => (
                <BrandButton
                  key={option.value}
                  onPress={() => selectOption(setLevel, option.value)}
                  variant={level === option.value ? 'secondary' : 'ghost'}
                >
                  {option.label}
                </BrandButton>
              ))}
            </View>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.groupLabel}>Objectif</Text>
            <View style={styles.optionGrid}>
              {goals.map((option) => (
                <BrandButton
                  key={option.value}
                  onPress={() => selectOption(setGoal, option.value)}
                  variant={goal === option.value ? 'secondary' : 'ghost'}
                >
                  {option.label}
                </BrandButton>
              ))}
            </View>
          </View>

          <CycleFields
            cycleLength={cycleLength}
            cycleStartDate={cycleStartDate}
            onCycleLengthChange={updateField(setCycleLength)}
            onCycleStartDateChange={updateField(setCycleStartDate)}
            onSubmitEditing={handleSave}
            showValidation={showValidation}
          />

          {error ? (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
          ) : null}
          {success ? (
            <Text accessibilityLiveRegion="polite" style={styles.success}>
              {success}
            </Text>
          ) : null}
        </View>

        <View style={styles.actions}>
          <BrandButton disabled={isSaving} onPress={handleSave}>
            {isSaving ? 'Sauvegarde...' : 'Sauvegarder mon profil'}
          </BrandButton>
          <BrandButton onPress={() => navigation.navigate('Home')} variant="ghost">
            Retour à l'accueil
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
    gap: spacing.xxl,
    padding: spacing.xl
  },
  loading: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center'
  },
  header: {
    gap: spacing.md
  },
  eyebrow: {
    ...type.eyebrow,
    color: colors.rose
  },
  title: {
    ...type.title,
    color: colors.white
  },
  subtitle: {
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 23
  },
  form: {
    gap: spacing.lg
  },
  inlineFields: {
    flexDirection: 'row',
    gap: spacing.md
  },
  inlineField: {
    flex: 1
  },
  optionGroup: {
    gap: spacing.md
  },
  optionGrid: {
    gap: spacing.sm
  },
  groupLabel: {
    color: colors.cream,
    fontFamily: fonts.strong,
    fontSize: 13,
    letterSpacing: 0
  },
  actions: {
    gap: spacing.md
  },
  error: {
    color: colors.roseLight,
    fontFamily: fonts.strong,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
    textAlign: 'center'
  },
  success: {
    backgroundColor: colors.honeySoft,
    borderColor: colors.borderLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.honey,
    fontFamily: fonts.strong,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
    padding: spacing.md,
    textAlign: 'center'
  }
});
