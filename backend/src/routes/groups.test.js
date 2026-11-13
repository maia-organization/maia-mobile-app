const mockDb = { insert: jest.fn(), select: jest.fn() };
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

  test('rejects an empty group publication before accessing the database', async () => {
    const token = app.jwt.sign({ sub: '892ed587-cd78-46d4-8810-8f85e84c6310' });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      payload: { message: '   ' },
      url: '/groups/892ed587-cd78-46d4-8810-8f85e84c6310/feed'
    });

    expect(response.statusCode).toBe(400);
    expect(mockDb.select).not.toHaveBeenCalled();
    expect(mockDb.insert).not.toHaveBeenCalled();
  });

  test('creates a publication for a group member', async () => {
    const memberSelect = {
      from: () => ({
        where: () => ({ limit: jest.fn().mockResolvedValue([{ id: 'member-1' }]) })
      })
    };
    const post = {
      id: 'post-1',
      message: 'On se retrouve dimanche !',
      userId: '892ed587-cd78-46d4-8810-8f85e84c6310'
    };
    const postInsert = {
      returning: jest.fn().mockResolvedValue([post]),
      values: jest.fn().mockReturnThis()
    };
    mockDb.select.mockReturnValue(memberSelect);
    mockDb.insert.mockReturnValue(postInsert);
    const token = app.jwt.sign({ sub: '892ed587-cd78-46d4-8810-8f85e84c6310' });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      payload: { message: ' On se retrouve dimanche ! ' },
      url: '/groups/892ed587-cd78-46d4-8810-8f85e84c6310/feed'
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.post).toEqual(post);
    expect(postInsert.values).toHaveBeenCalledWith({
      groupId: '892ed587-cd78-46d4-8810-8f85e84c6310',
      message: 'On se retrouve dimanche !',
      userId: '892ed587-cd78-46d4-8810-8f85e84c6310'
    });
  });

  test('does not allow a user to join a private group without an invitation', async () => {
    const groupSelect = {
      from: () => ({
        where: () => ({
          limit: jest.fn().mockResolvedValue([{ id: 'group-1', visibility: 'private' }])
        })
      })
    };
    mockDb.select.mockReturnValue(groupSelect);
    const token = app.jwt.sign({ sub: '892ed587-cd78-46d4-8810-8f85e84c6310' });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      url: '/groups/892ed587-cd78-46d4-8810-8f85e84c6310/join'
    });

    expect(response.statusCode).toBe(403);
    expect(response.json().error.code).toBe('GROUP_PRIVATE');
    expect(mockDb.insert).not.toHaveBeenCalled();
  });
});
