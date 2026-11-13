const mockDb = {
  select: jest.fn(),
  transaction: jest.fn()
};

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';
const settings = {
  cycleNotifications: true,
  preferredTime: 18,
  socialNotifications: false,
  workoutNotifications: true
};
const payload = {
  cycle_notifications: false,
  enabled: true,
  preferred_time: 7,
  social_notifications: true,
  workout_notifications: false
};

function selectResult(result) {
  return {
    from: () => ({
      where: () => ({ limit: jest.fn().mockResolvedValue(result) })
    })
  };
}

describe('notification routes', () => {
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

  test('rejects notification settings access without a JWT', async () => {
    const response = await app.inject({ method: 'GET', url: '/notifications/settings' });

    expect(response.statusCode).toBe(401);
  });

  test('returns the saved notification settings', async () => {
    mockDb.select
      .mockReturnValueOnce(selectResult([{ notificationEnabled: true }]))
      .mockReturnValueOnce(selectResult([settings]));
    const token = app.jwt.sign({ sub: userId });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'GET',
      url: '/notifications/settings'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: {
        settings: {
          cycle_notifications: true,
          enabled: true,
          preferred_time: 18,
          social_notifications: false,
          workout_notifications: true
        }
      },
      success: true
    });
  });

  test('validates each notification preference before accessing the database', async () => {
    const token = app.jwt.sign({ sub: userId });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload: { ...payload, social_notifications: 'yes' },
      url: '/notifications/settings'
    });

    expect(response.statusCode).toBe(400);
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  test('rejects a reminder hour outside the 0 to 23 range', async () => {
    const token = app.jwt.sign({ sub: userId });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload: { ...payload, preferred_time: 24 },
      url: '/notifications/settings'
    });

    expect(response.statusCode).toBe(400);
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  test('saves the global and category preferences atomically', async () => {
    const transaction = { insert: jest.fn(), update: jest.fn() };
    const userUpdate = {
      returning: jest.fn().mockResolvedValue([{ notificationEnabled: true }]),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis()
    };
    const settingsInsert = {
      onConflictDoUpdate: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([
        {
          cycleNotifications: false,
          preferredTime: 7,
          socialNotifications: true,
          workoutNotifications: false
        }
      ]),
      values: jest.fn().mockReturnThis()
    };
    transaction.update.mockReturnValue(userUpdate);
    transaction.insert.mockReturnValue(settingsInsert);
    mockDb.transaction.mockImplementation((callback) => callback(transaction));
    const token = app.jwt.sign({ sub: userId });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload,
      url: '/notifications/settings'
    });

    expect(response.statusCode).toBe(200);
    expect(transaction.update).toHaveBeenCalledTimes(1);
    expect(transaction.insert).toHaveBeenCalledTimes(1);
    expect(settingsInsert.onConflictDoUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        set: expect.objectContaining({
          cycleNotifications: false,
          preferredTime: 7,
          socialNotifications: true,
          workoutNotifications: false
        })
      })
    );
    expect(response.json().data.settings).toMatchObject(payload);
  });
});
