const { and, desc, eq, gte, lt } = require('drizzle-orm');

const { db } = require('../db');
const { sessionFeedback, sessions, users, workoutRecommendations } = require('../db/schema');
const { getCycleView } = require('../services/cycle');
const { getDayRange, getWorkoutRecommendation } = require('../services/workouts');
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

module.exports = async function workoutRoutes(app) {
  app.get('/today', { preHandler: app.authenticate }, async (request, reply) => {
    const [profile] = await db
      .select({
        cycleLength: users.cycleLength,
        cycleStartDate: users.cycleStartDate,
        goal: users.goal,
        level: users.level
      })
      .from(users)
      .where(eq(users.id, request.user.sub))
      .limit(1);

    if (!profile) {
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisateur introuvable.'));
    }

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
      .where(and(eq(sessions.userId, request.user.sub), eq(sessions.status, 'completed')))
      .orderBy(desc(sessionFeedback.updatedAt))
      .limit(1);

    const recommendation = getWorkoutRecommendation({ cycleView, feedback, ...profile });
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
        userId: request.user.sub
      })
      .onConflictDoNothing();

    const [storedRecommendation] = await db
      .select({
        adaptation: workoutRecommendations.adaptation,
        date: workoutRecommendations.recommendationDate,
        duration: workoutRecommendations.duration,
        intensity: workoutRecommendations.intensity,
        phase: workoutRecommendations.phase,
        title: workoutRecommendations.title,
        type: workoutRecommendations.type
      })
      .from(workoutRecommendations)
      .where(
        and(
          eq(workoutRecommendations.userId, request.user.sub),
          eq(workoutRecommendations.recommendationDate, recommendation.date)
        )
      )
      .limit(1);

    return successResponse({
      ...storedRecommendation,
      completed: await hasCompletedSession(request.user.sub, recommendation.date)
    });
  });
};
