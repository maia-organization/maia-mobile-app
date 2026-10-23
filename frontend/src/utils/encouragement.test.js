import { getPostSessionEncouragement } from './encouragement';

describe('getPostSessionEncouragement', () => {
  it('valorise une distance importante réalisée', () => {
    expect(getPostSessionEncouragement({ distance: 5.2, duration: 1200 })).toMatch(
      /belle distance/i
    );
  });

  it('valorise la régularité quand la séance dure au moins trente minutes', () => {
    expect(getPostSessionEncouragement({ distance: 2, duration: 1800 })).toMatch(/régularité/i);
  });
});
