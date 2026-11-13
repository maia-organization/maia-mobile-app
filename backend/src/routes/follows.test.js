const mockDb = { select: jest.fn() };
jest.mock('../db', () => ({ db: mockDb }));
const { buildApp } = require('../app');
describe('follow routes', () => {
  let app;
  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });
  afterAll(async () => app.close());
  test('requires authentication', async () =>
    expect((await app.inject({ method: 'GET', url: '/follows' })).statusCode).toBe(401));
  test('rejects self follow', async () => {
    const id = '892ed587-cd78-46d4-8810-8f85e84c6310';
    const response = await app.inject({
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: id })}` },
      method: 'POST',
      url: `/follows/${id}`
    });
    expect(response.statusCode).toBe(400);
  });
});
