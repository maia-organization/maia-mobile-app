const mockDb = {
  insert: jest.fn(),
  select: jest.fn()
};

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';
const settings = {
  defaultRunVisibility: 'followers',
  profileVisibility: 'public',
  showCycle: false,
  showStats: true
};

function limitedLookup(result) {
  return {
    from: () => ({
      where: () => ({ limit: jest.fn().mockResolvedValue(result) })
    })
  };
}

describe('privacy routes', () => {
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

  function request(method, payload) {
    return app.inject({
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
      method,
      payload,
      url: '/privacy/settings'
    });
  }

  test('returns the authenticated user privacy settings', async () => {
    mockDb.select.mockReturnValueOnce(limitedLookup([settings]));

    const response = await request('GET');

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: {
        settings: {
          default_run_visibility: 'followers',
          profile_visibility: 'public',
          show_cycle: false,
          show_stats: true
        }
      },
      success: true
    });
  });

  test('reports missing privacy settings', async () => {
    mockDb.select.mockReturnValueOnce(limitedLookup([]));

    const response = await request('GET');

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('PRIVACY_SETTINGS_NOT_FOUND');
  });

  test('rejects an invalid settings payload', async () => {
    const response = await request('PUT', { profile_visibility: 'invalid' });

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
  });

  test('reports an unknown user before saving settings', async () => {
    mockDb.select.mockReturnValueOnce(limitedLookup([]));

    const response = await request('PUT', {
      default_run_visibility: 'followers',
      profile_visibility: 'public',
      show_cycle: false,
      show_stats: true
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('USER_NOT_FOUND');
  });

  test('upserts valid settings for the authenticated user', async () => {
    mockDb.select.mockReturnValueOnce(limitedLookup([{ id: userId }]));
    const returning = jest.fn().mockResolvedValue([settings]);
    const onConflictDoUpdate = jest.fn().mockReturnValue({ returning });
    mockDb.insert.mockReturnValue({ values: jest.fn().mockReturnValue({ onConflictDoUpdate }) });

    const response = await request('PUT', {
      default_run_visibility: 'followers',
      profile_visibility: 'public',
      show_cycle: false,
      show_stats: true
    });

    expect(response.statusCode).toBe(200);
    expect(onConflictDoUpdate).toHaveBeenCalledTimes(1);
    expect(response.json().data.settings).toEqual({
      default_run_visibility: 'followers',
      profile_visibility: 'public',
      show_cycle: false,
      show_stats: true
    });
  });
});
