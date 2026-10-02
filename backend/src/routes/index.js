const { successResponse } = require('../utils/response');
const authRoutes = require('./auth');
const cycleRoutes = require('./cycle');
const notificationRoutes = require('./notifications');
const sessionRoutes = require('./sessions');
const statsRoutes = require('./stats');
const userRoutes = require('./users');
const workoutRoutes = require('./workouts');

module.exports = async function routes(app) {
  app.register(authRoutes, { prefix: '/auth' });
  app.register(cycleRoutes, { prefix: '/cycle' });
  app.register(notificationRoutes, { prefix: '/notifications' });
  app.register(sessionRoutes, { prefix: '/sessions' });
  app.register(statsRoutes, { prefix: '/stats' });
  app.register(userRoutes, { prefix: '/users' });
  app.register(workoutRoutes, { prefix: '/workouts' });

  app.get('/', async () => successResponse({ message: 'Maia Backend API' }));
  app.get('/health', async () => successResponse({ status: 'ok' }));
};
