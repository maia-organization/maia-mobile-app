const { and, desc, eq, sql } = require('drizzle-orm');
const { db } = require('../db');
const { communityPosts, postComments, postLikes, sessions, users } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const validPost = (body) =>
  UUID.test(body?.session_id) &&
  ['public', 'private'].includes(body?.visibility) &&
  (!body.message || (typeof body.message === 'string' && body.message.trim().length <= 500));

async function postExists(postId) {
  const [post] = await db
    .select({ id: communityPosts.id })
    .from(communityPosts)
    .where(eq(communityPosts.id, postId))
    .limit(1);
  return Boolean(post);
}

module.exports = async function communityRoutes(app) {
  app.get('/feed', { preHandler: app.authenticate }, async () => {
    const posts = await db
      .select({
        id: communityPosts.id,
        author_name: users.name,
        message: communityPosts.message,
        visibility: communityPosts.visibility,
        distance: sessions.distance,
        duration: sessions.duration,
        average_pace: sessions.averagePace,
        likes_count: sql`(select count(*) from post_likes where post_id = ${communityPosts.id})`,
        comments_count: sql`(select count(*) from post_comments where post_id = ${communityPosts.id})`
      })
      .from(communityPosts)
      .innerJoin(users, eq(communityPosts.userId, users.id))
      .innerJoin(sessions, eq(communityPosts.sessionId, sessions.id))
      .where(eq(communityPosts.visibility, 'public'))
      .orderBy(desc(communityPosts.createdAt));
    return successResponse({ posts });
  });

  app.post('/posts', { preHandler: app.authenticate }, async (request, reply) => {
    if (!validPost(request.body))
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'La publication est invalide.'));
    const [session] = await db
      .select({ id: sessions.id })
      .from(sessions)
      .where(
        and(
          eq(sessions.id, request.body.session_id),
          eq(sessions.userId, request.user.sub),
          eq(sessions.status, 'completed')
        )
      )
      .limit(1);
    if (!session)
      return reply
        .status(404)
        .send(errorResponse('SESSION_NOT_FOUND', 'Séance terminée introuvable.'));
    const [post] = await db
      .insert(communityPosts)
      .values({
        message: request.body.message?.trim() || null,
        sessionId: session.id,
        userId: request.user.sub,
        visibility: request.body.visibility
      })
      .returning();
    return reply.status(201).send(successResponse({ post }));
  });

  app.post('/posts/:id/likes', { preHandler: app.authenticate }, async (request, reply) => {
    if (!UUID.test(request.params.id))
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Publication invalide.'));
    if (!(await postExists(request.params.id)))
      return reply.status(404).send(errorResponse('POST_NOT_FOUND', 'Publication introuvable.'));
    await db
      .insert(postLikes)
      .values({ postId: request.params.id, userId: request.user.sub })
      .onConflictDoNothing();
    return successResponse({ liked: true });
  });

  app.post('/posts/:id/comments', { preHandler: app.authenticate }, async (request, reply) => {
    if (
      !UUID.test(request.params.id) ||
      typeof request.body?.message !== 'string' ||
      !request.body.message.trim() ||
      request.body.message.trim().length > 500
    )
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Commentaire invalide.'));
    if (!(await postExists(request.params.id)))
      return reply.status(404).send(errorResponse('POST_NOT_FOUND', 'Publication introuvable.'));
    const [comment] = await db
      .insert(postComments)
      .values({
        message: request.body.message.trim(),
        postId: request.params.id,
        userId: request.user.sub
      })
      .returning();
    return reply.status(201).send(successResponse({ comment }));
  });
};
