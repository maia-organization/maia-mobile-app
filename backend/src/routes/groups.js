const { and, asc, desc, eq, sql } = require('drizzle-orm');
const { db } = require('../db');
const { runningGroupMembers, runningGroupPosts, runningGroups, users } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');

const UUID = /^[0-9a-f]{8}-[0-9a-f]{3,4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{3,12}$/i;
const validGroup = (body) =>
  ['public', 'private'].includes(body?.visibility) &&
  ['name', 'level', 'objective'].every(
    (key) => typeof body?.[key] === 'string' && body[key].trim()
  );

async function membership(groupId, userId) {
  const [member] = await db
    .select()
    .from(runningGroupMembers)
    .where(and(eq(runningGroupMembers.groupId, groupId), eq(runningGroupMembers.userId, userId)))
    .limit(1);
  return Boolean(member);
}

module.exports = async function groupRoutes(app) {
  app.get('/', { preHandler: app.authenticate }, async () => {
    const groups = await db
      .select({
        id: runningGroups.id,
        name: runningGroups.name,
        level: runningGroups.level,
        objective: runningGroups.objective,
        visibility: runningGroups.visibility,
        members_count: sql`(select count(*) from running_group_members where group_id = ${runningGroups.id})`
      })
      .from(runningGroups)
      .orderBy(desc(runningGroups.createdAt));
    return successResponse({ groups });
  });
  app.post('/', { preHandler: app.authenticate }, async (request, reply) => {
    if (!validGroup(request.body))
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'Les paramètres du groupe sont invalides.'));
    const group = await db.transaction(async (transaction) => {
      const [created] = await transaction
        .insert(runningGroups)
        .values({
          createdBy: request.user.sub,
          level: request.body.level.trim(),
          name: request.body.name.trim(),
          objective: request.body.objective.trim(),
          visibility: request.body.visibility
        })
        .returning();
      await transaction
        .insert(runningGroupMembers)
        .values({ groupId: created.id, userId: request.user.sub });
      return created;
    });
    return reply.status(201).send(successResponse({ group }));
  });
  app.post('/:id/join', { preHandler: app.authenticate }, async (request, reply) => {
    if (!UUID.test(request.params.id))
      return reply.status(400).send(errorResponse('VALIDATION_ERROR', 'Groupe invalide.'));
    const [group] = await db
      .select({ id: runningGroups.id })
      .from(runningGroups)
      .where(eq(runningGroups.id, request.params.id))
      .limit(1);
    if (!group)
      return reply.status(404).send(errorResponse('GROUP_NOT_FOUND', 'Groupe introuvable.'));
    await db
      .insert(runningGroupMembers)
      .values({ groupId: group.id, userId: request.user.sub })
      .onConflictDoNothing();
    return successResponse({ joined: true });
  });
  app.delete('/:id/members/me', { preHandler: app.authenticate }, async (request, reply) => {
    if (!(await membership(request.params.id, request.user.sub)))
      return reply.status(404).send(errorResponse('GROUP_NOT_FOUND', 'Groupe introuvable.'));
    await db
      .delete(runningGroupMembers)
      .where(
        and(
          eq(runningGroupMembers.groupId, request.params.id),
          eq(runningGroupMembers.userId, request.user.sub)
        )
      );
    return successResponse({ left: true });
  });
  app.get('/:id/members', { preHandler: app.authenticate }, async (request, reply) => {
    if (!(await membership(request.params.id, request.user.sub)))
      return reply.status(404).send(errorResponse('GROUP_NOT_FOUND', 'Groupe introuvable.'));
    const members = await db
      .select({ id: users.id, name: users.name })
      .from(runningGroupMembers)
      .innerJoin(users, eq(runningGroupMembers.userId, users.id))
      .where(eq(runningGroupMembers.groupId, request.params.id))
      .orderBy(asc(users.name));
    return successResponse({ members });
  });
  app.get('/:id/feed', { preHandler: app.authenticate }, async (request, reply) => {
    if (!(await membership(request.params.id, request.user.sub)))
      return reply.status(404).send(errorResponse('GROUP_NOT_FOUND', 'Groupe introuvable.'));
    const posts = await db
      .select({
        id: runningGroupPosts.id,
        message: runningGroupPosts.message,
        author_name: users.name
      })
      .from(runningGroupPosts)
      .innerJoin(users, eq(runningGroupPosts.userId, users.id))
      .where(eq(runningGroupPosts.groupId, request.params.id))
      .orderBy(desc(runningGroupPosts.createdAt));
    return successResponse({ posts });
  });
};
