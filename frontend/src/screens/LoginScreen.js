import { useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { TextField } from '../components/TextField';
import { AuthScreenLayout } from './AuthScreenLayout';
import { loginUser } from '../services/authApi';
import { colors, fonts, radius, spacing, type } from '../theme';
import { isValidEmail } from '../utils/validation';

const maiaIcon = require('../../assets/maia-app-icon.png');

export function LoginScreen({ navigation, onAuthenticated }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [touched, setTouched] = useState({});
  const emailIsValid = isValidEmail(email);
  const passwordIsValid = password.length > 0 && password.length <= 128;
  const canSubmit = emailIsValid && passwordIsValid;
  const updateField = (setter) => (value) => {
    setter(value);
    setError('');
  };

  const handleSubmit = async () => {
    if (!canSubmit || isSubmitting) {
      setTouched({ email: true, password: true });
      setError('Vérifie les champs indiqués.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const authData = await loginUser({
        email: email.trim().toLowerCase(),
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
      eyebrow="Connexion"
      footer={
        <BrandButton onPress={() => navigation.navigate('Register')} variant="ghost">
          Pas encore de compte ? Rejoins l'aventure
        </BrandButton>
      }
      subtitle="Connecte-toi pour retrouver ton profil, ton cycle et tes prochaines séances."
      title="Ravie de te revoir."
      topAccessory={
        <View style={styles.brandLockup}>
          <Image source={maiaIcon} style={styles.logo} />
          <View style={styles.phaseBadge}>
            <Text style={styles.phaseBadgeText}>JUST FOR HER</Text>
          </View>
        </View>
      }
    >
      <TextField
        autoComplete="email"
        error={touched.email && !emailIsValid ? 'Entre une adresse email valide.' : ''}
        keyboardType="email-address"
        label="Email"
        maxLength={254}
        onBlur={() => setTouched((current) => ({ ...current, email: true }))}
        onChangeText={updateField(setEmail)}
        placeholder="toi@email.com"
        returnKeyType="next"
        textContentType="emailAddress"
        value={email}
      />
      <TextField
        autoComplete="password"
        error={touched.password && !passwordIsValid ? 'Entre ton mot de passe.' : ''}
        label="Mot de passe"
        maxLength={128}
        onBlur={() => setTouched((current) => ({ ...current, password: true }))}
        onChangeText={updateField(setPassword)}
        onSubmitEditing={handleSubmit}
        placeholder="Ton mot de passe"
        returnKeyType="done"
        secureTextEntry
        textContentType="password"
        value={password}
      />
      <BrandButton onPress={() => navigation.navigate('PasswordResetRequest')} variant="ghost">
        Mot de passe oublié ?
      </BrandButton>
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <BrandButton disabled={isSubmitting} onPress={handleSubmit}>
        {isSubmitting ? 'Connexion...' : 'Se connecter'}
      </BrandButton>
      <Text style={styles.notice}>
        Maïa accompagne ton entraînement. L'application ne remplace pas un avis médical.
      </Text>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  brandLockup: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    gap: spacing.md
  },
  logo: {
    borderRadius: 18,
    height: 52,
    width: 52
  },
  phaseBadge: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm
  },
  phaseBadgeText: {
    ...type.eyebrow,
    color: colors.ink
  },
  notice: {
    color: colors.muted,
    fontFamily: fonts.body,
    fontSize: 12,
    letterSpacing: 0,
    lineHeight: 18,
    textAlign: 'center'
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
