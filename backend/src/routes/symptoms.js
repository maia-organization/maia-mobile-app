const { desc, eq } = require('drizzle-orm');

const { db } = require('../db');
const { symptomEntries } = require('../db/schema');
const { errorResponse, successResponse } = require('../utils/response');

const allowedSymptoms = ['pain', 'fatigue', 'low_mood'];

function today() {
  return new Date().toISOString().slice(0, 10);
}

function serialize(entry) {
  return { recorded_on: entry.recordedOn, symptoms: entry.symptoms };
}

module.exports = async function symptomRoutes(app) {
  app.get('/', { preHandler: app.authenticate }, async (request) => {
    const entries = await db
      .select({ recordedOn: symptomEntries.recordedOn, symptoms: symptomEntries.symptoms })
      .from(symptomEntries)
      .where(eq(symptomEntries.userId, request.user.sub))
      .orderBy(desc(symptomEntries.recordedOn))
      .limit(30);

    return successResponse({ entries: entries.map(serialize) });
  });

  app.put(
    '/today',
    {
      preHandler: app.authenticate,
      schema: {
        body: {
          type: 'object',
          additionalProperties: false,
          required: ['symptoms'],
          properties: {
            symptoms: {
              type: 'array',
              items: { enum: allowedSymptoms },
              maxItems: allowedSymptoms.length,
              uniqueItems: true
            }
          }
        }
      }
    },
    async (request, reply) => {
      const symptoms = request.body.symptoms;
      if (!symptoms.length) {
        return reply
          .status(400)
          .send(errorResponse('VALIDATION_ERROR', 'Sélectionne au moins un symptôme.'));
      }

      const [entry] = await db
        .insert(symptomEntries)
        .values({ recordedOn: today(), symptoms, userId: request.user.sub })
        .onConflictDoUpdate({
          set: { symptoms, updatedAt: new Date() },
          target: [symptomEntries.userId, symptomEntries.recordedOn]
        })
        .returning({ recordedOn: symptomEntries.recordedOn, symptoms: symptomEntries.symptoms });

      return successResponse(serialize(entry));
    }
  );
};
