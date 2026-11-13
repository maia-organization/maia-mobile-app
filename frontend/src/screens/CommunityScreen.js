import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { BrandButton } from '../components/BrandButton';
import { getCommunityFeed } from '../services/userApi';
import { colors, fonts, radius, spacing, type } from '../theme';

function CommunityPost({ post }) {
  return (
    <View style={styles.post}>
      <Text style={styles.author}>{post.author_name}</Text>
      <Text style={styles.message}>{post.message}</Text>
      <Text style={styles.interactions}>
        {post.likes_count || 0} j’aime · {post.comments_count || 0} commentaires
      </Text>
    </View>
  );
}

export function CommunityScreen() {
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [posts, setPosts] = useState([]);

  const loadFeed = useCallback(async (refreshing = false) => {
    if (refreshing) setIsRefreshing(true);
    else setIsLoading(true);
    setError('');

    try {
      const { posts: nextPosts } = await getCommunityFeed();
      setPosts(nextPosts);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadFeed();
      const refreshInterval = setInterval(() => void loadFeed(true), 30000);

      return () => clearInterval(refreshInterval);
    }, [loadFeed])
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.screen}
        refreshControl={
          <RefreshControl
            onRefresh={() => void loadFeed(true)}
            refreshing={isRefreshing}
            tintColor={colors.honey}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.eyebrow}>ENTRE RUNNEUSES</Text>
          <Text style={styles.title}>La communauté.</Text>
          <Text style={styles.subtitle}>
            Les courses partagées et les encouragements de la communauté, au même endroit.
          </Text>
        </View>

        {isLoading ? (
          <View style={styles.stateCard}>
            <ActivityIndicator color={colors.honey} />
            <Text style={styles.stateText}>Actualisation du fil…</Text>
          </View>
        ) : null}

        {error ? (
          <View style={styles.stateCard}>
            <Text accessibilityLiveRegion="polite" style={styles.errorText}>
              {error}
            </Text>
            <BrandButton onPress={() => void loadFeed()} variant="secondary">
              Réessayer
            </BrandButton>
          </View>
        ) : null}

        {!isLoading && !error && posts.length === 0 ? (
          <View style={styles.stateCard}>
            <Text style={styles.emptyTitle}>Le fil prend son élan.</Text>
            <Text style={styles.stateText}>
              Les premières courses partagées apparaîtront ici. Reviens bientôt encourager la
              communauté.
            </Text>
          </View>
        ) : null}

        {!isLoading && !error
          ? posts.map((post) => <CommunityPost key={post.id} post={post} />)
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
  screen: { gap: spacing.lg, padding: spacing.xl },
  header: { gap: spacing.md },
  eyebrow: { ...type.eyebrow, color: colors.rose },
  title: { ...type.title, color: colors.white },
  subtitle: { ...type.body, color: colors.cream },
  stateCard: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.md,
    padding: spacing.xl
  },
  stateText: { ...type.body, color: colors.cream, textAlign: 'center' },
  errorText: { ...type.body, color: colors.roseLight, textAlign: 'center' },
  emptyTitle: { ...type.action, color: colors.honey },
  post: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.sm,
    padding: spacing.lg
  },
  author: { ...type.action, color: colors.honey },
  message: { ...type.body, color: colors.white },
  interactions: { color: colors.muted, fontFamily: fonts.body, fontSize: 14 }
});
