const mockDb = { insert: jest.fn() };
jest.mock('../db', () => ({ db: mockDb }));
const { buildApp } = require('../app');
describe('moderation routes', () => {
  let app;
  const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';
  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });
  afterAll(async () => app.close());
  test('rejects invalid reports', async () => {
    const response = await app.inject({
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
      method: 'POST',
      payload: { reason: '' },
      url: '/moderation/reports'
    });
    expect(response.statusCode).toBe(400);
  });
  test('requires authentication to block a user', async () =>
    expect(
      (await app.inject({ method: 'POST', url: `/moderation/blocks/${userId}` })).statusCode
    ).toBe(401));
});
