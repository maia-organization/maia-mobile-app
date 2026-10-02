const { calculateDistance, getSessionMetrics, isValidCoordinates } = require('./tracking');

const coordinates = [
  { lat: 48.8566, lng: 2.3522, timestamp: '2026-09-11T10:00:00.000Z' },
  { lat: 48.8656, lng: 2.3522, timestamp: '2026-09-11T10:06:00.000Z' }
];

describe('running session tracking', () => {
  test('calculates distance and pace from GPS coordinates', () => {
    const metrics = getSessionMetrics(
      new Date('2026-09-11T10:00:00.000Z'),
      new Date('2026-09-11T10:06:00.000Z'),
      coordinates
    );

    expect(metrics.distance).toBeCloseTo(1.001, 2);
    expect(metrics.duration).toBe(360);
    expect(metrics.averagePace).toBeCloseTo(6, 1);
  });

  test('validates coordinate bounds and chronological timestamps', () => {
    expect(isValidCoordinates(coordinates)).toBe(true);
    expect(isValidCoordinates([{ ...coordinates[0], lat: 91 }])).toBe(false);
    expect(isValidCoordinates([...coordinates].reverse())).toBe(false);
  });

  test('returns zero for a route without enough points', () => {
    expect(calculateDistance([])).toBe(0);
    expect(calculateDistance(coordinates.slice(0, 1))).toBe(0);
  });

  test('does not count distance travelled while tracking is paused', () => {
    const pausedCoordinates = [
      coordinates[0],
      { ...coordinates[1], paused: true, timestamp: '2026-09-11T10:07:00.000Z' }
    ];

    expect(calculateDistance(pausedCoordinates)).toBe(0);
  });
});
