const intensityByPhase = {
  follicular: 'progressive',
  luteal: 'moderate',
  menstrual: 'low',
  ovulatory: 'high'
};

const titleByPhase = {
  follicular: 'Course progressive',
  luteal: 'Footing modéré',
  menstrual: 'Footing récupération',
  ovulatory: 'Séance dynamique'
};

const durationByLevel = {
  avancee: 40,
  debutante: 20,
  intermediaire: 30
};

const phaseDurationAdjustment = {
  follicular: 5,
  luteal: 0,
  menstrual: -5,
  ovulatory: 10
};

const DAY_IN_MS = 24 * 60 * 60 * 1000;

const encouragementByPhase = {
  follicular: 'Ton énergie remonte : c’est un beau moment pour explorer à ton rythme.',
  luteal: 'Chaque foulée compte. Reste à l’écoute de ton corps aujourd’hui.',
  menstrual: 'Une sortie douce est déjà une vraie performance. Avance à ton rythme.',
  ovulatory: 'Ton corps est avec toi : profite de cette énergie pour te faire confiance.'
};

function needsRecovery(feedback) {
  return feedback?.pain >= 4 || feedback?.fatigue >= 4 || feedback?.energy <= 2;
}

// Recommendation dates are UTC days (see getWorkoutRecommendation).
function getDayRange(date) {
  const start = new Date(`${date}T00:00:00.000Z`);

  return { end: new Date(start.getTime() + DAY_IN_MS), start };
}

function getWorkoutRecommendation({ cycleView, feedback, goal, lastManualAdaptation, level }) {
  const phase = cycleView.current_phase;
  const goalAdjustment = goal === 'endurance' ? 5 : 0;
  const shouldRecover = needsRecovery(feedback);
  const recoveryAdjustment = shouldRecover ? -10 : 0;
  const followsWalkPreference = lastManualAdaptation?.type === 'walk';
  const intensityAdjustment =
    lastManualAdaptation?.intensity === 'low'
      ? -10
      : lastManualAdaptation?.intensity === 'high'
        ? 10
        : 0;

  return {
    adaptation: followsWalkPreference
      ? 'Adaptée à ton choix de marche lors de ta dernière séance.'
      : shouldRecover
        ? 'Séance allégée selon ton dernier ressenti.'
        : intensityAdjustment
          ? 'Adaptée à l’intensité choisie lors de ta dernière séance.'
          : null,
    date: new Date().toISOString().slice(0, 10),
    duration: Math.max(
      15,
      durationByLevel[level] +
        phaseDurationAdjustment[phase] +
        goalAdjustment +
        recoveryAdjustment +
        intensityAdjustment +
        (followsWalkPreference ? -10 : 0)
    ),
    intensity:
      followsWalkPreference || shouldRecover
        ? 'low'
        : lastManualAdaptation?.intensity || intensityByPhase[phase],
    phase,
    title: followsWalkPreference ? 'Marche adaptée' : titleByPhase[phase],
    type: followsWalkPreference ? 'walk' : 'run'
  };
}

function getPreSessionEncouragement({ cycleView, feedback }) {
  if (needsRecovery(feedback)) {
    return 'Ton dernier ressenti invite à la douceur : prendre soin de toi fait partie de ta progression.';
  }

  return encouragementByPhase[cycleView.current_phase];
}

module.exports = { getDayRange, getPreSessionEncouragement, getWorkoutRecommendation };
