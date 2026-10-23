import { useState } from 'react';
import { Text } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { PasswordRequirements } from '../components/PasswordRequirements';
import { TextField } from '../components/TextField';
import { confirmPasswordReset } from '../services/authApi';
import { colors, fonts } from '../theme';
import { AuthScreenLayout } from './AuthScreenLayout';
import { isStrongPassword } from '../utils/validation';

export function PasswordResetScreen({ navigation, route }) {
  const token = route.params?.token || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const validPassword = isStrongPassword(password);
  const matchingPasswords = confirmation.length > 0 && password === confirmation;

  const handleSubmit = async () => {
    if (!token) {
      setError('Ce lien de réinitialisation est invalide ou expiré.');
      return;
    }
    if (!validPassword || !matchingPasswords || isSubmitting) {
      setError('Vérifie les champs indiqués.');
      return;
    }

    setError('');
    setIsSubmitting(true);
    try {
      await confirmPasswordReset({ password, token });
      setCompleted(true);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthScreenLayout
      eyebrow="Nouveau mot de passe"
      footer={
        completed ? (
          <BrandButton onPress={() => navigation.navigate('Login')} variant="ghost">
            Me connecter
          </BrandButton>
        ) : null
      }
      subtitle="Choisis un mot de passe solide pour protéger ton compte."
      title="Crée ton nouveau mot de passe."
    >
      <TextField
        autoComplete="new-password"
        error={
          error && !validPassword ? 'Le mot de passe ne respecte pas encore toutes les règles.' : ''
        }
        label="Nouveau mot de passe"
        onChangeText={(value) => {
          setPassword(value);
          setError('');
        }}
        placeholder="Ton nouveau mot de passe"
        secureTextEntry
        textContentType="newPassword"
        value={password}
      />
      <PasswordRequirements password={password} />
      <TextField
        autoComplete="new-password"
        error={error && !matchingPasswords ? 'Les mots de passe ne correspondent pas.' : ''}
        label="Confirme le mot de passe"
        onChangeText={(value) => {
          setConfirmation(value);
          setError('');
        }}
        placeholder="Confirme ton nouveau mot de passe"
        secureTextEntry
        textContentType="newPassword"
        value={confirmation}
      />
      {completed ? <Text style={styles.success}>Ton mot de passe a été réinitialisé.</Text> : null}
      {error && validPassword && matchingPasswords ? (
        <Text style={styles.error}>{error}</Text>
      ) : null}
      <BrandButton disabled={isSubmitting || completed} onPress={handleSubmit}>
        {isSubmitting ? 'Réinitialisation...' : 'Réinitialiser le mot de passe'}
      </BrandButton>
    </AuthScreenLayout>
  );
}

const styles = {
  error: { color: colors.roseLight, fontFamily: fonts.strong, textAlign: 'center' },
  success: { color: colors.cream, fontFamily: fonts.body, textAlign: 'center' }
};
