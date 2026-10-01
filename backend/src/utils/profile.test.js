const { buildProfilePayload, isValidProfile } = require('./profile');

const validBody = {
  birthdate: '1995-04-12',
  cycle_length: 28,
  cycle_start_date: '2026-09-20',
  goal: 'regularite',
  height: 165,
  level: 'debutante',
  weight: 60
};

describe('profile validation', () => {
  test('normalizes a complete profile payload', () => {
    expect(buildProfilePayload({ ...validBody, goal: ' endurance ', level: ' avancee ' })).toEqual({
      birthdate: '1995-04-12',
      cycleLength: 28,
      cycleStartDate: '2026-09-20',
      goal: 'endurance',
      height: 165,
      level: 'avancee',
      weight: 60
    });
  });

  test('accepts a valid profile', () => {
    expect(isValidProfile(buildProfilePayload(validBody))).toBe(true);
  });

  test.each([
    ['future birthdate', { birthdate: '2999-01-01' }],
    ['weight outside range', { weight: 301 }],
    ['height outside range', { height: 100 }],
    ['unsupported level', { level: 'elite' }],
    ['unsupported goal', { goal: 'vitesse' }],
    ['cycle outside range', { cycle_length: 41 }]
  ])('rejects %s', (_label, changes) => {
    expect(isValidProfile(buildProfilePayload({ ...validBody, ...changes }))).toBe(false);
  });
});
