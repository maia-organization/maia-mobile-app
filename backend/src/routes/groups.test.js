const mockDb = { select: jest.fn() };
jest.mock('../db', () => ({ db: mockDb }));
const { buildApp } = require('../app');

describe('group routes', () => {
  let app;
  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });
  afterAll(async () => app.close());
  beforeEach(() => jest.clearAllMocks());

  test('requires authentication to list groups', async () => {
    expect((await app.inject({ method: 'GET', url: '/groups' })).statusCode).toBe(401);
  });

  test('rejects incomplete group creation before persistence', async () => {
    const token = app.jwt.sign({ sub: '892ed587-cd78-46d4-8810-8f85e84c6310' });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      payload: { name: 'Les abeilles' },
      url: '/groups'
    });
    expect(response.statusCode).toBe(400);
    expect(mockDb.select).not.toHaveBeenCalled();
  });
});
