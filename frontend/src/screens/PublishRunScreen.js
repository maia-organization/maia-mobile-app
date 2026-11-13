import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import { BrandButton } from '../components/BrandButton';
import { createCommunityPost } from '../services/userApi';
import { colors, radius, spacing, type } from '../theme';

export function PublishRunScreen({ navigation, route }) {
  const { session, sessionId } = route.params;
  const [message, setMessage] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [error, setError] = useState('');
  const [isPublishing, setIsPublishing] = useState(false);
  const continueToFeedback = () => navigation.replace('Feedback', { sessionId });
  const publish = async () => {
    setError('');
    setIsPublishing(true);
    try {
      await createCommunityPost({ message, session_id: sessionId, visibility });
      navigation.replace('MainTabs', { screen: 'Community' });
    } catch (nextError) {
      setError(nextError.message);
    } finally { setIsPublishing(false); }
  };
  return <SafeAreaView style={styles.safeArea}><ScrollView contentContainerStyle={styles.screen}>
    <Text style={styles.eyebrow}>PARTAGER MA COURSE</Text><Text style={styles.title}>Une belle sortie à célébrer.</Text>
    <Text style={styles.metrics}>{session.distance.toFixed(2)} km · {Math.round(session.duration / 60)} min</Text>
    <TextInput accessibilityLabel="Mon ressenti" maxLength={500} multiline onChangeText={setMessage} placeholder="Un mot pour la communauté ?" placeholderTextColor={colors.muted} style={styles.input} value={message} />
    <View style={styles.visibility}><BrandButton compact onPress={() => setVisibility('public')} variant={visibility === 'public' ? 'secondary' : 'ghost'}>Publique</BrandButton><BrandButton compact onPress={() => setVisibility('private')} variant={visibility === 'private' ? 'secondary' : 'ghost'}>Privée</BrandButton></View>
    {!!error && <Text accessibilityLiveRegion="polite" style={styles.error}>{error}</Text>}
    <BrandButton disabled={isPublishing} onPress={() => void publish()}>{isPublishing ? 'Publication…' : 'Publier ma course'}</BrandButton>
    <BrandButton disabled={isPublishing} onPress={continueToFeedback} variant="ghost">Plus tard</BrandButton>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safeArea: { backgroundColor: colors.ink, flex: 1 }, screen: { gap: spacing.lg, padding: spacing.xl }, eyebrow: { ...type.eyebrow, color: colors.rose }, title: { ...type.title, color: colors.white }, metrics: { ...type.body, color: colors.honey }, input: { backgroundColor: colors.surface, borderColor: colors.borderLight, borderRadius: radius.sm, borderWidth: 1, color: colors.white, minHeight: 120, padding: spacing.md, textAlignVertical: 'top' }, visibility: { flexDirection: 'row', gap: spacing.md }, error: { ...type.body, color: colors.roseLight } });
