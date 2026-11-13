const { eq } = require('drizzle-orm');

const { db } = require('../db');
const { notificationSettings, pushDevices, users } = require('../db/schema');
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
    preferredTime: body.preferred_time,
    socialNotifications: body.social_notifications,
    workoutNotifications: body.workout_notifications
  };
}

function isValidPayload(payload) {
  return (
    typeof payload.cycleNotifications === 'boolean' &&
    typeof payload.enabled === 'boolean' &&
    Number.isInteger(payload.preferredTime) &&
    payload.preferredTime >= 0 &&
    payload.preferredTime <= 23 &&
    typeof payload.socialNotifications === 'boolean' &&
    typeof payload.workoutNotifications === 'boolean'
  );
}

function isValidDevicePayload(body = {}) {
  return (
    ['android', 'ios'].includes(body.platform) &&
    typeof body.token === 'string' &&
    body.token.trim().length > 0 &&
    body.token.length <= 512
  );
}

module.exports = async function notificationRoutes(app) {
  app.put('/devices', { preHandler: app.authenticate }, async (request, reply) => {
    if (!isValidDevicePayload(request.body)) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', "L'appareil de notification est invalide."));
    }

    await db
      .insert(pushDevices)
      .values({
        platform: request.body.platform,
        token: request.body.token.trim(),
        userId: request.user.sub,
        updatedAt: new Date()
      })
      .onConflictDoUpdate({
        set: {
          platform: request.body.platform,
          updatedAt: new Date(),
          userId: request.user.sub
        },
        target: pushDevices.token
      });

    return successResponse({ registered: true });
  });

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
          preferredTime: payload.preferredTime,
          socialNotifications: payload.socialNotifications,
          userId: request.user.sub,
          workoutNotifications: payload.workoutNotifications
        })
        .onConflictDoUpdate({
          set: {
            cycleNotifications: payload.cycleNotifications,
            preferredTime: payload.preferredTime,
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
