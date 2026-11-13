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
import {
  createRunningGroupPost,
  getRunningGroupFeed,
  getRunningGroupMembers,
  leaveRunningGroup
} from '../services/userApi';
import { colors, radius, spacing, type } from '../theme';

export function GroupDetailScreen({ navigation, route }) {
  const { group } = route.params;
  const [members, setMembers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [leaving, setLeaving] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [memberData, feedData] = await Promise.all([
        getRunningGroupMembers(group.id),
        getRunningGroupFeed(group.id)
      ]);
      setMembers(memberData.members);
      setPosts(feedData.posts);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLoading(false);
    }
  }, [group.id]);

  useFocusEffect(
    useCallback(() => {
      void load();
    }, [load])
  );

  const publish = async () => {
    setError('');
    setPublishing(true);
    try {
      await createRunningGroupPost(group.id, message);
      setMessage('');
      await load();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setPublishing(false);
    }
  };

  const leave = async () => {
    setError('');
    setLeaving(true);
    try {
      await leaveRunningGroup(group.id);
      navigation.goBack();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setLeaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.screen} keyboardShouldPersistTaps="handled">
        <Text style={styles.eyebrow}>GROUPE DE RUNNEUSES</Text>
        <Text style={styles.title}>{group.name}</Text>
        <Text style={styles.subtitle}>
          {group.level} · {group.objective}
        </Text>

        {loading ? <ActivityIndicator color={colors.honey} /> : null}
        {error ? (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        ) : null}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Membres ({members.length})</Text>
          {members.length ? (
            <Text style={styles.subtitle}>{members.map((member) => member.name).join(' · ')}</Text>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Fil du groupe</Text>
          {posts.length === 0 && !loading ? (
            <Text style={styles.subtitle}>Aucune publication pour le moment.</Text>
          ) : null}
          {posts.map((post) => (
            <View key={post.id} style={styles.card}>
              <Text style={styles.author}>{post.author_name}</Text>
              <Text style={styles.subtitle}>{post.message}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Partager avec le groupe</Text>
          <TextInput
            accessibilityLabel="Publication du groupe"
            editable={!publishing}
            maxLength={500}
            multiline
            onChangeText={setMessage}
            placeholder="Votre message, encouragement ou activité…"
            placeholderTextColor={colors.muted}
            style={styles.input}
            value={message}
          />
          <BrandButton disabled={!message.trim() || publishing} onPress={() => void publish()}>
            {publishing ? 'Publication…' : 'Publier'}
          </BrandButton>
        </View>

        <BrandButton disabled={leaving} onPress={() => void leave()} variant="ghost">
          {leaving ? 'Départ…' : 'Quitter le groupe'}
        </BrandButton>
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
  sectionTitle: { ...type.action, color: colors.honey },
  section: { gap: spacing.sm },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  author: { ...type.action, color: colors.white },
  input: {
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    color: colors.white,
    minHeight: 80,
    padding: spacing.sm,
    textAlignVertical: 'top'
  },
  error: { ...type.body, color: colors.roseLight }
});
