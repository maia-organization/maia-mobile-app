import { useState } from 'react';
import { Text } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { TextField } from '../components/TextField';
import { requestPasswordReset } from '../services/authApi';
import { colors, fonts } from '../theme';
import { AuthScreenLayout } from './AuthScreenLayout';
import { isValidEmail } from '../utils/validation';

export function PasswordResetRequestScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const emailIsValid = isValidEmail(email);

  const handleSubmit = async () => {
    if (!emailIsValid || isSubmitting) {
      setError('Entre une adresse email valide.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await requestPasswordReset({ email: email.trim().toLowerCase() });
      setSubmitted(true);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout
      eyebrow="Mot de passe oublié"
      footer={
        <BrandButton onPress={() => navigation.navigate('Login')} variant="ghost">
          Retour à la connexion
        </BrandButton>
      }
      subtitle="Entre ton adresse e-mail : nous t’enverrons un lien valable une heure."
      title="Retrouve ton accès."
    >
      <TextField
        autoComplete="email"
        error={error && !emailIsValid ? error : ''}
        keyboardType="email-address"
        label="Email"
        maxLength={254}
        onChangeText={(value) => {
          setEmail(value);
          setError('');
        }}
        placeholder="toi@email.com"
        textContentType="emailAddress"
        value={email}
      />
      {submitted ? (
        <Text style={styles.success}>
          Si un compte correspond à cette adresse, un e-mail de réinitialisation vient d’être
          envoyé.
        </Text>
      ) : null}
      {error && emailIsValid ? <Text style={styles.error}>{error}</Text> : null}
      <BrandButton disabled={isSubmitting || submitted} onPress={handleSubmit}>
        {isSubmitting ? 'Envoi en cours...' : 'Envoyer le lien'}
      </BrandButton>
    </AuthScreenLayout>
  );
}

const styles = {
  error: { color: colors.roseLight, fontFamily: fonts.strong, textAlign: 'center' },
  success: { color: colors.cream, fontFamily: fonts.body, lineHeight: 22, textAlign: 'center' }
};
