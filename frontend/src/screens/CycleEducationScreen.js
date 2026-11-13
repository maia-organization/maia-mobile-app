import { useState } from 'react';
import { Pressable, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { colors, fonts, radius, spacing, type } from '../theme';

// TODO(US-CONTENT-001): remplacer ces textes de démonstration par les contenus validés.
const placeholderPhases = [
  {
    id: 'menstrual',
    title: 'Phase menstruelle',
    days: 'Jours 1 à 5',
    impact:
      'Placeholder : ton niveau d’énergie peut varier. Accorde-toi le droit d’ajuster ton rythme.',
    recommendation:
      'Placeholder : privilégie une sortie douce ou une récupération active selon ton ressenti.'
  },
  {
    id: 'follicular',
    title: 'Phase folliculaire',
    days: 'Jours 6 à 13',
    impact:
      'Placeholder : une énergie qui remonte peut donner envie d’explorer de nouvelles sensations.',
    recommendation:
      'Placeholder : choisis une séance progressive et adapte-la à ce qui te convient.'
  },
  {
    id: 'ovulatory',
    title: 'Phase ovulatoire',
    days: 'Jours 14 à 17',
    impact:
      'Placeholder : tu peux te sentir particulièrement disponible pour un effort plus soutenu.',
    recommendation:
      'Placeholder : si tu en as envie, teste une séance plus dynamique tout en restant à l’écoute.'
  },
  {
    id: 'luteal',
    title: 'Phase lutéale',
    days: 'Jours 18 à 28',
    impact: 'Placeholder : les sensations peuvent évoluer progressivement au fil des jours.',
    recommendation: 'Placeholder : mise sur la régularité et module l’intensité selon ton énergie.'
  }
];

export function CycleEducationScreen({ navigation }) {
  const [favoriteIds, setFavoriteIds] = useState([]);

  const toggleFavorite = (phaseId) => {
    setFavoriteIds((currentIds) =>
      currentIds.includes(phaseId)
        ? currentIds.filter((currentId) => currentId !== phaseId)
        : [...currentIds, phaseId]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>COMPRENDRE MON CYCLE</Text>
          <Text style={styles.title}>Courir à ton rythme.</Text>
          <Text style={styles.subtitle}>
            Des repères simples pour mieux comprendre les liens entre ton cycle et ta pratique.
          </Text>
        </View>

        <View accessibilityLabel="Schéma des quatre phases du cycle" style={styles.diagram}>
          {placeholderPhases.map((phase, index) => (
            <View key={phase.id} style={styles.diagramStep}>
              <View style={styles.diagramDot} />
              <Text style={styles.diagramText}>{phase.title.replace('Phase ', '')}</Text>
              {index < placeholderPhases.length - 1 ? <View style={styles.diagramLine} /> : null}
            </View>
          ))}
        </View>

        <Text style={styles.placeholderNotice}>
          Contenus indicatifs — les informations validées seront ajoutées prochainement.
        </Text>

        {placeholderPhases.map((phase) => {
          const isFavorite = favoriteIds.includes(phase.id);
          return (
            <View key={phase.id} style={styles.phaseCard}>
              <View style={styles.phaseHeading}>
                <View>
                  <Text style={styles.phaseTitle}>{phase.title}</Text>
                  <Text style={styles.days}>{phase.days}</Text>
                </View>
                <Pressable
                  accessibilityLabel={`${isFavorite ? 'Retirer' : 'Ajouter'} ${phase.title} des favoris`}
                  accessibilityRole="button"
                  accessibilityState={{ selected: isFavorite }}
                  onPress={() => toggleFavorite(phase.id)}
                  style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}
                >
                  <Text style={styles.favoriteText}>{isFavorite ? '★' : '☆'}</Text>
                </Pressable>
              </View>
              <Text style={styles.sectionLabel}>IMPACT SUR LE SPORT</Text>
              <Text style={styles.cardText}>{phase.impact}</Text>
              <Text style={styles.sectionLabel}>RECOMMANDATION</Text>
              <Text style={styles.cardText}>{phase.recommendation}</Text>
            </View>
          );
        })}

        <View style={styles.disclaimer}>
          <Text style={styles.disclaimerText}>
            Maïa accompagne ta pratique sportive et ne remplace pas l’avis d’un professionnel de
            santé.
          </Text>
        </View>

        <BrandButton onPress={() => navigation.goBack()} variant="secondary">
          Retour à mon cycle
        </BrandButton>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  cardText: { color: colors.cream, fontFamily: fonts.body, fontSize: 15, lineHeight: 22 },
  days: { color: colors.muted, fontFamily: fonts.body, fontSize: 14, marginTop: spacing.xs },
  diagram: { flexDirection: 'row', justifyContent: 'center', paddingVertical: spacing.sm },
  diagramDot: { backgroundColor: colors.rose, borderRadius: 7, height: 14, width: 14 },
  diagramLine: {
    backgroundColor: colors.honey,
    height: 2,
    marginHorizontal: spacing.xs,
    width: 12
  },
  diagramStep: { alignItems: 'center', flexDirection: 'row' },
  diagramText: {
    color: colors.honey,
    fontFamily: fonts.strong,
    fontSize: 10,
    textTransform: 'uppercase'
  },
  disclaimer: { borderLeftColor: colors.rose, borderLeftWidth: 3, paddingLeft: spacing.md },
  disclaimerText: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  favoriteButton: {
    alignItems: 'center',
    borderColor: colors.honey,
    borderRadius: 20,
    borderWidth: 1,
    height: 40,
    justifyContent: 'center',
    width: 40
  },
  favoriteText: { color: colors.honey, fontSize: 24, lineHeight: 28 },
  header: { gap: spacing.md },
  phaseCard: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  phaseHeading: { alignItems: 'flex-start', flexDirection: 'row', justifyContent: 'space-between' },
  phaseTitle: { color: colors.white, fontFamily: fonts.heading, fontSize: 23, lineHeight: 29 },
  placeholderNotice: {
    backgroundColor: colors.honeySoft,
    color: colors.honey,
    fontFamily: fonts.body,
    fontSize: 14,
    lineHeight: 20,
    padding: spacing.md
  },
  pressed: { opacity: 0.7 },
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: { gap: spacing.xl, padding: spacing.xl },
  sectionLabel: { ...type.eyebrow, color: colors.rose, marginTop: spacing.sm },
  subtitle: { color: colors.cream, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  title: { ...type.title, color: colors.white }
});
