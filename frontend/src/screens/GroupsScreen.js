import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { BrandButton } from '../components/BrandButton';
import { createRunningGroup, getRunningGroups, joinRunningGroup } from '../services/userApi';
import { colors, radius, spacing, type } from '../theme';

export function GroupsScreen() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ level: '', name: '', objective: '', visibility: 'public' });
  const load = useCallback(async () => {
    setError('');
    try {
      setGroups((await getRunningGroups()).groups);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }, []);
  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );
  const create = async () => {
    setError('');
    try {
      await createRunningGroup(form);
      setCreating(false);
      setForm({ level: '', name: '', objective: '', visibility: 'public' });
      await load();
    } catch (nextError) {
      setError(nextError.message);
    }
  };
  const join = async (id) => {
    try {
      await joinRunningGroup(id);
      await load();
    } catch (nextError) {
      setError(nextError.message);
    }
  };
  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.eyebrow}>ENTRE RUNNEUSES</Text>
        <Text style={styles.title}>Les groupes.</Text>
        <Text style={styles.subtitle}>Trouvez des personnes avec qui partager votre objectif.</Text>
        <BrandButton onPress={() => setCreating(!creating)}>
          {creating ? 'Annuler' : 'Créer un groupe'}
        </BrandButton>
        {creating ? (
          <View style={styles.card}>
            <TextInput
              accessibilityLabel="Nom du groupe"
              onChangeText={(name) => setForm({ ...form, name })}
              placeholder="Nom du groupe"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={form.name}
            />
            <TextInput
              accessibilityLabel="Niveau du groupe"
              onChangeText={(level) => setForm({ ...form, level })}
              placeholder="Niveau"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={form.level}
            />
            <TextInput
              accessibilityLabel="Objectif du groupe"
              onChangeText={(objective) => setForm({ ...form, objective })}
              placeholder="Objectif commun"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={form.objective}
            />
            <BrandButton onPress={() => void create()} variant="secondary">
              Créer
            </BrandButton>
          </View>
        ) : null}
        {loading ? <ActivityIndicator color={colors.honey} /> : null}
        {!!error && (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        )}
        {!loading && !error && groups.length === 0 ? (
          <Text style={styles.subtitle}>Aucun groupe pour le moment.</Text>
        ) : null}
        {groups.map((group) => (
          <View key={group.id} style={styles.card}>
            <Text style={styles.name}>{group.name}</Text>
            <Text style={styles.subtitle}>
              {group.level} · {group.objective}
            </Text>
            <Text style={styles.subtitle}>
              {group.members_count} membres · {group.visibility}
            </Text>
            <BrandButton compact onPress={() => void join(group.id)} variant="secondary">
              Rejoindre
            </BrandButton>
          </View>
        ))}
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
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  name: { ...type.action, color: colors.honey },
  input: {
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    color: colors.white,
    paddingVertical: spacing.sm
  },
  error: { ...type.body, color: colors.roseLight }
});
