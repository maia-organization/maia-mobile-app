import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing } from '../theme';
import { BrandButton } from './BrandButton';
import { CycleFields } from './CycleFields';

export function CycleSettingsForm({
  cycleLength,
  cycleStartDate,
  error,
  isSaving,
  onCycleLengthChange,
  onCycleStartDateChange,
  onSave,
  onSecondaryAction,
  primaryLabel,
  savingLabel,
  secondaryLabel,
  showValidation,
  success,
  title
}) {
  return (
    <View style={styles.container}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <CycleFields
        cycleLength={cycleLength}
        cycleStartDate={cycleStartDate}
        onCycleLengthChange={onCycleLengthChange}
        onCycleStartDateChange={onCycleStartDateChange}
        onSubmitEditing={onSave}
        showValidation={showValidation}
      />
      {error ? (
        <Text accessibilityLiveRegion="polite" style={styles.error}>
          {error}
        </Text>
      ) : null}
      {success ? (
        <Text accessibilityLiveRegion="polite" style={styles.success}>
          {success}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <BrandButton disabled={isSaving} onPress={onSave}>
          {isSaving ? savingLabel : primaryLabel}
        </BrandButton>
        <BrandButton onPress={onSecondaryAction} variant="ghost">
          {secondaryLabel}
        </BrandButton>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  actions: { gap: spacing.md },
  container: { gap: spacing.lg },
  error: {
    color: colors.roseLight,
    fontFamily: fonts.strong,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center'
  },
  success: {
    backgroundColor: colors.honeySoft,
    borderColor: colors.borderLight,
    borderRadius: radius.sm,
    borderWidth: 1,
    color: colors.honey,
    fontFamily: fonts.strong,
    fontSize: 13,
    lineHeight: 18,
    padding: spacing.md,
    textAlign: 'center'
  },
  title: { color: colors.honey, fontFamily: fonts.strong, fontSize: 16 }
});
