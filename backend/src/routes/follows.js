const { and, eq } = require('drizzle-orm');
const { db } = require('../db');
const { userFollows, users } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');
const UUID = /^[0-9a-f-]{36}$/i;
module.exports = async function followRoutes(app) {
  app.get('/', { preHandler: app.authenticate }, async (request) => {
    const follows = await db
      .select({ id: users.id, name: users.name })
      .from(userFollows)
      .innerJoin(users, eq(userFollows.followedId, users.id))
      .where(eq(userFollows.followerId, request.user.sub));
    return successResponse({ follows });
  });
  app.post('/:id', { preHandler: app.authenticate }, async (request, reply) => {
    if (!UUID.test(request.params.id) || request.params.id === request.user.sub)
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Utilisatrice invalide.'));
    await db
      .insert(userFollows)
      .values({ followerId: request.user.sub, followedId: request.params.id })
      .onConflictDoNothing();
    return successResponse({ following: true });
  });
  app.delete('/:id', { preHandler: app.authenticate }, async (request) => {
    await db
      .delete(userFollows)
      .where(
        and(
          eq(userFollows.followerId, request.user.sub),
          eq(userFollows.followedId, request.params.id)
        )
      );
    return successResponse({ following: false });
  });
};
