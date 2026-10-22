const { buildApp } = require('../app');

describe('planning routes', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('requires a JWT to view a weekly planning', async () => {
    const response = await app.inject({ method: 'GET', url: '/planning' });

    expect(response.statusCode).toBe(401);
  });

  test('rejects an unknown session choice before accessing the database', async () => {
    const response = await app.inject({
      headers: {
        authorization: `Bearer ${app.jwt.sign({ sub: '892ed587-cd78-46d4-8810-8f85e84c6310' })}`
      },
      method: 'POST',
      payload: { planned_date: '2099-01-01', type: 'marathon' },
      url: '/planning'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      error: { code: 'VALIDATION_ERROR' },
      success: false
    });
  });
});
