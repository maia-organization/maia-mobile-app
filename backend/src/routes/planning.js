const { and, eq, gte, lt } = require('drizzle-orm');

const { db } = require('../db');
const { plannedWorkouts, users } = require('../db/schema');
const { getCycleView } = require('../services/cycle');
const { getWorkoutRecommendation } = require('../services/workouts');
const { errorResponse, successResponse } = require('../utils/response');
const { isValidIsoDate } = require('../utils/validation');

const DAY_IN_MS = 24 * 60 * 60 * 1000;
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const choices = {
  gentle: { duration: -10, intensity: 'low', title: 'Séance douce' },
  progressive: { duration: 0, title: 'Course progressive' },
  dynamic: { duration: 10, intensity: 'high', title: 'Séance dynamique' }
};

function dateAtUtc(value) {
  return new Date(`${value}T00:00:00.000Z`);
}

function formatDate(date) {
  return date.toISOString().slice(0, 10);
}

function mondayFor(value) {
  const date = dateAtUtc(value);
  const offset = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - offset);
  return date;
}

function isTodayOrLater(value) {
  return dateAtUtc(value) >= dateAtUtc(formatDate(new Date()));
}

function plannedFields(record, profile) {
  const cycle = getCycleView(
    profile.cycleStartDate,
    profile.cycleLength,
    dateAtUtc(record.plannedDate)
  );
  return {
    adaptation: record.adaptation,
    date: record.plannedDate,
    duration: record.duration,
    id: record.id,
    intensity: record.intensity,
    phase: cycle.current_phase,
    phase_label: cycle.current_phase_label,
    title: record.title,
    type: record.type
  };
}

async function findProfile(userId) {
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
  return profile;
}

function recommendedWorkout(profile, plannedDate, choice) {
  const cycleView = getCycleView(
    profile.cycleStartDate,
    profile.cycleLength,
    dateAtUtc(plannedDate)
  );
  const recommendation = getWorkoutRecommendation({ cycleView, feedback: null, ...profile });
  const selected = choices[choice];
  return {
    adaptation: `Adaptée à la ${cycleView.current_phase_label.toLowerCase()}.`,
    duration: Math.max(15, recommendation.duration + selected.duration),
    intensity: selected.intensity || recommendation.intensity,
    phase: cycleView.current_phase,
    title: selected.title,
    type: choice
  };
}

module.exports = async function planningRoutes(app) {
  app.get('/', { preHandler: app.authenticate }, async (request, reply) => {
    const requestedDate = request.query?.week_start || formatDate(new Date());
    if (!isValidIsoDate(requestedDate, { allowFuture: true })) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'La semaine demandée est invalide.'));
    }
    const profile = await findProfile(request.user.sub);
    if (!profile)
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisateur introuvable.'));

    const weekStart = mondayFor(requestedDate);
    const weekEnd = new Date(weekStart.getTime() + 7 * DAY_IN_MS);
    const records = await db
      .select()
      .from(plannedWorkouts)
      .where(
        and(
          eq(plannedWorkouts.userId, request.user.sub),
          gte(plannedWorkouts.plannedDate, formatDate(weekStart)),
          lt(plannedWorkouts.plannedDate, formatDate(weekEnd))
        )
      );

    return successResponse({
      sessions: records.map((record) => plannedFields(record, profile)),
      week_start: formatDate(weekStart)
    });
  });

  app.post('/', { preHandler: app.authenticate }, async (request, reply) => {
    const plannedDate = request.body?.planned_date;
    const choice = request.body?.type;
    if (
      !isValidIsoDate(plannedDate, { allowFuture: true }) ||
      !isTodayOrLater(plannedDate) ||
      !choices[choice]
    ) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'Choisis une séance et une date à venir.'));
    }
    const profile = await findProfile(request.user.sub);
    if (!profile)
      return reply.status(404).send(errorResponse('USER_NOT_FOUND', 'Utilisateur introuvable.'));

    const workout = recommendedWorkout(profile, plannedDate, choice);
    try {
      const [record] = await db
        .insert(plannedWorkouts)
        .values({ ...workout, plannedDate, userId: request.user.sub })
        .returning();
      return reply.status(201).send(successResponse(plannedFields(record, profile)));
    } catch (error) {
      if (error?.code === '23505') {
        return reply
          .status(409)
          .send(errorResponse('PLANNING_CONFLICT', 'Une séance est déjà prévue ce jour.'));
      }
      throw error;
    }
  });

  app.put('/:id', { preHandler: app.authenticate }, async (request, reply) => {
    const plannedDate = request.body?.planned_date;
    if (
      !UUID_PATTERN.test(request.params.id) ||
      !isValidIsoDate(plannedDate, { allowFuture: true }) ||
      !isTodayOrLater(plannedDate)
    ) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'La séance ou la date est invalide.'));
    }
    try {
      const [record] = await db
        .update(plannedWorkouts)
        .set({ plannedDate })
        .where(
          and(
            eq(plannedWorkouts.id, request.params.id),
            eq(plannedWorkouts.userId, request.user.sub)
          )
        )
        .returning();
      if (!record)
        return reply
          .status(404)
          .send(errorResponse('PLANNED_WORKOUT_NOT_FOUND', 'Séance planifiée introuvable.'));
      const profile = await findProfile(request.user.sub);
      return successResponse(plannedFields(record, profile));
    } catch (error) {
      if (error?.code === '23505')
        return reply
          .status(409)
          .send(errorResponse('PLANNING_CONFLICT', 'Une séance est déjà prévue ce jour.'));
      throw error;
    }
  });

  app.delete('/:id', { preHandler: app.authenticate }, async (request, reply) => {
    if (!UUID_PATTERN.test(request.params.id))
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'Identifiant de séance invalide.'));
    const [record] = await db
      .delete(plannedWorkouts)
      .where(
        and(eq(plannedWorkouts.id, request.params.id), eq(plannedWorkouts.userId, request.user.sub))
      )
      .returning({ id: plannedWorkouts.id });
    if (!record)
      return reply
        .status(404)
        .send(errorResponse('PLANNED_WORKOUT_NOT_FOUND', 'Séance planifiée introuvable.'));
    return reply.status(204).send();
  });
};
