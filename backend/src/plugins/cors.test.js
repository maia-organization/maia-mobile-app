const fastify = require('fastify');

const corsPlugin = require('./cors');

describe('CORS plugin', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    await app.register(corsPlugin);
    app.post('/invalid-request', (_, reply) => reply.status(400).send({ success: false }));
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  test('authorizes the local Expo web preview', async () => {
    const origin = 'http://localhost:8081';
    const response = await app.inject({
      headers: {
        'access-control-request-method': 'POST',
        origin
      },
      method: 'OPTIONS',
      url: '/auth/register'
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
  });

  test.each(['PUT', 'DELETE'])('authorizes %s requests used by the API', async (method) => {
    const response = await app.inject({
      headers: {
        'access-control-request-method': method,
        origin: 'http://localhost:8082'
      },
      method: 'OPTIONS',
      url: '/users/me'
    });

    expect(response.statusCode).toBe(204);
    expect(response.headers['access-control-allow-methods']).toContain(method);
  });

  test('keeps CORS headers on an error response', async () => {
    const origin = 'http://localhost:8082';
    const response = await app.inject({
      headers: { origin },
      method: 'POST',
      url: '/invalid-request'
    });

    expect(response.statusCode).toBe(400);
    expect(response.headers['access-control-allow-origin']).toBe(origin);
  });
});
