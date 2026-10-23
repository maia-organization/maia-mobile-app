const cors = require('@fastify/cors');
const fastifyPlugin = require('fastify-plugin');

const { env } = require('../config/env');

const localOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/;

function isAllowedOrigin(origin) {
  const configuredOrigins = env.CORS_ORIGIN.split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  if (configuredOrigins.includes(origin)) return true;
  if (env.NODE_ENV !== 'production' && configuredOrigins.includes('*')) return true;

  return env.NODE_ENV !== 'production' && localOriginPattern.test(origin);
}

module.exports = fastifyPlugin(async function corsPlugin(app) {
  await app.register(cors, {
    methods: ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'],
    origin(origin, callback) {
      if (!origin || isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origin not allowed by CORS'));
    }
  });

  app.addHook('onSend', (request, reply, payload, done) => {
    const origin = request.headers.origin;

    if (origin && isAllowedOrigin(origin)) {
      reply.header('Access-Control-Allow-Origin', origin);
    }

    done(null, payload);
  });
});
