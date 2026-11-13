const { successResponse } = require('../utils/response');
const authRoutes = require('./auth');
const communityRoutes = require('./community');
const messageRoutes = require('./messages');
const groupRoutes = require('./groups');
const followRoutes = require('./follows');
const moderationRoutes = require('./moderation');
const cycleRoutes = require('./cycle');
const notificationRoutes = require('./notifications');
const planningRoutes = require('./planning');
const privacyRoutes = require('./privacy');
const sessionRoutes = require('./sessions');
const statsRoutes = require('./stats');
const userRoutes = require('./users');
const workoutRoutes = require('./workouts');

module.exports = async function routes(app) {
  app.register(authRoutes, { prefix: '/auth' });
  app.register(communityRoutes, { prefix: '/community' });
  app.register(messageRoutes, { prefix: '/messages' });
  app.register(groupRoutes, { prefix: '/groups' });
  app.register(followRoutes, { prefix: '/follows' });
  app.register(moderationRoutes, { prefix: '/moderation' });
  app.register(cycleRoutes, { prefix: '/cycle' });
  app.register(notificationRoutes, { prefix: '/notifications' });
  app.register(planningRoutes, { prefix: '/planning' });
  app.register(privacyRoutes, { prefix: '/privacy' });
  app.register(sessionRoutes, { prefix: '/sessions' });
  app.register(statsRoutes, { prefix: '/stats' });
  app.register(userRoutes, { prefix: '/users' });
  app.register(workoutRoutes, { prefix: '/workouts' });

  app.get('/', async () => successResponse({ message: 'Maia Backend API' }));
  app.get('/health', async () => successResponse({ status: 'ok' }));
};
