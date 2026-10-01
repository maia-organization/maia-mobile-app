const assert = require('node:assert/strict');

const { eq } = require('drizzle-orm');

const { buildApp } = require('../src/app');
const { db, pool } = require('../src/db');
const { cycles, notificationSettings, users, workoutRecommendations } = require('../src/db/schema');

async function run() {
  const app = buildApp();
  const email = `auth-smoke-${Date.now()}@example.com`;
  let createdUserId;

  try {
    const response = await app.inject({
      method: 'POST',
      url: '/auth/register',
      payload: {
        cycle_length: 28,
        cycle_start_date: new Date().toISOString().slice(0, 10),
        email,
        goal: 'regularite',
        level: 'debutante',
        name: 'Test Maïa',
        password: 'Course2026!'
      }
    });

    assert.equal(response.statusCode, 201, response.body);
    const { token } = response.json().data;

    const [user] = await db.select({ id: users.id }).from(users).where(eq(users.email, email));
    assert.ok(user?.id, 'The registration did not create a user.');
    createdUserId = user.id;

    const [cycle] = await db
      .select({ userId: cycles.userId })
      .from(cycles)
      .where(eq(cycles.userId, user.id));
    assert.equal(cycle?.userId, user.id, 'The registration did not create cycle data.');

    const [settings] = await db
      .select({ userId: notificationSettings.userId })
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, user.id));
    assert.equal(
      settings?.userId,
      user.id,
      'The registration did not create notification settings.'
    );

    const authorization = { authorization: `Bearer ${token}` };
    const profileResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/users/me'
    });
    assert.equal(profileResponse.statusCode, 200, profileResponse.body);
    assert.equal(profileResponse.json().data.user.id, user.id);

    const profileUpdateResponse = await app.inject({
      headers: authorization,
      method: 'PUT',
      payload: {
        birthdate: '1994-05-12',
        cycle_length: 30,
        cycle_start_date: '2026-09-01',
        goal: 'endurance',
        height: 168,
        level: 'intermediaire',
        weight: 62
      },
      url: '/users/me'
    });
    assert.equal(profileUpdateResponse.statusCode, 200, profileUpdateResponse.body);
    assert.equal(profileUpdateResponse.json().data.user.goal, 'endurance');
    assert.equal(profileUpdateResponse.json().data.user.cycleLength, 30);

    const updatedProfileResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/users/me'
    });
    assert.equal(updatedProfileResponse.statusCode, 200, updatedProfileResponse.body);
    assert.equal(updatedProfileResponse.json().data.user.weight, 62);
    assert.equal(updatedProfileResponse.json().data.user.level, 'intermediaire');

    const cycleViewResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/cycle/view'
    });
    assert.equal(cycleViewResponse.statusCode, 200, cycleViewResponse.body);
    assert.ok(cycleViewResponse.json().data.current_phase);

    const cycleUpdateResponse = await app.inject({
      headers: authorization,
      method: 'PUT',
      payload: { cycle_length: 30, cycle_start_date: '2026-09-01' },
      url: '/cycle'
    });
    assert.equal(cycleUpdateResponse.statusCode, 200, cycleUpdateResponse.body);
    assert.equal(cycleUpdateResponse.json().data.cycle_length, 30);

    const workoutResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/workouts/today'
    });
    assert.equal(workoutResponse.statusCode, 200, workoutResponse.body);
    assert.equal(workoutResponse.json().data.type, 'run');
    assert.ok(workoutResponse.json().data.duration >= 15);

    const sessionStartResponse = await app.inject({
      headers: authorization,
      method: 'POST',
      url: '/sessions/start'
    });
    assert.equal(sessionStartResponse.statusCode, 201, sessionStartResponse.body);
    const sessionId = sessionStartResponse.json().data.session_id;

    const duplicateStartResponse = await app.inject({
      headers: authorization,
      method: 'POST',
      url: '/sessions/start'
    });
    assert.equal(duplicateStartResponse.statusCode, 400, duplicateStartResponse.body);
    assert.equal(duplicateStartResponse.json().error.code, 'SESSION_ALREADY_ACTIVE');

    const sessionStopResponse = await app.inject({
      headers: authorization,
      method: 'POST',
      payload: {
        coordinates: [
          { lat: 48.8566, lng: 2.3522, timestamp: '2026-09-11T10:00:00.000Z' },
          { lat: 48.8656, lng: 2.3522, timestamp: '2026-09-11T10:06:00.000Z' }
        ],
        session_id: sessionId
      },
      url: '/sessions/stop'
    });
    assert.equal(sessionStopResponse.statusCode, 200, sessionStopResponse.body);
    assert.equal(sessionStopResponse.json().data.session.status, 'completed');
    assert.ok(sessionStopResponse.json().data.session.distance > 0.9);

    const feedbackResponse = await app.inject({
      headers: authorization,
      method: 'PUT',
      payload: { energy: 2, fatigue: 4, motivation: 3, pain: 4 },
      url: `/sessions/${sessionId}/feedback`
    });
    assert.equal(feedbackResponse.statusCode, 200, feedbackResponse.body);
    assert.equal(feedbackResponse.json().data.feedback.pain, 4);

    const repeatedWorkoutResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/workouts/today'
    });
    assert.deepEqual(repeatedWorkoutResponse.json().data, workoutResponse.json().data);

    const recommendations = await db
      .select({ id: workoutRecommendations.id })
      .from(workoutRecommendations)
      .where(eq(workoutRecommendations.userId, user.id));
    assert.equal(recommendations.length, 1);

    const historyResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/sessions?limit=10&offset=0'
    });
    assert.equal(historyResponse.statusCode, 200, historyResponse.body);
    assert.equal(historyResponse.json().data.sessions.length, 1);

    const statsResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/stats/me'
    });
    assert.equal(statsResponse.statusCode, 200, statsResponse.body);
    assert.equal(statsResponse.json().data.total_sessions, 1);
    assert.ok(statsResponse.json().data.total_distance > 0.9);

    process.stdout.write('Backend database smoke test passed.\n');
  } finally {
    if (createdUserId) {
      await db.delete(users).where(eq(users.id, createdUserId));
    }

    await app.close();
    await pool.end();
  }
}

run().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
