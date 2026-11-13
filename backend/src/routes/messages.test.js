const mockDb = { select: jest.fn(), transaction: jest.fn(), update: jest.fn() };
jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';
const recipientId = '992ed587-cd78-46d4-8810-8f85e84c6310';
const conversationId = '792ed587-cd78-46d4-8810-8f85e84c6310';

describe('message routes', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  beforeEach(() => jest.clearAllMocks());
  afterAll(async () => app.close());

  test('requires a JWT to read conversations', async () => {
    const response = await app.inject({ method: 'GET', url: '/messages/conversations' });

    expect(response.statusCode).toBe(401);
  });

  test('rejects an empty message before accessing the database', async () => {
    const token = app.jwt.sign({ sub: userId });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      payload: { message: '   ' },
      url: `/messages/conversations/${conversationId}/messages`
    });

    expect(response.statusCode).toBe(400);
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  test('creates a conversation with the selected member', async () => {
    const transaction = { insert: jest.fn(), select: jest.fn() };
    transaction.select.mockReturnValue({
      from: () => ({
        where: () => ({ limit: jest.fn().mockResolvedValue([{ id: recipientId, name: 'Lina' }]) })
      })
    });
    const conversationInsert = {
      returning: jest.fn().mockResolvedValue([{ id: conversationId }]),
      values: jest.fn().mockReturnThis()
    };
    const memberInsert = { values: jest.fn().mockResolvedValue() };
    transaction.insert.mockReturnValueOnce(conversationInsert).mockReturnValueOnce(memberInsert);
    mockDb.transaction.mockImplementation((callback) => callback(transaction));
    const token = app.jwt.sign({ sub: userId });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      payload: { recipient_id: recipientId },
      url: '/messages/conversations'
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data.conversation).toMatchObject({
      id: conversationId,
      recipient: { id: recipientId, name: 'Lina' }
    });
    expect(memberInsert.values).toHaveBeenCalledWith([
      { conversationId, userId },
      { conversationId, userId: recipientId }
    ]);
  });

  test('includes the unread notification count for each conversation', async () => {
    const listSelect = {
      from: () => ({
        innerJoin: () => ({
          where: () => ({
            orderBy: jest.fn().mockResolvedValue([{ created_at: '2026-11-13', id: conversationId }])
          })
        })
      })
    };
    const recipientSelect = {
      from: () => ({
        innerJoin: () => ({
          where: () => ({ limit: jest.fn().mockResolvedValue([{ name: 'Lina' }]) })
        })
      })
    };
    const unreadSelect = {
      from: () => ({
        innerJoin: () => ({ where: jest.fn().mockResolvedValue([{ count: '2' }]) })
      })
    };
    mockDb.select
      .mockReturnValueOnce(listSelect)
      .mockReturnValueOnce(recipientSelect)
      .mockReturnValueOnce(unreadSelect);
    const token = app.jwt.sign({ sub: userId });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'GET',
      url: '/messages/conversations'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.conversations).toEqual([
      {
        created_at: '2026-11-13',
        id: conversationId,
        recipient_name: 'Lina',
        unread_count: 2
      }
    ]);
  });

  test('creates a notification for each message recipient', async () => {
    const memberSelect = {
      from: () => ({
        where: () => ({ limit: jest.fn().mockResolvedValue([{ userId }]) })
      })
    };
    const transaction = { insert: jest.fn(), select: jest.fn() };
    const messageInsert = {
      returning: jest.fn().mockResolvedValue([{ id: 'message-1' }]),
      values: jest.fn().mockReturnThis()
    };
    const notificationInsert = { values: jest.fn().mockResolvedValue() };
    transaction.insert.mockReturnValueOnce(messageInsert).mockReturnValueOnce(notificationInsert);
    transaction.select.mockReturnValue({
      from: () => ({ where: jest.fn().mockResolvedValue([{ userId: recipientId }]) })
    });
    mockDb.select.mockReturnValue(memberSelect);
    mockDb.transaction.mockImplementation((callback) => callback(transaction));
    const token = app.jwt.sign({ sub: userId });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'POST',
      payload: { message: 'Bravo pour ta sortie !' },
      url: `/messages/conversations/${conversationId}/messages`
    });

    expect(response.statusCode).toBe(201);
    expect(notificationInsert.values).toHaveBeenCalledWith([
      { messageId: 'message-1', userId: recipientId }
    ]);
  });

  test('marks the notifications of an opened conversation as read', async () => {
    const memberSelect = {
      from: () => ({
        where: () => ({ limit: jest.fn().mockResolvedValue([{ userId }]) })
      })
    };
    const update = { set: jest.fn().mockReturnThis(), where: jest.fn().mockResolvedValue() };
    mockDb.select.mockReturnValue(memberSelect);
    mockDb.update.mockReturnValue(update);
    const token = app.jwt.sign({ sub: userId });

    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      url: `/messages/conversations/${conversationId}/notifications/read`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toEqual({ read: true });
    expect(update.set).toHaveBeenCalledWith({ readAt: expect.any(Date) });
  });
});
