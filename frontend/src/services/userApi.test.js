import { deleteAccount } from './userApi';

jest.mock('./authStorage', () => ({ getAuthToken: jest.fn().mockResolvedValue('token-test') }));

describe('userApi', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('supprime le compte authentifié sans envoyer de corps JSON', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        data: { message: 'Compte supprimé.' },
        success: true
      }),
      ok: true
    });

    await expect(deleteAccount()).resolves.toEqual({ message: 'Compte supprimé.' });
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringMatching(/\/users\/me$/),
      expect.objectContaining({
        headers: { Authorization: 'Bearer token-test' },
        method: 'DELETE'
      })
    );
  });
});
