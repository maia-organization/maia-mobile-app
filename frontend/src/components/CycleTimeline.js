import { StyleSheet, Text, View } from 'react-native';

import { colors, fonts, radius, spacing, type } from '../theme';

const phaseColors = {
  follicular: colors.honey,
  luteal: colors.roseLight,
  menstrual: colors.rose,
  ovulatory: colors.success
};

function formatDate(date) {
  return new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' }).format(
    new Date(`${date}T12:00:00`)
  );
}

function durationInDays({ end_date: endDate, start_date: startDate }) {
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  return (
    (new Date(`${endDate}T12:00:00`) - new Date(`${startDate}T12:00:00`)) / millisecondsPerDay + 1
  );
}

export function CycleTimeline({ currentPhase, projections }) {
  const menstrualPhase = projections.find(({ phase }) => phase === 'menstrual');
  const ovulatoryPhase = projections.find(({ phase }) => phase === 'ovulatory');

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Ton cycle en un regard</Text>
      <View
        accessibilityElementsHidden
        importantForAccessibility="no-hide-descendants"
        style={styles.timeline}
      >
        {projections.map((projection) => {
          const isCurrent = projection.phase === currentPhase;

          return (
            <View
              key={projection.phase}
              style={[
                styles.segment,
                {
                  backgroundColor: phaseColors[projection.phase],
                  flex: durationInDays(projection)
                },
                isCurrent && styles.currentSegment
              ]}
            />
          );
        })}
      </View>

      <View style={styles.phases}>
        {projections.map((projection) => {
          const isCurrent = projection.phase === currentPhase;

          return (
            <View key={projection.phase} style={styles.phaseRow}>
              <View style={[styles.dot, { backgroundColor: phaseColors[projection.phase] }]} />
              <View style={styles.phaseContent}>
                <Text style={styles.phaseLabel}>{projection.label}</Text>
                <Text style={styles.dates}>
                  Du {formatDate(projection.start_date)} au {formatDate(projection.end_date)}
                </Text>
              </View>
              {isCurrent ? <Text style={styles.current}>Aujourd’hui</Text> : null}
            </View>
          );
        })}
      </View>

      <View style={styles.keyDates}>
        <Text style={styles.keyDate}>Règles prévues : {formatDate(menstrualPhase.start_date)}</Text>
        <Text style={styles.keyDate}>
          Ovulation prévue : {formatDate(ovulatoryPhase.start_date)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderLight,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.lg,
    padding: spacing.lg
  },
  current: { ...type.eyebrow, color: colors.cream },
  currentSegment: { borderColor: colors.white, borderWidth: 2 },
  dates: { color: colors.muted, fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  dot: { borderRadius: radius.round, height: 12, marginTop: 3, width: 12 },
  keyDate: { color: colors.cream, fontFamily: fonts.strong, fontSize: 13, lineHeight: 19 },
  keyDates: {
    borderTopColor: colors.borderLight,
    borderTopWidth: 1,
    gap: spacing.xs,
    paddingTop: spacing.md
  },
  phaseContent: { flex: 1, gap: 2 },
  phaseLabel: { color: colors.white, fontFamily: fonts.strong, fontSize: 14, lineHeight: 19 },
  phaseRow: { alignItems: 'flex-start', flexDirection: 'row', gap: spacing.sm },
  phases: { gap: spacing.md },
  segment: { flex: 1, height: 14 },
  timeline: { borderRadius: radius.round, flexDirection: 'row', overflow: 'hidden' },
  title: { color: colors.white, fontFamily: fonts.strong, fontSize: 18, lineHeight: 24 }
});
