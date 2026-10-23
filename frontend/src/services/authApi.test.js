import { loginUser, requestPasswordReset } from './authApi';

describe('authApi', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.restoreAllMocks();
  });

  it('transforme une erreur réseau en message exploitable dans l’interface', async () => {
    global.fetch = jest.fn().mockRejectedValueOnce(new Error('Network unavailable'));

    await expect(loginUser({ email: 'test@email.com', password: 'secret' })).rejects.toThrow(
      "Impossible de joindre l'API Maïa. Vérifie que la preview est bien lancée."
    );
  });

  it('propage le message d’erreur envoyé par le serveur', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({
        error: { message: 'Identifiants invalides.' },
        success: false
      }),
      ok: false
    });

    await expect(loginUser({ email: 'test@email.com', password: 'secret' })).rejects.toThrow(
      'Identifiants invalides.'
    );
  });

  it('signale une réponse serveur non exploitable', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
      ok: false
    });

    await expect(loginUser({ email: 'test@email.com', password: 'secret' })).rejects.toThrow(
      "L'API Maïa a renvoyé une réponse inattendue. Réessaie dans un instant."
    );
  });

  it('appelle le point de terminaison de demande de réinitialisation', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      json: jest.fn().mockResolvedValueOnce({ data: {}, success: true }),
      ok: true
    });

    await requestPasswordReset({ email: 'test@email.com' });

    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('/auth/password-reset/request'),
      expect.objectContaining({ method: 'POST' })
    );
  });
});
