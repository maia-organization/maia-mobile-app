import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, spacing, type } from '../theme';

export function AuthScreenLayout({ children, eyebrow, footer, subtitle, title, topAccessory }) {
  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboard}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {topAccessory ? <View style={styles.topAccessory}>{topAccessory}</View> : null}

          <View style={styles.header}>
            <Text style={styles.eyebrow}>{eyebrow}</Text>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.subtitle}>{subtitle}</Text>
          </View>

          <View style={styles.body}>{children}</View>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: spacing.lg
  },
  content: {
    flexGrow: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingVertical: 42
  },
  eyebrow: {
    ...type.eyebrow,
    color: colors.rose,
    textTransform: 'uppercase'
  },
  footer: {
    marginTop: spacing.xl
  },
  header: {
    gap: spacing.md,
    marginBottom: spacing.xxl
  },
  keyboard: {
    flex: 1
  },
  safeArea: {
    backgroundColor: colors.ink,
    flex: 1
  },
  subtitle: {
    ...type.body,
    color: colors.cream
  },
  title: {
    ...type.title,
    color: colors.white
  },
  topAccessory: {
    marginBottom: spacing.xl
  }
});
