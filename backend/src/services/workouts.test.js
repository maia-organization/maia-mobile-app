const { getDayRange, getWorkoutRecommendation } = require('./workouts');

describe('workout day range', () => {
  test('bounds a recommendation date to its UTC day, across a year boundary', () => {
    expect(getDayRange('2026-12-31')).toEqual({
      end: new Date('2027-01-01T00:00:00.000Z'),
      start: new Date('2026-12-31T00:00:00.000Z')
    });
  });
});

describe('workout recommendation', () => {
  test('reduces effort during the menstrual phase', () => {
    expect(
      getWorkoutRecommendation({
        cycleView: { current_phase: 'menstrual' },
        goal: 'regularite',
        level: 'debutante'
      })
    ).toMatchObject({ duration: 15, intensity: 'low', type: 'run' });
  });

  test('increases duration for an advanced endurance profile during ovulation', () => {
    expect(
      getWorkoutRecommendation({
        cycleView: { current_phase: 'ovulatory' },
        goal: 'endurance',
        level: 'avancee'
      })
    ).toMatchObject({ duration: 55, intensity: 'high', type: 'run' });
  });

  test('reduces the next workout after difficult feedback', () => {
    expect(
      getWorkoutRecommendation({
        cycleView: { current_phase: 'ovulatory' },
        feedback: { energy: 2, fatigue: 4, pain: 4 },
        goal: 'performance',
        level: 'intermediaire'
      })
    ).toMatchObject({ duration: 30, intensity: 'low' });
  });
});
