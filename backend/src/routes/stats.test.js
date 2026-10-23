const mockDb = {
  select: jest.fn()
};

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';

function statsLookup(result) {
  return {
    from: () => ({
      where: jest.fn().mockResolvedValue(result)
    })
  };
}

describe('stats route', () => {
  let app;
  let authorization;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
    authorization = `Bearer ${app.jwt.sign({ sub: userId })}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  test('requires a JWT to access the statistics', async () => {
    const response = await app.inject({ method: 'GET', url: '/stats/me' });

    expect(response.statusCode).toBe(401);
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  test('returns rounded statistics for completed sessions only', async () => {
    mockDb.select.mockReturnValueOnce(
      statsLookup([{ averageDistance: '2.3456', totalDistance: '7.0367', totalSessions: '3' }])
    );

    const response = await app.inject({
      headers: { authorization },
      method: 'GET',
      url: '/stats/me'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: { average_distance: 2.346, total_distance: 7.037, total_sessions: 3 },
      success: true
    });
  });
});
