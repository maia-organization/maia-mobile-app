import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { TextField } from '../components/TextField';
import { AuthScreenLayout } from './AuthScreenLayout';
import { registerUser } from '../services/authApi';
import { colors, fonts, radius, spacing, type } from '../theme';
import {
  isNumberInRange,
  isStrongPassword,
  isValidEmail,
  isValidIsoDate
} from '../utils/validation';

const steps = ['Compte', 'Profil', 'Cycle'];
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

export function RegisterScreen({ navigation, onAuthenticated }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [level, setLevel] = useState('debutante');
  const [goal, setGoal] = useState('regularite');
  const [cycleStartDate, setCycleStartDate] = useState(new Date().toISOString().slice(0, 10));
  const [cycleLength, setCycleLength] = useState('28');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const nameIsValid = name.trim().length >= 2 && name.trim().length <= 50;
  const emailIsValid = isValidEmail(email);
  const passwordIsValid = isStrongPassword(password);
  const confirmationIsValid = passwordConfirmation.length > 0 && passwordConfirmation === password;
  const accountIsValid = nameIsValid && emailIsValid && passwordIsValid && confirmationIsValid;
  const cycleLengthValue = Number(cycleLength);
  const cycleIsValid =
    isValidIsoDate(cycleStartDate) &&
    Number.isInteger(cycleLengthValue) &&
    isNumberInRange(cycleLengthValue, 21, 40);
  const canSubmit = accountIsValid && cycleIsValid;

  const touch = (field) => setTouched((current) => ({ ...current, [field]: true }));
  const updateField = (setter) => (value) => {
    setter(value);
    setError('');
  };

  const markAccountTouched = () => {
    setTouched((current) => ({
      ...current,
      email: true,
      name: true,
      password: true,
      passwordConfirmation: true
    }));
  };

  const goNext = () => {
    setError('');

    if (step === 0 && !accountIsValid) {
      markAccountTouched();
      setError('Vérifie les champs indiqués avant de continuer.');
      return;
    }

    setStep((currentStep) => Math.min(currentStep + 1, steps.length - 1));
  };

  const goBack = () => {
    setError('');
    setStep((currentStep) => Math.max(currentStep - 1, 0));
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      markAccountTouched();
      setTouched((current) => ({ ...current, cycleLength: true, cycleStartDate: true }));

      if (!cycleIsValid) {
        setError('Vérifie les informations de ton cycle.');
      } else {
        setError('Vérifie les champs indiqués avant de créer ton compte.');
      }

      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const authData = await registerUser({
        cycle_length: cycleLengthValue,
        cycle_start_date: cycleStartDate,
        email: email.trim().toLowerCase(),
        goal,
        level,
        name: name.trim(),
        password
      });

      await onAuthenticated(authData);
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }]
      });
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout
      eyebrow="Inscription"
      footer={
        <BrandButton onPress={() => navigation.navigate('Login')} variant="ghost">
          Déjà un compte ? Connecte-toi
        </BrandButton>
      }
      subtitle="Crée ton compte, puis donne à Maïa les infos utiles pour adapter tes premières séances."
      title="Crée ton espace Maïa."
    >
      <View style={styles.stepper}>
        {steps.map((stepLabel, index) => (
          <View key={stepLabel} style={[styles.stepDot, index <= step && styles.stepDotActive]}>
            <Text style={[styles.stepDotText, index <= step && styles.stepDotTextActive]}>
              {index + 1}
            </Text>
          </View>
        ))}
      </View>

      {step === 0 ? (
        <View style={styles.stepContent}>
          <TextField
            autoCapitalize="words"
            error={touched.name && !nameIsValid ? 'Saisis un prénom de 2 à 50 caractères.' : ''}
            label="Prénom"
            maxLength={50}
            onBlur={() => touch('name')}
            onChangeText={updateField(setName)}
            placeholder="Ton prénom"
            returnKeyType="next"
            value={name}
          />
          <TextField
            autoComplete="email"
            error={touched.email && !emailIsValid ? 'Entre une adresse email valide.' : ''}
            keyboardType="email-address"
            label="Email"
            maxLength={254}
            onBlur={() => touch('email')}
            onChangeText={updateField(setEmail)}
            placeholder="toi@email.com"
            returnKeyType="next"
            textContentType="emailAddress"
            value={email}
          />
          <TextField
            autoComplete="new-password"
            error={
              touched.password && !passwordIsValid
                ? 'Le mot de passe ne respecte pas encore toutes les règles.'
                : ''
            }
            label="Mot de passe"
            maxLength={128}
            onBlur={() => touch('password')}
            onChangeText={updateField(setPassword)}
            placeholder="Crée un mot de passe solide"
            returnKeyType="next"
            secureTextEntry
            textContentType="newPassword"
            value={password}
          />
          <PasswordRequirements password={password} />
          <TextField
            autoComplete="new-password"
            error={
              touched.passwordConfirmation && !confirmationIsValid
                ? 'Les deux mots de passe doivent être identiques.'
                : ''
            }
            label="Confirme le mot de passe"
            maxLength={128}
            onBlur={() => touch('passwordConfirmation')}
            onChangeText={updateField(setPasswordConfirmation)}
            onSubmitEditing={goNext}
            placeholder="Saisis-le une seconde fois"
            returnKeyType="next"
            secureTextEntry
            textContentType="newPassword"
            value={passwordConfirmation}
          />
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.stepContent}>
          <View style={styles.optionGroup}>
            <Text style={styles.groupLabel}>Ton niveau</Text>
            <View style={styles.optionGrid}>
              {levels.map((option) => (
                <BrandButton
                  key={option.value}
                  onPress={() => setLevel(option.value)}
                  variant={level === option.value ? 'secondary' : 'ghost'}
                >
                  {option.label}
                </BrandButton>
              ))}
            </View>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.groupLabel}>Ton objectif</Text>
            <View style={styles.optionGrid}>
              {goals.map((option) => (
                <BrandButton
                  key={option.value}
                  onPress={() => setGoal(option.value)}
                  variant={goal === option.value ? 'secondary' : 'ghost'}
                >
                  {option.label}
                </BrandButton>
              ))}
            </View>
          </View>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.stepContent}>
          <Text style={styles.helper}>
            Ces infos servent à placer ton entraînement dans la bonne phase du cycle.
          </Text>
          <TextField
            error={
              touched.cycleStartDate && !isValidIsoDate(cycleStartDate)
                ? "Entre une date valide qui n'est pas dans le futur."
                : ''
            }
            helperText="Format : AAAA-MM-JJ"
            keyboardType="numbers-and-punctuation"
            label="Début des dernières règles"
            maxLength={10}
            onBlur={() => touch('cycleStartDate')}
            onChangeText={updateField(setCycleStartDate)}
            placeholder="AAAA-MM-JJ"
            returnKeyType="next"
            value={cycleStartDate}
          />
          <TextField
            error={
              touched.cycleLength &&
              (!Number.isInteger(cycleLengthValue) || !isNumberInRange(cycleLengthValue, 21, 40))
                ? 'Saisis une durée comprise entre 21 et 40 jours.'
                : ''
            }
            helperText="Entre 21 et 40 jours"
            keyboardType="number-pad"
            label="Durée moyenne du cycle"
            maxLength={2}
            onBlur={() => touch('cycleLength')}
            onChangeText={updateField(setCycleLength)}
            onSubmitEditing={handleSubmit}
            placeholder="28"
            returnKeyType="done"
            value={cycleLength}
          />
        </View>
      ) : null}

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <View style={styles.actions}>
        {step > 0 ? (
          <View style={styles.actionsWithBack}>
            <BrandButton compact disabled={isSubmitting} onPress={goBack} variant="ghost">
              Retour
            </BrandButton>
            <View style={styles.primaryAction}>
              {step < steps.length - 1 ? (
                <BrandButton onPress={goNext}>Continuer</BrandButton>
              ) : (
                <BrandButton disabled={isSubmitting} onPress={handleSubmit}>
                  {isSubmitting ? 'Création...' : 'Créer le compte'}
                </BrandButton>
              )}
            </View>
          </View>
        ) : (
          <BrandButton onPress={goNext}>Continuer</BrandButton>
        )}
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  stepper: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center',
    marginBottom: spacing.sm
  },
  stepDot: {
    alignItems: 'center',
    borderColor: colors.borderLight,
    borderRadius: radius.round,
    borderWidth: 1,
    height: 32,
    justifyContent: 'center',
    width: 32
  },
  stepDotActive: {
    backgroundColor: colors.honey,
    borderColor: colors.honey
  },
  stepDotText: {
    ...type.eyebrow,
    color: colors.white
  },
  stepDotTextActive: {
    color: colors.ink
  },
  stepContent: {
    gap: spacing.lg
  },
  optionGroup: {
    gap: spacing.md
  },
  optionGrid: {
    gap: spacing.sm
  },
  primaryAction: {
    flex: 1
  },
  groupLabel: {
    color: colors.cream,
    fontFamily: fonts.strong,
    fontSize: 13,
    letterSpacing: 0
  },
  helper: {
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 14,
    letterSpacing: 0,
    lineHeight: 20
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.sm
  },
  actionsWithBack: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm
  },
  error: {
    color: colors.roseLight,
    fontFamily: fonts.strong,
    fontSize: 13,
    letterSpacing: 0,
    lineHeight: 18,
    textAlign: 'center'
  }
});
