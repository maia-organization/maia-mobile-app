import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { colors, fonts, radius, spacing, type } from '../theme';

const maiaIcon = require('../../assets/maia-app-icon.png');

const nextSteps = [
  {
    label: 'Profil',
    text: 'Renseigner niveau, objectif et rythme.'
  },
  {
    label: 'Cycle',
    text: 'Ajouter la date des dernières règles.'
  },
  {
    label: 'Run',
    text: 'Voir la première séance adaptée.'
  }
];

export function HomeScreen({ navigation, onLogout }) {
  const handleLogout = async () => {
    await onLogout();
    navigation.reset({
      index: 0,
      routes: [{ name: 'Welcome' }]
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Image source={maiaIcon} style={styles.logo} />
          <Text style={styles.eyebrow}>ESPACE MAÏA</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.hero}>
            <Text style={styles.title}>Bienvenue dans l'aventure.</Text>
            <Text style={styles.subtitle}>
              Ton compte est prêt. On va maintenant personnaliser Maïa autour de ton corps.
            </Text>
          </View>

          <View style={styles.todayCard}>
            <Text style={styles.cardEyebrow}>MVP EN COURS</Text>
            <Text style={styles.cardTitle}>Prochaine étape : ton profil sportif et ton cycle.</Text>
          </View>

          <View style={styles.stepList}>
            {nextSteps.map((step) => (
              <View key={step.label} style={styles.stepButton}>
                <Text style={styles.stepLabel}>{step.label}</Text>
                <Text style={styles.stepText}>{step.text}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.actions}>
          <BrandButton onPress={() => navigation.navigate('Profile')} variant="secondary">
            Consulter mon profil
          </BrandButton>
          <BrandButton onPress={() => navigation.navigate('Cycle')} variant="secondary">
            Consulter mon cycle
          </BrandButton>
          <BrandButton onPress={() => navigation.navigate('ProfileSetup')}>
            Compléter mon profil
          </BrandButton>
          <BrandButton onPress={handleLogout} variant="ghost">
            Se déconnecter
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
    backgroundColor: colors.ink,
    flexGrow: 1,
    justifyContent: 'space-between',
    padding: spacing.xl
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.md
  },
  logo: {
    borderRadius: radius.sm,
    height: 48,
    width: 48
  },
  eyebrow: {
    ...type.eyebrow,
    color: colors.rose
  },
  content: {
    gap: spacing.xl,
    paddingVertical: spacing.xxl
  },
  hero: {
    gap: spacing.lg
  },
  title: {
    ...type.title,
    color: colors.white
  },
  subtitle: {
    color: colors.cream,
    fontFamily: fonts.body,
    fontSize: 17,
    letterSpacing: 0,
    lineHeight: 25
  },
  todayCard: {
    backgroundColor: colors.honey,
    borderRadius: radius.sm,
    gap: spacing.md,
    padding: spacing.lg
  },
  cardEyebrow: {
    ...type.eyebrow,
    color: colors.ink
  },
  cardTitle: {
    color: colors.ink,
    fontFamily: fonts.heading,
    fontSize: 22,
    letterSpacing: 0,
    lineHeight: 27
  },
  stepList: {
    gap: spacing.md
  },
  stepButton: {
    borderColor: colors.borderLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    gap: spacing.xs,
    minHeight: 78,
    padding: spacing.lg
  },
  stepLabel: {
    ...type.eyebrow,
    color: colors.rose
  },
  stepText: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 15,
    letterSpacing: 0,
    lineHeight: 21
  },
  actions: {
    gap: spacing.md
  }
});
