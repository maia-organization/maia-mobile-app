const mockDb = {
  insert: jest.fn(),
  select: jest.fn()
};

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';

function limitedLookup(result) {
  return {
    from: () => ({
      where: () => ({ limit: jest.fn().mockResolvedValue(result) })
    })
  };
}

function feedbackLookup(result) {
  return {
    from: () => ({
      innerJoin: () => ({
        where: () => ({
          orderBy: () => ({ limit: jest.fn().mockResolvedValue(result) })
        })
      })
    })
  };
}

describe('workout routes', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test("requires a JWT to view today's workout", async () => {
    const response = await app.inject({ method: 'GET', url: '/workouts/today' });

    expect(response.statusCode).toBe(401);
  });

  function mockTodayWorkout(completedSessions) {
    mockDb.select
      .mockReturnValueOnce(
        limitedLookup([
          {
            cycleLength: 28,
            cycleStartDate: '2026-10-01',
            goal: 'endurance',
            level: 'intermediaire'
          }
        ])
      )
      .mockReturnValueOnce(feedbackLookup([]))
      .mockReturnValueOnce(
        limitedLookup([
          {
            adaptation: null,
            date: '2026-10-02',
            duration: 35,
            intensity: 'progressive',
            phase: 'follicular',
            title: 'Course progressive',
            type: 'run'
          }
        ])
      )
      .mockReturnValueOnce(limitedLookup(completedSessions));
    const insert = {
      onConflictDoNothing: jest.fn().mockResolvedValue()
    };
    mockDb.insert.mockReturnValue({ values: jest.fn().mockReturnValue(insert) });

    return insert;
  }

  function requestTodayWorkout() {
    return app.inject({
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
      method: 'GET',
      url: '/workouts/today'
    });
  }

  test('creates at most one daily recommendation and returns the saved workout', async () => {
    const insert = mockTodayWorkout([]);

    const response = await requestTodayWorkout();

    expect(response.statusCode).toBe(200);
    expect(insert.onConflictDoNothing).toHaveBeenCalledTimes(1);
    expect(response.json()).toEqual({
      data: {
        adaptation: null,
        completed: false,
        date: '2026-10-02',
        duration: 35,
        intensity: 'progressive',
        phase: 'follicular',
        title: 'Course progressive',
        type: 'run'
      },
      success: true
    });
  });

  test('identifies the daily workout as completed once a session of the day is completed', async () => {
    mockTodayWorkout([{ id: '5b0f6f43-8b4e-4c39-9a3e-2f7d4c1a9e11' }]);

    const response = await requestTodayWorkout();

    expect(response.statusCode).toBe(200);
    expect(response.json().data.completed).toBe(true);
  });
});
