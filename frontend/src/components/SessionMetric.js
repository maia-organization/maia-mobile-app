import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, spacing, type } from '../theme';

export function SessionMetric({ label, spokenValue, value }) {
  return (
    <View accessibilityLabel={`${label} ${spokenValue ?? value}`} accessible style={styles.metric}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: { borderTopColor: 'rgba(15, 15, 15, 0.18)', borderTopWidth: 1, paddingTop: spacing.md },
  label: { ...type.eyebrow, color: colors.ink, textTransform: 'uppercase' },
  value: { color: colors.ink, fontFamily: fonts.heading, fontSize: 32, lineHeight: 38 }
});
