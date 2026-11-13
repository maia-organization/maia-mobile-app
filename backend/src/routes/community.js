const { successResponse } = require('../utils/response');

module.exports = async function communityRoutes(app) {
  app.get('/feed', { preHandler: app.authenticate }, async () => {
    // Publications, likes and comments are introduced by US-COMMUNITY-002 and US-COMMUNITY-003.
    // Returning an empty feed keeps the Community tab usable before the first shared run exists.
    return successResponse({ posts: [] });
  });
};
