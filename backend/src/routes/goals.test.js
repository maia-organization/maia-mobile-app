const mockDb = { insert: jest.fn(), select: jest.fn() };

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';
const goal = { reminderEnabled: true, targetType: 'distance', targetValue: 12 };

function selectResult(result) {
  return {
    from: () => ({ where: () => ({ limit: jest.fn().mockResolvedValue(result) }) })
  };
}

function progressResult(result) {
  return { from: () => ({ where: jest.fn().mockResolvedValue(result) }) };
}

describe('weekly goal routes', () => {
  let app;
  let authorization;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
    authorization = `Bearer ${app.jwt.sign({ sub: userId })}`;
  });

  afterAll(async () => app.close());

  beforeEach(() => jest.resetAllMocks());

  test('requires a JWT', async () => {
    const response = await app.inject({ method: 'GET', url: '/goals/weekly' });
    expect(response.statusCode).toBe(401);
  });

  test('returns the weekly progress for a saved distance goal', async () => {
    mockDb.select
      .mockReturnValueOnce(selectResult([goal]))
      .mockReturnValueOnce(progressResult([{ completedSessions: '2', totalDistance: '5.6789' }]));

    const response = await app.inject({
      headers: { authorization },
      method: 'GET',
      url: '/goals/weekly'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.goal).toMatchObject({
      current_value: 5.679,
      reminder_enabled: true,
      target_type: 'distance',
      target_value: 12
    });
  });

  test('rejects an invalid goal before writing it', async () => {
    const response = await app.inject({
      headers: { authorization },
      method: 'PUT',
      payload: { reminder_enabled: true, target_type: 'sessions', target_value: 2.5 },
      url: '/goals/weekly'
    });

    expect(response.statusCode).toBe(400);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  test('creates or adjusts a weekly goal', async () => {
    const insert = {
      onConflictDoUpdate: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([goal]),
      values: jest.fn().mockReturnThis()
    };
    mockDb.insert.mockReturnValue(insert);
    mockDb.select.mockReturnValueOnce(
      progressResult([{ completedSessions: '2', totalDistance: '6' }])
    );

    const response = await app.inject({
      headers: { authorization },
      method: 'PUT',
      payload: { reminder_enabled: true, target_type: 'distance', target_value: 12 },
      url: '/goals/weekly'
    });

    expect(response.statusCode).toBe(200);
    expect(insert.onConflictDoUpdate).toHaveBeenCalled();
    expect(response.json().data.goal).toMatchObject({ current_value: 6, target_value: 12 });
  });
});
