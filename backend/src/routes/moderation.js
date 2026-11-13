const { db } = require('../db');
const { blockedUsers, contentReports } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');
const UUID = /^[0-9a-f-]{36}$/i;
module.exports = async function moderationRoutes(app) {
  app.post('/reports', { preHandler: app.authenticate }, async (request, reply) => {
    const { post_id: postId, reason } = request.body || {};
    if (!UUID.test(postId) || typeof reason !== 'string' || !reason.trim())
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Signalement invalide.'));
    await db
      .insert(contentReports)
      .values({ postId, reason: reason.trim(), reporterId: request.user.sub });
    return reply.status(201).send(successResponse({ reported: true }));
  });
  app.post('/blocks/:id', { preHandler: app.authenticate }, async (request, reply) => {
    if (!UUID.test(request.params.id) || request.params.id === request.user.sub)
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Utilisatrice invalide.'));
    await db
      .insert(blockedUsers)
      .values({ blockedId: request.params.id, blockerId: request.user.sub })
      .onConflictDoNothing();
    return successResponse({ blocked: true });
  });
};
