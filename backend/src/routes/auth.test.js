const mockDb = {
  select: jest.fn(),
  update: jest.fn()
};
const mockSendPasswordResetEmail = jest.fn();

jest.mock('../db', () => ({ db: mockDb }));
jest.mock('../services/passwordResetEmail', () => ({
  sendPasswordResetEmail: mockSendPasswordResetEmail
}));

const { buildApp } = require('../app');

const user = {
  email: 'runner@example.com',
  id: '892ed587-cd78-46d4-8810-8f85e84c6310',
  passwordHash: '$2b$10$oldPasswordHash'
};

function selectUser(value) {
  mockDb.select.mockReturnValue({
    from: () => ({ where: () => ({ limit: jest.fn().mockResolvedValue(value) }) })
  });
}

describe('password reset routes', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('sends a one-hour reset token for an existing account', async () => {
    selectUser([user]);
    mockSendPasswordResetEmail.mockResolvedValueOnce();

    const response = await app.inject({
      method: 'POST',
      payload: { email: ' RUNNER@EXAMPLE.COM ' },
      url: '/auth/password-reset/request'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ success: true });
    expect(mockSendPasswordResetEmail).toHaveBeenCalledWith({
      email: user.email,
      token: expect.any(String)
    });
    expect(app.jwt.verify(mockSendPasswordResetEmail.mock.calls[0][0].token)).toMatchObject({
      purpose: 'password-reset',
      sub: user.id
    });
  });

  test('does not reveal whether an account exists', async () => {
    selectUser([]);

    const response = await app.inject({
      method: 'POST',
      payload: { email: 'missing@example.com' },
      url: '/auth/password-reset/request'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.message).toMatch(/si un compte correspond/i);
    expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
  });

  test('updates the password for a valid unused reset token', async () => {
    selectUser([user]);
    const update = { set: jest.fn().mockReturnThis(), where: jest.fn().mockResolvedValue() };
    mockDb.update.mockReturnValue(update);
    mockSendPasswordResetEmail.mockResolvedValueOnce();
    await app.inject({
      method: 'POST',
      payload: { email: user.email },
      url: '/auth/password-reset/request'
    });
    const token = mockSendPasswordResetEmail.mock.calls[0][0].token;
    selectUser([user]);

    const response = await app.inject({
      method: 'POST',
      payload: { password: 'NouvelleCourse2026!', token },
      url: '/auth/password-reset/confirm'
    });

    expect(response.statusCode).toBe(200);
    expect(update.set).toHaveBeenCalledWith({ passwordHash: expect.any(String) });
  });

  test('rejects an expired or invalid reset token', async () => {
    const response = await app.inject({
      method: 'POST',
      payload: { password: 'NouvelleCourse2026!', token: 'not-a-token' },
      url: '/auth/password-reset/confirm'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: { code: 'INVALID_RESET_TOKEN' } });
  });
});
