const { eq } = require('drizzle-orm');

const { db } = require('../db');
const { notificationSettings, users } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');

const settingFields = {
  cycleNotifications: notificationSettings.cycleNotifications,
  preferredTime: notificationSettings.preferredTime,
  socialNotifications: notificationSettings.socialNotifications,
  workoutNotifications: notificationSettings.workoutNotifications
};

function buildSettings(user, settings) {
  return {
    cycle_notifications: settings.cycleNotifications,
    enabled: user.notificationEnabled,
    preferred_time: settings.preferredTime,
    social_notifications: settings.socialNotifications,
    workout_notifications: settings.workoutNotifications
  };
}

function buildPayload(body = {}) {
  return {
    cycleNotifications: body.cycle_notifications,
    enabled: body.enabled,
    socialNotifications: body.social_notifications,
    workoutNotifications: body.workout_notifications
  };
}

function isValidPayload(payload) {
  return Object.values(payload).every((value) => typeof value === 'boolean');
}

module.exports = async function notificationRoutes(app) {
  app.get('/settings', { preHandler: app.authenticate }, async (request, reply) => {
    const [user] = await db
      .select({ notificationEnabled: users.notificationEnabled })
      .from(users)
      .where(eq(users.id, request.user.sub))
      .limit(1);
    const [settings] = await db
      .select(settingFields)
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, request.user.sub))
      .limit(1);

    if (!user || !settings) {
      return reply
        .status(404)
        .send(errorResponse('NOTIFICATION_SETTINGS_NOT_FOUND', 'Préférences introuvables.'));
    }

    return successResponse({ settings: buildSettings(user, settings) });
  });

  app.put('/settings', { preHandler: app.authenticate }, async (request, reply) => {
    const payload = buildPayload(request.body);

    if (!isValidPayload(payload)) {
      return reply
        .status(400)
        .send(
          errorResponse('VALIDATION_ERROR', 'Les préférences de notifications sont invalides.')
        );
    }

    const result = await db.transaction(async (transaction) => {
      const [user] = await transaction
        .update(users)
        .set({ notificationEnabled: payload.enabled })
        .where(eq(users.id, request.user.sub))
        .returning({ notificationEnabled: users.notificationEnabled });

      if (!user) return null;

      const [settings] = await transaction
        .insert(notificationSettings)
        .values({
          cycleNotifications: payload.cycleNotifications,
          socialNotifications: payload.socialNotifications,
          userId: request.user.sub,
          workoutNotifications: payload.workoutNotifications
        })
        .onConflictDoUpdate({
          set: {
            cycleNotifications: payload.cycleNotifications,
            socialNotifications: payload.socialNotifications,
            workoutNotifications: payload.workoutNotifications
          },
          target: notificationSettings.userId
        })
        .returning(settingFields);

      return { settings, user };
    });

    if (!result) {
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisateur introuvable.'));
    }

    return successResponse({ settings: buildSettings(result.user, result.settings) });
  });
};
