import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BrandButton } from '../components/BrandButton';
import {
  getNotificationSettings,
  getProfile,
  updateNotificationSettings
} from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';

const labels = {
  avancee: 'Avancée',
  debutante: 'Débutante',
  endurance: 'Endurance',
  intermediaire: 'Intermédiaire',
  performance: 'Performance',
  regularite: 'Régularité'
};

function displayValue(value, suffix = '') {
  return value === null || value === undefined || value === ''
    ? 'Non renseigné'
    : `${value}${suffix}`;
}

function ProfileSection({ children, title }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

function ProfileItem({ label, value }) {
  return (
    <View style={styles.item}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Text style={styles.itemValue}>{value}</Text>
    </View>
  );
}

function NotificationToggle({ disabled, label, onValueChange, value }) {
  return (
    <View style={[styles.notificationItem, disabled && styles.notificationItemDisabled]}>
      <Text style={styles.itemLabel}>{label}</Text>
      <Switch
        accessibilityLabel={label}
        disabled={disabled}
        onValueChange={onValueChange}
        thumbColor={value ? colors.rose : colors.muted}
        trackColor={{ false: colors.borderLight, true: colors.roseDeep }}
        value={value}
      />
    </View>
  );
}

export function ProfileScreen({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [notificationSettings, setNotificationSettings] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSavingNotifications, setIsSavingNotifications] = useState(false);
  const [notificationFeedback, setNotificationFeedback] = useState('');

  const loadProfile = useCallback(() => {
    let isActive = true;
    setError('');
    setIsLoading(true);

    Promise.all([getProfile(), getNotificationSettings()])
      .then(([{ user }, { settings }]) => {
        if (!isActive) return;
        setProfile(user);
        setNotificationSettings(settings);
      })
      .catch((nextError) => {
        if (isActive) setError(nextError.message);
      })
      .finally(() => {
        if (isActive) setIsLoading(false);
      });

    return () => {
      isActive = false;
    };
  }, []);

  const updateNotifications = (changes) => {
    setNotificationSettings((current) => ({ ...current, ...changes }));
    setNotificationFeedback('');
  };

  const saveNotifications = async () => {
    if (!notificationSettings) return;

    setIsSavingNotifications(true);
    setNotificationFeedback('');

    try {
      const { settings } = await updateNotificationSettings(notificationSettings);
      setNotificationSettings(settings);
      setNotificationFeedback('Préférences enregistrées.');
    } catch (nextError) {
      setNotificationFeedback(nextError.message);
    } finally {
      setIsSavingNotifications(false);
    }
  };

  useFocusEffect(loadProfile);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loading}>
          <ActivityIndicator color={colors.honey} />
        </View>
      </SafeAreaView>
    );
  }

  if (error || !profile) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorScreen}>
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error || 'Ton profil est indisponible pour le moment.'}
          </Text>
          <BrandButton onPress={() => navigation.goBack()} variant="ghost">
            Retour
          </BrandButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>MON PROFIL</Text>
          <Text style={styles.title}>Bonjour, {profile.name}.</Text>
          <Text style={styles.subtitle}>
            Retrouve ici les informations qui personnalisent tes runs.
          </Text>
        </View>

        <ProfileSection title="Mes informations">
          <ProfileItem label="Prénom" value={displayValue(profile.name)} />
          <ProfileItem label="E-mail" value={displayValue(profile.email)} />
          <ProfileItem label="Date de naissance" value={displayValue(profile.birthdate)} />
        </ProfileSection>

        <ProfileSection title="Mon profil sportif">
          <ProfileItem
            label="Niveau"
            value={displayValue(labels[profile.level] || profile.level)}
          />
          <ProfileItem
            label="Objectif"
            value={displayValue(labels[profile.goal] || profile.goal)}
          />
          <ProfileItem label="Poids" value={displayValue(profile.weight, ' kg')} />
          <ProfileItem label="Taille" value={displayValue(profile.height, ' cm')} />
        </ProfileSection>

        <ProfileSection title="Mon cycle">
          <ProfileItem
            label="Début des dernières règles"
            value={displayValue(profile.cycleStartDate)}
          />
          <ProfileItem label="Durée moyenne" value={displayValue(profile.cycleLength, ' jours')} />
        </ProfileSection>

        <ProfileSection title="Mes notifications">
          <NotificationToggle
            label="Recevoir des notifications"
            onValueChange={(enabled) => updateNotifications({ enabled })}
            value={notificationSettings?.enabled || false}
          />
          <NotificationToggle
            disabled={!notificationSettings?.enabled}
            label="Entraînements"
            onValueChange={(workout_notifications) =>
              updateNotifications({ workout_notifications })
            }
            value={notificationSettings?.workout_notifications || false}
          />
          <NotificationToggle
            disabled={!notificationSettings?.enabled}
            label="Conseils liés à mon cycle"
            onValueChange={(cycle_notifications) => updateNotifications({ cycle_notifications })}
            value={notificationSettings?.cycle_notifications || false}
          />
          <NotificationToggle
            disabled={!notificationSettings?.enabled}
            label="Communauté"
            onValueChange={(social_notifications) => updateNotifications({ social_notifications })}
            value={notificationSettings?.social_notifications || false}
          />
          <View style={styles.notificationAction}>
            <BrandButton
              disabled={isSavingNotifications}
              onPress={saveNotifications}
              variant="secondary"
            >
              {isSavingNotifications ? 'Enregistrement…' : 'Enregistrer mes préférences'}
            </BrandButton>
            {!!notificationFeedback && (
              <Text accessibilityLiveRegion="polite" style={styles.notificationFeedback}>
                {notificationFeedback}
              </Text>
            )}
          </View>
        </ProfileSection>

        <View style={styles.actions}>
          <BrandButton onPress={() => navigation.navigate('ProfileSetup')}>
            Modifier mon profil
          </BrandButton>
          <BrandButton onPress={() => navigation.navigate('Home')} variant="ghost">
            Retour à l'accueil
          </BrandButton>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: { gap: spacing.xl, padding: spacing.xl },
  loading: { alignItems: 'center', flex: 1, justifyContent: 'center' },
  errorScreen: { flex: 1, gap: spacing.lg, justifyContent: 'center', padding: spacing.xl },
  header: { gap: spacing.md },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  title: { ...type.title, color: colors.white },
  subtitle: { color: colors.cream, fontFamily: fonts.body, fontSize: 16, lineHeight: 23 },
  section: { gap: spacing.sm },
  sectionTitle: { color: colors.honey, fontFamily: fonts.strong, fontSize: 14, letterSpacing: 0 },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    overflow: 'hidden'
  },
  item: {
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    gap: spacing.xs,
    padding: spacing.lg
  },
  itemLabel: { color: colors.cream, fontFamily: fonts.strong, fontSize: 13, letterSpacing: 0 },
  itemValue: {
    color: colors.white,
    fontFamily: fonts.body,
    fontSize: 16,
    letterSpacing: 0,
    lineHeight: 22
  },
  notificationItem: {
    alignItems: 'center',
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg
  },
  notificationItemDisabled: { opacity: 0.5 },
  notificationAction: { gap: spacing.sm, padding: spacing.lg },
  notificationFeedback: {
    color: colors.success,
    fontFamily: fonts.strong,
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center'
  },
  actions: { gap: spacing.md },
  error: {
    color: colors.roseLight,
    fontFamily: fonts.strong,
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center'
  }
});
