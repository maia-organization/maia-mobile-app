const { eq } = require('drizzle-orm');
const { db } = require('../db');
const { privacySettings, users } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');

const fields = {
  defaultRunVisibility: privacySettings.defaultRunVisibility,
  profileVisibility: privacySettings.profileVisibility,
  showCycle: privacySettings.showCycle,
  showStats: privacySettings.showStats
};
const validVisibility = new Set(['public', 'followers', 'private']);
const payloadFor = (body = {}) => ({
  defaultRunVisibility: body.default_run_visibility,
  profileVisibility: body.profile_visibility,
  showCycle: body.show_cycle,
  showStats: body.show_stats
});
const responseFor = (settings) => ({
  default_run_visibility: settings.defaultRunVisibility,
  profile_visibility: settings.profileVisibility,
  show_cycle: settings.showCycle,
  show_stats: settings.showStats
});
const valid = (payload) =>
  validVisibility.has(payload.profileVisibility) &&
  validVisibility.has(payload.defaultRunVisibility) &&
  typeof payload.showCycle === 'boolean' &&
  typeof payload.showStats === 'boolean';

module.exports = async function privacyRoutes(app) {
  app.get('/settings', { preHandler: app.authenticate }, async (request, reply) => {
    const [settings] = await db
      .select(fields)
      .from(privacySettings)
      .where(eq(privacySettings.userId, request.user.sub))
      .limit(1);
    if (!settings)
      return reply
        .status(404)
        .send(
          errorResponse(
            'PRIVACY_SETTINGS_NOT_FOUND',
            'Préférences de confidentialité introuvables.'
          )
        );
    return successResponse({ settings: responseFor(settings) });
  });
  app.put('/settings', { preHandler: app.authenticate }, async (request, reply) => {
    const payload = payloadFor(request.body);
    if (!valid(payload))
      return reply
        .status(400)
        .send(
          errorResponse('VALIDATION_ERROR', 'Les préférences de confidentialité sont invalides.')
        );
    const [user] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.id, request.user.sub))
      .limit(1);
    if (!user)
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisateur introuvable.'));
    const [settings] = await db
      .insert(privacySettings)
      .values({ ...payload, userId: request.user.sub })
      .onConflictDoUpdate({ target: privacySettings.userId, set: payload })
      .returning(fields);
    return successResponse({ settings: responseFor(settings) });
  });
};
