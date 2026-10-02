import { useState } from 'react';
import { Alert, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { SessionMetric } from '../components/SessionMetric';
import { completeSession } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';
import { describePace, formatDistance, formatDuration, formatPace } from '../utils/sessionFormat';

export function SessionSummaryScreen({ navigation, route }) {
  const { session, sessionId } = route.params;
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await completeSession(sessionId);
      navigation.replace('Feedback', { sessionId });
    } catch (error) {
      Alert.alert('Impossible de valider la séance', error.message);
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <Text style={styles.eyebrow}>RÉCAPITULATIF</Text>
        <View style={styles.summary}>
          <Text style={styles.title}>Belle séance !</Text>
          <Text style={styles.subtitle}>
            Ta séance est enregistrée. Vérifie ton récapitulatif puis valide-la.
          </Text>
          <SessionMetric label="Durée" value={formatDuration(session.duration)} />
          <SessionMetric label="Distance" value={formatDistance(session.distance)} />
          <SessionMetric
            label="Allure moyenne"
            spokenValue={describePace(session.average_pace)}
            value={formatPace(session.average_pace)}
          />
        </View>
        <BrandButton disabled={isCompleting} onPress={() => void handleComplete()}>
          {isCompleting ? 'Validation…' : 'Valider ma séance'}
        </BrandButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: { flexGrow: 1, gap: spacing.xl, justifyContent: 'space-between', padding: spacing.xl },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  summary: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    gap: spacing.md,
    padding: spacing.xl
  },
  title: { color: colors.ink, fontFamily: fonts.heading, fontSize: 30, lineHeight: 36 },
  subtitle: { color: colors.ink, fontFamily: fonts.body, fontSize: 17, lineHeight: 25 }
});
