import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandButton } from '../components/BrandButton';
import {
  createConversation,
  getConversationMessages,
  getConversations,
  getMessageMembers,
  sendConversationMessage
} from '../services/userApi';
import { colors, radius, spacing, type } from '../theme';

export function MessagingScreen() {
  const [activeConversation, setActiveConversation] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isStarting, setIsStarting] = useState(false);
  const [members, setMembers] = useState([]);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [showMembers, setShowMembers] = useState(false);

  const loadConversations = useCallback(async () => {
    setError('');
    try {
      const { conversations: nextConversations } = await getConversations();
      setConversations(nextConversations);
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMessages = useCallback(async (conversation) => {
    setError('');
    try {
      const { messages: nextMessages } = await getConversationMessages(conversation.id);
      setMessages(nextMessages);
    } catch (nextError) {
      setError(nextError.message);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadConversations();
      const refreshInterval = setInterval(() => {
        if (activeConversation) void loadMessages(activeConversation);
        else void loadConversations();
      }, 8000);
      return () => clearInterval(refreshInterval);
    }, [activeConversation, loadConversations, loadMessages])
  );

  const openConversation = async (conversation) => {
    setActiveConversation(conversation);
    setMessages([]);
    await loadMessages(conversation);
  };

  const openMemberPicker = async () => {
    setError('');
    setShowMembers(true);
    try {
      const { members: nextMembers } = await getMessageMembers();
      setMembers(nextMembers);
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  const startConversation = async (member) => {
    setError('');
    setIsStarting(true);
    try {
      const { conversation } = await createConversation(member.id);
      setShowMembers(false);
      await openConversation({ ...conversation, recipient_name: member.name });
      await loadConversations();
    } catch (nextError) {
      setError(nextError.message);
    } finally {
      setIsStarting(false);
    }
  };

  const sendMessage = async () => {
    if (!message.trim() || !activeConversation) return;
    setError('');
    try {
      await sendConversationMessage(activeConversation.id, message);
      setMessage('');
      await loadMessages(activeConversation);
    } catch (nextError) {
      setError(nextError.message);
    }
  };

  if (activeConversation) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.screen}>
          <BrandButton onPress={() => setActiveConversation(null)} variant="ghost">
            Retour aux conversations
          </BrandButton>
          <Text style={styles.eyebrow}>MESSAGES</Text>
          <Text style={styles.title}>{activeConversation.recipient_name}</Text>
          <ScrollView contentContainerStyle={styles.messageList}>
            {messages.map((item) => (
              <View key={item.id} style={styles.messageBubble}>
                <Text style={styles.sender}>{item.sender_name}</Text>
                <Text style={styles.messageText}>{item.message}</Text>
              </View>
            ))}
          </ScrollView>
          {!!error && (
            <Text accessibilityLiveRegion="polite" style={styles.error}>
              {error}
            </Text>
          )}
          <View style={styles.composer}>
            <TextInput
              accessibilityLabel="Écrire un message"
              maxLength={1000}
              onChangeText={setMessage}
              placeholder="Écrire un message…"
              placeholderTextColor={colors.muted}
              style={styles.input}
              value={message}
            />
            <BrandButton compact onPress={() => void sendMessage()} variant="secondary">
              Envoyer
            </BrandButton>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.screen}>
        <Text style={styles.eyebrow}>ENTRE RUNNEUSES</Text>
        <Text style={styles.title}>Mes messages.</Text>
        <Text style={styles.subtitle}>Échangez conseils et encouragements avec la communauté.</Text>
        <BrandButton onPress={() => void openMemberPicker()}>Nouveau message</BrandButton>
        {isLoading ? <ActivityIndicator color={colors.honey} /> : null}
        {!!error && (
          <Text accessibilityLiveRegion="polite" style={styles.error}>
            {error}
          </Text>
        )}
        {showMembers ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Choisir une runneuse</Text>
            {members.map((member) => (
              <Pressable
                accessibilityRole="button"
                disabled={isStarting}
                key={member.id}
                onPress={() => void startConversation(member)}
                style={styles.row}
              >
                <Text style={styles.rowText}>{member.name}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
        {!isLoading && !showMembers && conversations.length === 0 ? (
          <Text style={styles.subtitle}>Aucune conversation pour le moment.</Text>
        ) : null}
        {!showMembers
          ? conversations.map((conversation) => (
              <Pressable
                accessibilityRole="button"
                key={conversation.id}
                onPress={() => void openConversation(conversation)}
                style={styles.card}
              >
                <Text style={styles.cardTitle}>{conversation.recipient_name}</Text>
                <Text style={styles.subtitle}>Ouvrir la conversation</Text>
              </Pressable>
            ))
          : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { backgroundColor: colors.ink, flex: 1 },
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
  cardTitle: { ...type.action, color: colors.honey },
  row: { borderTopColor: colors.borderLight, borderTopWidth: 1, paddingVertical: spacing.md },
  rowText: { ...type.body, color: colors.white },
  messageList: { gap: spacing.md, paddingVertical: spacing.md },
  messageBubble: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    gap: spacing.xs,
    padding: spacing.md
  },
  sender: { ...type.action, color: colors.honey },
  messageText: { ...type.body, color: colors.white },
  composer: { alignItems: 'center', flexDirection: 'row', gap: spacing.sm },
  input: {
    borderBottomColor: colors.borderLight,
    borderBottomWidth: 1,
    color: colors.white,
    flex: 1,
    paddingVertical: spacing.sm
  },
  error: { ...type.body, color: colors.roseLight }
});
