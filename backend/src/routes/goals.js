const { and, eq, gte, sql } = require('drizzle-orm');

const { db } = require('../db');
const { sessions, weeklyGoals } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');

const TARGET_TYPES = new Set(['sessions', 'distance']);

function weekStart(date = new Date()) {
  const start = new Date(date);
  const day = start.getDay() || 7;
  start.setDate(start.getDate() - day + 1);
  start.setHours(0, 0, 0, 0);
  return start;
}

function buildGoal(goal, progress) {
  if (!goal) return null;

  const currentValue =
    goal.targetType === 'sessions'
      ? Number(progress.completedSessions)
      : Number(progress.totalDistance);

  return {
    current_value: Math.round(currentValue * 1000) / 1000,
    reminder_enabled: goal.reminderEnabled,
    target_type: goal.targetType,
    target_value: goal.targetValue,
    week_start: weekStart().toISOString()
  };
}

function buildPayload(body = {}) {
  return {
    reminderEnabled: body.reminder_enabled,
    targetType: body.target_type,
    targetValue: body.target_value
  };
}

function isValidPayload(payload) {
  const max = payload.targetType === 'sessions' ? 14 : 250;
  return (
    TARGET_TYPES.has(payload.targetType) &&
    typeof payload.reminderEnabled === 'boolean' &&
    typeof payload.targetValue === 'number' &&
    Number.isFinite(payload.targetValue) &&
    payload.targetValue > 0 &&
    payload.targetValue <= max &&
    (payload.targetType !== 'sessions' || Number.isInteger(payload.targetValue))
  );
}

const goalFields = {
  reminderEnabled: weeklyGoals.reminderEnabled,
  targetType: weeklyGoals.targetType,
  targetValue: weeklyGoals.targetValue
};

async function getProgress(userId) {
  const [progress] = await db
    .select({
      completedSessions: sql`count(*)`,
      totalDistance: sql`coalesce(sum(${sessions.distance}), 0)`
    })
    .from(sessions)
    .where(
      and(
        eq(sessions.userId, userId),
        eq(sessions.status, 'completed'),
        gte(sessions.startTime, weekStart())
      )
    );

  return progress;
}

module.exports = async function goalRoutes(app) {
  app.get('/weekly', { preHandler: app.authenticate }, async (request) => {
    const [goal] = await db
      .select(goalFields)
      .from(weeklyGoals)
      .where(eq(weeklyGoals.userId, request.user.sub))
      .limit(1);

    return successResponse({ goal: buildGoal(goal, await getProgress(request.user.sub)) });
  });

  app.put('/weekly', { preHandler: app.authenticate }, async (request, reply) => {
    const payload = buildPayload(request.body);
    if (!isValidPayload(payload)) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', "L'objectif hebdomadaire est invalide."));
    }

    const [goal] = await db
      .insert(weeklyGoals)
      .values({ ...payload, userId: request.user.sub, updatedAt: new Date() })
      .onConflictDoUpdate({
        set: { ...payload, updatedAt: new Date() },
        target: weeklyGoals.userId
      })
      .returning(goalFields);

    return successResponse({ goal: buildGoal(goal, await getProgress(request.user.sub)) });
  });
};

module.exports.weekStart = weekStart;
