import { useState } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { colors, fonts, radius, spacing, type } from '../theme';

const slides = [
  {
    eyebrow: 'TON ESPACE',
    icon: '✦',
    title: 'Un profil qui te ressemble.',
    text: 'Renseigne ton niveau et tes objectifs pour avancer à ton propre rythme.',
    label: 'Profil'
  },
  {
    eyebrow: 'TES ENTRAÎNEMENTS',
    icon: '↗',
    title: 'Des séances pensées pour toi.',
    text: 'Découvre des entraînements qui s’adaptent à ton énergie du jour.',
    label: 'Entraînement'
  },
  {
    eyebrow: 'TON CYCLE',
    icon: '◒',
    title: 'Ton cycle, ton allié.',
    text: 'Comprends ses phases pour courir avec ton corps, jamais contre lui.',
    label: 'Cycle'
  },
  {
    eyebrow: 'ENSEMBLE',
    icon: '◌',
    title: 'Une communauté qui avance avec toi.',
    text: 'Partage tes progrès et puise de l’élan auprès d’autres runneuses.',
    label: 'Communauté'
  }
];

export function OnboardingScreen({ navigation, onComplete }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isCompleting, setIsCompleting] = useState(false);
  const slide = slides[currentIndex];
  const isLastSlide = currentIndex === slides.length - 1;

  const finish = async () => {
    if (isCompleting) return;

    setIsCompleting(true);
    try {
      await onComplete();
    } finally {
      navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
    }
  };

  const handlePrimaryAction = () => {
    if (isLastSlide) {
      void finish();
      return;
    }

    setCurrentIndex((index) => index + 1);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.screen}>
        <View style={styles.topBar}>
          <Text style={styles.brand}>MAÏA</Text>
          <BrandButton disabled={isCompleting} onPress={() => void finish()} variant="ghost">
            Passer
          </BrandButton>
        </View>

        <View style={styles.content}>
          <View style={styles.visual}>
            <View style={styles.ring} />
            <View style={styles.iconCircle}>
              <Text accessibilityLabel={slide.label} style={styles.icon}>
                {slide.icon}
              </Text>
            </View>
            <Text style={styles.visualLabel}>{slide.label}</Text>
          </View>

          <View style={styles.copy}>
            <Text style={styles.eyebrow}>{slide.eyebrow}</Text>
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.text}>{slide.text}</Text>
          </View>
        </View>

        <View style={styles.footer}>
          <View
            accessibilityLabel={`Étape ${currentIndex + 1} sur ${slides.length}`}
            style={styles.pagination}
          >
            {slides.map((item, index) => (
              <View
                key={item.label}
                style={[styles.dot, index === currentIndex && styles.activeDot]}
              />
            ))}
          </View>
          <BrandButton disabled={isCompleting} onPress={handlePrimaryAction}>
            {isLastSlide ? 'Découvrir Maïa' : 'Continuer'}
          </BrandButton>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: {
    backgroundColor: colors.ink,
    flex: 1,
    justifyContent: 'space-between',
    padding: spacing.xl
  },
  topBar: { alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between' },
  brand: { ...type.eyebrow, color: colors.honey, fontSize: 16 },
  content: { alignItems: 'center', gap: spacing.xxl },
  visual: { alignItems: 'center', height: 285, justifyContent: 'center', width: '100%' },
  ring: {
    borderColor: colors.rose,
    borderRadius: 132,
    borderWidth: 1,
    height: 264,
    opacity: 0.72,
    position: 'absolute',
    width: 264
  },
  iconCircle: {
    alignItems: 'center',
    backgroundColor: colors.honey,
    borderRadius: 94,
    height: 188,
    justifyContent: 'center',
    shadowColor: colors.honey,
    shadowOpacity: 0.22,
    shadowRadius: 30,
    width: 188
  },
  icon: { color: colors.ink, fontFamily: fonts.accent, fontSize: 84, lineHeight: 96 },
  visualLabel: {
    ...type.eyebrow,
    color: colors.rose,
    marginTop: spacing.lg,
    textTransform: 'uppercase'
  },
  copy: { alignItems: 'center', gap: spacing.lg, maxWidth: 350 },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  title: { ...type.title, color: colors.white, fontSize: 38, lineHeight: 43, textAlign: 'center' },
  text: { ...type.body, color: colors.cream, textAlign: 'center' },
  footer: { gap: spacing.xl },
  pagination: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    justifyContent: 'center'
  },
  dot: { backgroundColor: colors.borderLight, borderRadius: radius.round, height: 8, width: 8 },
  activeDot: { backgroundColor: colors.rose, width: 28 }
});
