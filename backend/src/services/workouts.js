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

// Recommendation dates are UTC days (see getWorkoutRecommendation).
function getDayRange(date) {
  const start = new Date(`${date}T00:00:00.000Z`);

  return { end: new Date(start.getTime() + DAY_IN_MS), start };
}

function getWorkoutRecommendation({ cycleView, feedback, goal, level }) {
  const phase = cycleView.current_phase;
  const goalAdjustment = goal === 'endurance' ? 5 : 0;
  const needsRecovery = feedback?.pain >= 4 || feedback?.fatigue >= 4 || feedback?.energy <= 2;
  const recoveryAdjustment = needsRecovery ? -10 : 0;

  return {
    adaptation: needsRecovery ? 'Séance allégée selon ton dernier ressenti.' : null,
    date: new Date().toISOString().slice(0, 10),
    duration: Math.max(
      15,
      durationByLevel[level] + phaseDurationAdjustment[phase] + goalAdjustment + recoveryAdjustment
    ),
    intensity: needsRecovery ? 'low' : intensityByPhase[phase],
    phase,
    title: titleByPhase[phase],
    type: 'run'
  };
}

module.exports = { getDayRange, getWorkoutRecommendation };
