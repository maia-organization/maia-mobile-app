const { eq } = require('drizzle-orm');

const { db } = require('../db');
const { cycles, users } = require('../db/schema');
const { buildProfilePayload, isValidProfile } = require('../utils/profile');
const { errorResponse, successResponse } = require('../utils/response');

const selectUserProfile = {
  birthdate: users.birthdate,
  cycleLength: users.cycleLength,
  cycleStartDate: users.cycleStartDate,
  email: users.email,
  goal: users.goal,
  height: users.height,
  id: users.id,
  level: users.level,
  name: users.name,
  weight: users.weight
};

module.exports = async function userRoutes(app) {
  app.get('/me', { preHandler: app.authenticate }, async (request, reply) => {
    const [profile] = await db
      .select(selectUserProfile)
      .from(users)
      .where(eq(users.id, request.user.sub))
      .limit(1);

    if (!profile) {
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisateur introuvable.'));
    }

    return successResponse({ user: profile });
  });

  app.put('/me', { preHandler: app.authenticate }, async (request, reply) => {
    const payload = buildProfilePayload(request.body);

    if (!isValidProfile(payload)) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'Vérifie les champs profil et cycle.'));
    }

    const updatedUser = await db.transaction(async (transaction) => {
      const [user] = await transaction
        .update(users)
        .set({
          birthdate: payload.birthdate,
          cycleLength: payload.cycleLength,
          cycleStartDate: payload.cycleStartDate,
          goal: payload.goal,
          height: payload.height,
          level: payload.level,
          weight: payload.weight
        })
        .where(eq(users.id, request.user.sub))
        .returning(selectUserProfile);

      if (!user) return null;

      await transaction
        .update(cycles)
        .set({
          cycleLength: payload.cycleLength,
          cycleStartDate: payload.cycleStartDate,
          lastUpdated: new Date()
        })
        .where(eq(cycles.userId, request.user.sub));

      return user;
    });

    if (!updatedUser) {
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisateur introuvable.'));
    }

    return successResponse({ user: updatedUser });
  });
};
