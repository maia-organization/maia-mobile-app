import { useState } from 'react';
import { Alert, SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { completeSession } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';

export function SessionScreen({ navigation, route }) {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);

    try {
      await completeSession(route.params.sessionId);
      navigation.replace('Feedback', { sessionId: route.params.sessionId });
    } catch (error) {
      Alert.alert('Impossible de terminer la séance', error.message);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <Text style={styles.eyebrow}>SÉANCE EN COURS</Text>
        <View style={styles.content}>
          <Text style={styles.title}>Cours à ton rythme.</Text>
          <Text style={styles.subtitle}>
            Écoute ton corps. Tu pourras partager ton ressenti juste après.
          </Text>
        </View>
        <BrandButton disabled={isCompleting} onPress={() => void handleComplete()}>
          {isCompleting ? 'Finalisation…' : 'Terminer ma séance'}
        </BrandButton>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: { flex: 1, justifyContent: 'space-between', padding: spacing.xl },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  content: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    gap: spacing.md,
    padding: spacing.xl
  },
  title: { color: colors.ink, fontFamily: fonts.heading, fontSize: 30, lineHeight: 36 },
  subtitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 17, lineHeight: 25 }
});
