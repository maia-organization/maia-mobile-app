const mockDb = { insert: jest.fn(), select: jest.fn() };
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
  beforeEach(() => jest.clearAllMocks());

  test('rejects invalid reports', async () => {
    const response = await app.inject({
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
      method: 'POST',
      payload: { reason: '' },
      url: '/moderation/reports'
    });
    expect(response.statusCode).toBe(400);
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  test('returns a controlled 404 when a reported post does not exist', async () => {
    mockDb.select.mockReturnValue({
      from: () => ({ where: () => ({ limit: jest.fn().mockResolvedValue([]) }) })
    });
    const response = await app.inject({
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
      method: 'POST',
      payload: {
        post_id: '792ed587-cd78-46d4-8810-8f85e84c6310',
        reason: 'Harcèlement'
      },
      url: '/moderation/reports'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('POST_NOT_FOUND');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  test('records a report for an existing post', async () => {
    const postId = '792ed587-cd78-46d4-8810-8f85e84c6310';
    const insert = { values: jest.fn().mockResolvedValue() };
    mockDb.select.mockReturnValue({
      from: () => ({ where: () => ({ limit: jest.fn().mockResolvedValue([{ id: postId }]) }) })
    });
    mockDb.insert.mockReturnValue(insert);
    const response = await app.inject({
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
      method: 'POST',
      payload: { post_id: postId, reason: 'Harcèlement' },
      url: '/moderation/reports'
    });

    expect(response.statusCode).toBe(201);
    expect(insert.values).toHaveBeenCalledWith({
      postId,
      reason: 'Harcèlement',
      reporterId: userId
    });
  });

  test('returns a controlled 404 when a blocked user does not exist', async () => {
    mockDb.select.mockReturnValue({
      from: () => ({ where: () => ({ limit: jest.fn().mockResolvedValue([]) }) })
    });
    const response = await app.inject({
      headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
      method: 'POST',
      url: '/moderation/blocks/792ed587-cd78-46d4-8810-8f85e84c6310'
    });

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('USER_NOT_FOUND');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });
  test('requires authentication to block a user', async () =>
    expect(
      (await app.inject({ method: 'POST', url: `/moderation/blocks/${userId}` })).statusCode
    ).toBe(401));
});
