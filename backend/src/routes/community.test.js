const { buildApp } = require('../app');

describe('community routes', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('requires authentication to view the community feed', async () => {
    const response = await app.inject({ method: 'GET', url: '/community/feed' });

    expect(response.statusCode).toBe(401);
  });

  test('returns an empty feed before any run is shared', async () => {
    const token = app.jwt.sign({ sub: '892ed587-cd78-46d4-8810-8f85e84c6310' });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'GET',
      url: '/community/feed'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ data: { posts: [] }, success: true });
  });
});
