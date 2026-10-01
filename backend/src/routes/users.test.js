const { buildApp } = require('../app');

describe('profile routes', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
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
});
