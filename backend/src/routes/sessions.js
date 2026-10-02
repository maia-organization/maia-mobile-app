const { and, desc, eq } = require('drizzle-orm');

const { db } = require('../db');
const { sessionFeedback, sessions } = require('../db/schema');
const { getSessionMetrics, isValidCoordinates } = require('../services/tracking');
const { errorResponse, successResponse } = require('../utils/response');

const sessionFields = {
  average_pace: sessions.averagePace,
  distance: sessions.distance,
  duration: sessions.duration,
  end_time: sessions.endTime,
  id: sessions.id,
  start_time: sessions.startTime,
  status: sessions.status
};
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUniqueViolation(error) {
  return error?.code === '23505' || error?.cause?.code === '23505';
}

function isValidFeedback(feedback) {
  const values = ['energy', 'fatigue', 'motivation', 'pain'].map((key) => feedback?.[key]);
  return (
    values.some((value) => value !== undefined) &&
    values.every(
      (value) => value === undefined || (Number.isInteger(value) && value >= 1 && value <= 5)
    )
  );
}

async function findSession(id, userId) {
  const [session] = await db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, id), eq(sessions.userId, userId)))
    .limit(1);

  return session;
}

async function completeSession(session, coordinates) {
  const endTime = new Date();
  const metrics = getSessionMetrics(session.startTime, endTime, coordinates);
  const [completed] = await db
    .update(sessions)
    .set({ ...metrics, endTime, status: 'completed' })
    .where(and(eq(sessions.id, session.id), eq(sessions.status, 'active')))
    .returning(sessionFields);

  // A concurrent request may have completed the session first: return its stored statistics.
  return completed ?? sessionFieldsFromRecord(await findSession(session.id, session.userId));
}

module.exports = async function sessionRoutes(app) {
  app.post('/start', { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const [session] = await db
        .insert(sessions)
        .values({ startTime: new Date(), userId: request.user.sub })
        .returning({ session_id: sessions.id });

      return reply.status(201).send(successResponse(session));
    } catch (error) {
      if (isUniqueViolation(error)) {
        return reply
          .status(400)
          .send(errorResponse('SESSION_ALREADY_ACTIVE', 'Une séance est déjà en cours.'));
      }

      throw error;
    }
  });

  app.post('/stop', { preHandler: app.authenticate }, async (request, reply) => {
    const { coordinates, session_id: sessionId } = request.body || {};

    if (!UUID_PATTERN.test(sessionId) || !isValidCoordinates(coordinates)) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'Les données de la séance sont invalides.'));
    }

    const session = await findSession(sessionId, request.user.sub);

    if (!session) {
      return reply.status(404).send(errorResponse('SESSION_NOT_FOUND', 'Séance introuvable.'));
    }

    if (session.status === 'completed') {
      return reply
        .status(400)
        .send(errorResponse('SESSION_ALREADY_COMPLETED', 'Cette séance est déjà terminée.'));
    }

    return successResponse({ session: await completeSession(session, coordinates) });
  });

  app.put('/:id/complete', { preHandler: app.authenticate }, async (request, reply) => {
    if (!UUID_PATTERN.test(request.params.id)) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', "L'identifiant de la séance est invalide."));
    }

    const session = await findSession(request.params.id, request.user.sub);

    if (!session) {
      return reply.status(404).send(errorResponse('SESSION_NOT_FOUND', 'Séance introuvable.'));
    }

    if (session.status === 'completed') {
      return successResponse({ session: sessionFieldsFromRecord(session) });
    }

    return successResponse({ session: await completeSession(session, []) });
  });

  app.put('/:id/feedback', { preHandler: app.authenticate }, async (request, reply) => {
    if (!UUID_PATTERN.test(request.params.id) || !isValidFeedback(request.body)) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'Le ressenti doit contenir des notes de 1 à 5.'));
    }

    const session = await findSession(request.params.id, request.user.sub);

    if (!session) {
      return reply.status(404).send(errorResponse('SESSION_NOT_FOUND', 'Séance introuvable.'));
    }

    if (session.status !== 'completed') {
      return reply
        .status(400)
        .send(
          errorResponse('SESSION_NOT_COMPLETED', "Termine la séance avant d'ajouter ton ressenti.")
        );
    }

    const values = {
      energy: request.body.energy,
      fatigue: request.body.fatigue,
      motivation: request.body.motivation,
      pain: request.body.pain,
      sessionId: session.id,
      updatedAt: new Date()
    };
    const [feedback] = await db
      .insert(sessionFeedback)
      .values(values)
      .onConflictDoUpdate({
        set: values,
        target: sessionFeedback.sessionId
      })
      .returning({
        energy: sessionFeedback.energy,
        fatigue: sessionFeedback.fatigue,
        motivation: sessionFeedback.motivation,
        pain: sessionFeedback.pain,
        session_id: sessionFeedback.sessionId
      });

    return successResponse({ feedback });
  });

  app.get('/', { preHandler: app.authenticate }, async (request, reply) => {
    const limit = request.query?.limit === undefined ? 50 : Number(request.query.limit);
    const offset = request.query?.offset === undefined ? 0 : Number(request.query.offset);

    if (
      !Number.isInteger(limit) ||
      limit < 1 ||
      limit > 50 ||
      !Number.isInteger(offset) ||
      offset < 0
    ) {
      return reply
        .status(400)
        .send(errorResponse('VALIDATION_ERROR', 'La pagination est invalide.'));
    }

    const history = await db
      .select(sessionFields)
      .from(sessions)
      .where(eq(sessions.userId, request.user.sub))
      .orderBy(desc(sessions.startTime))
      .limit(limit)
      .offset(offset);

    return successResponse({ limit, offset, sessions: history });
  });
};

function sessionFieldsFromRecord(session) {
  return {
    average_pace: session.averagePace,
    distance: session.distance,
    duration: session.duration,
    end_time: session.endTime,
    id: session.id,
    start_time: session.startTime,
    status: session.status
  };
}
