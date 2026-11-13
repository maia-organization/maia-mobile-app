const mockDb = { insert: jest.fn() };

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

describe('symptom routes', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.clearAllMocks());

  test('requires a JWT to save symptoms', async () => {
    const response = await app.inject({
      method: 'PUT',
      payload: { symptoms: ['fatigue'] },
      url: '/symptoms/today'
    });

    expect(response.statusCode).toBe(401);
  });

  test('rejects an empty or unknown selection', async () => {
    const token = app.jwt.sign({ sub: '892ed587-cd78-46d4-8810-8f85e84c6310' });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload: { symptoms: ['unknown'] },
      url: '/symptoms/today'
    });

    expect(response.statusCode).toBe(400);
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  test('saves today’s selection', async () => {
    const entry = { recordedOn: '2026-11-13', symptoms: ['fatigue'] };
    const returning = jest.fn().mockResolvedValue([entry]);
    const onConflictDoUpdate = jest.fn().mockReturnValue({ returning });
    mockDb.insert.mockReturnValue({ values: jest.fn().mockReturnValue({ onConflictDoUpdate }) });
    const token = app.jwt.sign({ sub: '892ed587-cd78-46d4-8810-8f85e84c6310' });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload: { symptoms: ['fatigue'] },
      url: '/symptoms/today'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: { recorded_on: '2026-11-13', symptoms: ['fatigue'] },
      success: true
    });
  });
});
