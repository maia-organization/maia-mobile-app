const { and, desc, eq, gte, lt } = require('drizzle-orm');

const { db } = require('../db');
const { sessionFeedback, sessions, users, workoutRecommendations } = require('../db/schema');
const { getCycleView } = require('../services/cycle');
const {
  getDayRange,
  getPreSessionEncouragement,
  getWorkoutRecommendation
} = require('../services/workouts');
const { errorResponse, successResponse } = require('../utils/response');

async function hasCompletedSession(userId, date) {
  const { end, start } = getDayRange(date);
  const [session] = await db
    .select({ id: sessions.id })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.status, 'completed'),
        gte(sessions.startTime, start),
        lt(sessions.startTime, end)
      )
    )
    .limit(1);

  return Boolean(session);
}

async function getTodayRecommendation(userId) {
  const [profile] = await db
    .select({
      cycleLength: users.cycleLength,
      cycleStartDate: users.cycleStartDate,
      goal: users.goal,
      level: users.level
    })
    .from(users)
    .where(eq(users.id, userId))
    .limit(1);

  if (!profile) return null;

  const cycleView = getCycleView(profile.cycleStartDate, profile.cycleLength);
  const [feedback] = await db
    .select({
      energy: sessionFeedback.energy,
      fatigue: sessionFeedback.fatigue,
      motivation: sessionFeedback.motivation,
      pain: sessionFeedback.pain
    })
    .from(sessionFeedback)
    .innerJoin(sessions, eq(sessionFeedback.sessionId, sessions.id))
    .where(and(eq(sessions.userId, userId), eq(sessions.status, 'completed')))
    .orderBy(desc(sessionFeedback.updatedAt))
    .limit(1);

  const [lastManualAdaptation] = await db
    .select({ intensity: workoutRecommendations.intensity, type: workoutRecommendations.type })
    .from(workoutRecommendations)
    .where(
      and(
        eq(workoutRecommendations.userId, userId),
        eq(workoutRecommendations.manuallyAdapted, true)
      )
    )
    .orderBy(desc(workoutRecommendations.recommendationDate))
    .limit(1);

  const recommendation = getWorkoutRecommendation({
    cycleView,
    feedback,
    lastManualAdaptation,
    ...profile
  });
  await db
    .insert(workoutRecommendations)
    .values({
      adaptation: recommendation.adaptation,
      duration: recommendation.duration,
      intensity: recommendation.intensity,
      phase: recommendation.phase,
      recommendationDate: recommendation.date,
      title: recommendation.title,
      type: recommendation.type,
      userId
    })
    .onConflictDoNothing();

  const [storedRecommendation] = await db
    .select({
      adaptation: workoutRecommendations.adaptation,
      date: workoutRecommendations.recommendationDate,
      duration: workoutRecommendations.duration,
      intensity: workoutRecommendations.intensity,
      manuallyAdapted: workoutRecommendations.manuallyAdapted,
      phase: workoutRecommendations.phase,
      title: workoutRecommendations.title,
      type: workoutRecommendations.type
    })
    .from(workoutRecommendations)
    .where(
      and(
        eq(workoutRecommendations.userId, userId),
        eq(workoutRecommendations.recommendationDate, recommendation.date)
      )
    )
    .limit(1);

  return { cycleView, feedback, recommendation, storedRecommendation };
}

function workoutTitle(type, intensity) {
  if (type === 'walk') return 'Marche adaptée';
  return intensity === 'high'
    ? 'Séance dynamique'
    : intensity === 'low'
      ? 'Footing récupération'
      : 'Course adaptée';
}

module.exports = async function workoutRoutes(app) {
  app.get('/today', { preHandler: app.authenticate }, async (request, reply) => {
    const today = await getTodayRecommendation(request.user.sub);
    if (!today) {
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisateur introuvable.'));
    }

    return successResponse({
      ...today.storedRecommendation,
      completed: await hasCompletedSession(request.user.sub, today.recommendation.date),
      encouragement: getPreSessionEncouragement(today)
    });
  });

  app.put(
    '/today',
    {
      preHandler: app.authenticate,
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['intensity', 'type'],
          properties: {
            intensity: { enum: ['low', 'moderate', 'progressive', 'high'] },
            type: { enum: ['run', 'walk'] }
          }
        }
      }
    },
    async (request, reply) => {
      const today = await getTodayRecommendation(request.user.sub);
      if (!today) {
        return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisateur introuvable.'));
      }

      const [workout] = await db
        .update(workoutRecommendations)
        .set({
          adaptation:
            'Modifiée selon ton choix. Tes prochaines recommandations en tiendront compte.',
          intensity: request.body.intensity,
          manuallyAdapted: true,
          title: workoutTitle(request.body.type, request.body.intensity),
          type: request.body.type
        })
        .where(
          and(
            eq(workoutRecommendations.userId, request.user.sub),
            eq(workoutRecommendations.recommendationDate, today.recommendation.date)
          )
        )
        .returning({
          adaptation: workoutRecommendations.adaptation,
          date: workoutRecommendations.recommendationDate,
          duration: workoutRecommendations.duration,
          intensity: workoutRecommendations.intensity,
          manuallyAdapted: workoutRecommendations.manuallyAdapted,
          phase: workoutRecommendations.phase,
          title: workoutRecommendations.title,
          type: workoutRecommendations.type
        });

      return successResponse(workout);
    }
  );
};
