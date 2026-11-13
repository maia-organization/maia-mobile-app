import { useCallback, useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BrandButton } from '../components/BrandButton';
import { followUser, getFollows, getMessageMembers, unfollowUser } from '../services/userApi';
import { colors, radius, spacing, type } from '../theme';
export function FollowsScreen() {
  const [members, setMembers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState('');
  const load = useCallback(async () => {
    try {
      const [all, current] = await Promise.all([getMessageMembers(), getFollows()]);
      setMembers(all.members);
      setFollowing(current.follows);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );
  const toggle = async (member) => {
    try {
      if (following.some((item) => item.id === member.id)) await unfollowUser(member.id);
      else await followUser(member.id);
      await load();
    } catch (e) {
      setError(e.message);
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.eyebrow}>COMMUNAUTÉ</Text>
        <Text style={styles.title}>Mes abonnements.</Text>
        <Text style={styles.subtitle}>
          Les publications de ces runneuses apparaissent en priorité.
        </Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {members.map((member) => {
          const active = following.some((item) => item.id === member.id);
          return (
            <View key={member.id} style={styles.card}>
              <Text style={styles.name}>{member.name}</Text>
              <BrandButton compact onPress={() => void toggle(member)} variant="secondary">
                {active ? 'Se désabonner' : 'Suivre'}
              </BrandButton>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { backgroundColor: colors.ink, flex: 1 },
  screen: { gap: spacing.lg, padding: spacing.xl },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  title: { ...type.title, color: colors.white },
  subtitle: { ...type.body, color: colors.cream },
  card: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: spacing.lg
  },
  name: { ...type.action, color: colors.honey },
  error: { ...type.body, color: colors.roseLight }
});
