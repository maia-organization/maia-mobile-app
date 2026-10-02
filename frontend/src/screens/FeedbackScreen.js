import { useState } from 'react';
import { Alert, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { saveSessionFeedback } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';

const questions = [
  { key: 'energy', label: 'Énergie', low: 'Peu d’énergie', high: 'Pleine d’énergie' },
  { key: 'fatigue', label: 'Fatigue', low: 'Très peu fatiguée', high: 'Très fatiguée' },
  { key: 'pain', label: 'Douleur', low: 'Aucune douleur', high: 'Douleur importante' },
  { key: 'motivation', label: 'Motivation', low: 'Peu motivée', high: 'Très motivée' }
];

export function FeedbackScreen({ navigation, route }) {
  const [feedback, setFeedback] = useState({});
  const [isSaving, setIsSaving] = useState(false);

  const finish = () => navigation.popToTop();

  const handleSave = async () => {
    if (Object.keys(feedback).length === 0) {
      Alert.alert('Choisis au moins une option', 'Ou passe cette étape si tu préfères.');
      return;
    }

    setIsSaving(true);
    try {
      await saveSessionFeedback(route.params.sessionId, feedback);
      finish();
    } catch (error) {
      Alert.alert('Impossible d’enregistrer le ressenti', error.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.heading}>
          <Text style={styles.eyebrow}>APRÈS TA SÉANCE</Text>
          <Text style={styles.title}>Comment te sens-tu ?</Text>
          <Text style={styles.subtitle}>Quelques secondes suffisent. C’est facultatif.</Text>
        </View>

        <View style={styles.questions}>
          {questions.map((question) => (
            <View key={question.key} style={styles.question}>
              <Text style={styles.questionLabel}>{question.label}</Text>
              <View accessibilityLabel={`${question.label}, de 1 à 5`} style={styles.scale}>
                {[1, 2, 3, 4, 5].map((value) => {
                  const selected = feedback[question.key] === value;
                  return (
                    <Pressable
                      accessibilityRole="button"
                      accessibilityState={{ selected }}
                      key={value}
                      onPress={() =>
                        setFeedback((current) => ({ ...current, [question.key]: value }))
                      }
                      style={[styles.option, selected && styles.optionSelected]}
                    >
                      <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                        {value}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <View style={styles.legend}>
                <Text style={styles.legendText}>{question.low}</Text>
                <Text style={styles.legendText}>{question.high}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.actions}>
          <BrandButton disabled={isSaving} onPress={() => void handleSave()}>
            {isSaving ? 'Enregistrement…' : 'Enregistrer mon ressenti'}
          </BrandButton>
          <BrandButton disabled={isSaving} onPress={finish} variant="ghost">
            Passer cette étape
          </BrandButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: { gap: spacing.xl, padding: spacing.xl },
  heading: { gap: spacing.md },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  title: { ...type.title, color: colors.white },
  subtitle: { color: colors.cream, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  questions: { gap: spacing.lg },
  question: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    gap: spacing.sm,
    padding: spacing.md
  },
  questionLabel: { color: colors.ink, fontFamily: fonts.heading, fontSize: 20 },
  scale: { flexDirection: 'row', gap: spacing.sm, justifyContent: 'space-between' },
  option: {
    alignItems: 'center',
    borderColor: colors.ink,
    borderRadius: radius.sm,
    borderWidth: 1,
    height: 38,
    justifyContent: 'center',
    width: 38
  },
  optionSelected: { backgroundColor: colors.ink },
  optionText: { color: colors.ink, fontFamily: fonts.strong, fontSize: 16 },
  optionTextSelected: { color: colors.white },
  legend: { flexDirection: 'row', justifyContent: 'space-between' },
  legendText: { color: colors.ink, flex: 1, fontFamily: fonts.body, fontSize: 11, lineHeight: 14 },
  actions: { gap: spacing.md }
});
