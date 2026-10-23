const { env } = require('../config/env');
const { sendPasswordResetEmail } = require('./passwordResetEmail');

describe('sendPasswordResetEmail', () => {
  const originalConfig = {
    PASSWORD_RESET_URL: env.PASSWORD_RESET_URL,
    RESET_EMAIL_FROM: env.RESET_EMAIL_FROM,
    RESEND_API_KEY: env.RESEND_API_KEY
  };

  beforeEach(() => {
    env.PASSWORD_RESET_URL = 'https://preview.maia.test/reset-password';
    env.RESET_EMAIL_FROM = 'hello@maia.test';
    env.RESEND_API_KEY = 'resend-key';
    global.fetch = jest.fn();
  });

  afterAll(() => {
    Object.assign(env, originalConfig);
  });

  test('envoie le lien de réinitialisation avec le jeton', async () => {
    global.fetch.mockResolvedValueOnce({ ok: true });

    await sendPasswordResetEmail({ email: 'runner@example.com', token: 'signed-token' });

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        body: expect.stringContaining(
          'https://preview.maia.test/reset-password?token=signed-token'
        ),
        headers: {
          Authorization: 'Bearer resend-key',
          'Content-Type': 'application/json'
        },
        method: 'POST'
      })
    );
  });

  test('échoue lorsque la configuration d’envoi est absente', async () => {
    env.RESEND_API_KEY = '';

    await expect(
      sendPasswordResetEmail({ email: 'runner@example.com', token: 'signed-token' })
    ).rejects.toThrow('Password reset email is not configured.');

    expect(global.fetch).not.toHaveBeenCalled();
  });

  test('échoue lorsque le fournisseur e-mail refuse la demande', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false });

    await expect(
      sendPasswordResetEmail({ email: 'runner@example.com', token: 'signed-token' })
    ).rejects.toThrow('Password reset email could not be sent.');
  });
});
