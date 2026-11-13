const { eq } = require('drizzle-orm');
const { db } = require('../db');
const { blockedUsers, communityPosts, contentReports, users } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');
const UUID = /^[0-9a-f-]{36}$/i;

async function exists(table, id) {
  const [entity] = await db.select({ id: table.id }).from(table).where(eq(table.id, id)).limit(1);
  return Boolean(entity);
}

module.exports = async function moderationRoutes(app) {
  app.post('/reports', { preHandler: app.authenticate }, async (request, reply) => {
    const { post_id: postId, reason } = request.body || {};
    if (
      !UUID.test(postId) ||
      typeof reason !== 'string' ||
      !reason.trim() ||
      reason.trim().length > 255
    )
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Signalement invalide.'));
    if (!(await exists(communityPosts, postId)))
      return reply.status(404).send(errorResponse('POST_NOT_FOUND', 'Publication introuvable.'));
    await db
      .insert(contentReports)
      .values({ postId, reason: reason.trim(), reporterId: request.user.sub });
    return reply.status(201).send(successResponse({ reported: true }));
  });
  app.post('/blocks/:id', { preHandler: app.authenticate }, async (request, reply) => {
    if (!UUID.test(request.params.id) || request.params.id === request.user.sub)
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Utilisatrice invalide.'));
    if (!(await exists(users, request.params.id)))
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisatrice introuvable.'));
    await db
      .insert(blockedUsers)
      .values({ blockedId: request.params.id, blockerId: request.user.sub })
      .onConflictDoNothing();
    return successResponse({ blocked: true });
  });
};
