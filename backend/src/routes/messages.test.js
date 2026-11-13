const mockDb = { select: jest.fn(), transaction: jest.fn() };
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
});
