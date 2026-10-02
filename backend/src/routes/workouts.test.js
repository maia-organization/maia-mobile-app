const mockDb = {
  insert: jest.fn(),
  select: jest.fn()
};

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';

function profileLookup(result) {
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
    jest.clearAllMocks();
  });

  test("requires a JWT to view today's workout", async () => {
    const response = await app.inject({ method: 'GET', url: '/workouts/today' });

    expect(response.statusCode).toBe(401);
  });

  test('creates at most one daily recommendation and returns the saved workout', async () => {
    mockDb.select
      .mockReturnValueOnce(
        profileLookup([
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
        profileLookup([
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
      );
    const insert = {
      onConflictDoNothing: jest.fn().mockResolvedValue()
    };
    mockDb.insert.mockReturnValue({ values: jest.fn().mockReturnValue(insert) });
    const token = app.jwt.sign({ sub: userId });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'GET',
      url: '/workouts/today'
    });

    expect(response.statusCode).toBe(200);
    expect(insert.onConflictDoNothing).toHaveBeenCalledTimes(1);
    expect(response.json()).toEqual({
      data: {
        adaptation: null,
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
});
