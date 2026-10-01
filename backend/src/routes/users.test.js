const mockDb = {
  select: jest.fn(),
  transaction: jest.fn()
};

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const validProfile = {
  birthdate: '1995-04-12',
  cycleLength: 28,
  cycleStartDate: '2026-09-20',
  goal: 'regularite',
  height: 165,
  id: '892ed587-cd78-46d4-8810-8f85e84c6310',
  level: 'debutante',
  name: 'Maïa',
  weight: 60
};

const validPayload = {
  birthdate: '1995-04-12',
  cycle_length: 28,
  cycle_start_date: '2026-09-20',
  goal: 'regularite',
  height: 165,
  level: 'debutante',
  weight: 60
};

describe('profile routes', () => {
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

  test('rejects profile access without a JWT', async () => {
    const response = await app.inject({ method: 'GET', url: '/users/me' });

    expect(response.statusCode).toBe(401);
    expect(response.json()).toMatchObject({
      error: { code: 'UNAUTHORIZED' },
      success: false
    });
  });

  test('validates an authenticated update before accessing the database', async () => {
    const token = app.jwt.sign({ sub: '892ed587-cd78-46d4-8810-8f85e84c6310' });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload: { weight: 10 },
      url: '/users/me'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: 'VALIDATION_ERROR' },
      success: false
    });
  });

  test('returns the authenticated user profile', async () => {
    mockDb.select.mockReturnValue({
      from: () => ({
        where: () => ({ limit: jest.fn().mockResolvedValue([validProfile]) })
      })
    });
    const token = app.jwt.sign({ sub: validProfile.id });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'GET',
      url: '/users/me'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: { user: validProfile }, success: true });
  });

  test('returns 404 when the authenticated user no longer exists', async () => {
    mockDb.select.mockReturnValue({
      from: () => ({
        where: () => ({ limit: jest.fn().mockResolvedValue([]) })
      })
    });
    const token = app.jwt.sign({ sub: validProfile.id });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'GET',
      url: '/users/me'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'USER_NOT_FOUND' },
      success: false
    });
  });

  test('updates the user and cycle in the same transaction', async () => {
    const transaction = { update: jest.fn() };
    const userUpdate = {
      returning: jest.fn().mockResolvedValue([validProfile]),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis()
    };
    const cycleUpdate = {
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue()
    };
    transaction.update.mockReturnValueOnce(userUpdate).mockReturnValueOnce(cycleUpdate);
    mockDb.transaction.mockImplementation((callback) => callback(transaction));
    const token = app.jwt.sign({ sub: validProfile.id });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload: validPayload,
      url: '/users/me'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: { user: validProfile }, success: true });
    expect(mockDb.transaction).toHaveBeenCalledTimes(1);
    expect(transaction.update).toHaveBeenCalledTimes(2);
    expect(cycleUpdate.set).toHaveBeenCalledWith(
      expect.objectContaining({
        cycleLength: 28,
        cycleStartDate: '2026-09-20',
        lastUpdated: expect.any(Date)
      })
    );
  });

  test('returns 404 when the transaction does not update a user', async () => {
    const transaction = { update: jest.fn() };
    const userUpdate = {
      returning: jest.fn().mockResolvedValue([]),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis()
    };
    transaction.update.mockReturnValue(userUpdate);
    mockDb.transaction.mockImplementation((callback) => callback(transaction));
    const token = app.jwt.sign({ sub: validProfile.id });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload: validPayload,
      url: '/users/me'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({
      error: { code: 'USER_NOT_FOUND' },
      success: false
    });
    expect(transaction.update).toHaveBeenCalledTimes(1);
  });
});
