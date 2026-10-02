const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const { eq } = require('drizzle-orm');

const { buildApp } = require('../src/app');
const { db, pool } = require('../src/db');
const {
  cycles,
  notificationSettings,
  sessions,
  users,
  workoutRecommendations
} = require('../src/db/schema');

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
    assert.equal(workoutResponse.json().data.completed, false);

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    await db.insert(sessions).values({
      distance: 3,
      duration: 1200,
      endTime: new Date(yesterday.getTime() + 1200 * 1000),
      startTime: yesterday,
      status: 'completed',
      userId: user.id
    });
    const workoutAfterPastSessionResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/workouts/today'
    });
    assert.equal(
      workoutAfterPastSessionResponse.json().data.completed,
      false,
      'A session completed on another day marked the daily workout as completed.'
    );

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

    const stoppedSessionCompleteResponse = await app.inject({
      headers: authorization,
      method: 'PUT',
      url: `/sessions/${sessionId}/complete`
    });
    assert.equal(
      stoppedSessionCompleteResponse.statusCode,
      200,
      stoppedSessionCompleteResponse.body
    );
    assert.deepEqual(
      stoppedSessionCompleteResponse.json().data.session,
      sessionStopResponse.json().data.session,
      'Validating a stopped session changed its final statistics.'
    );

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
    assert.deepEqual(repeatedWorkoutResponse.json().data, {
      ...workoutResponse.json().data,
      completed: true
    });

    const recommendations = await db
      .select({ id: workoutRecommendations.id })
      .from(workoutRecommendations)
      .where(eq(workoutRecommendations.userId, user.id));
    assert.equal(recommendations.length, 1);

    const untrackedSessionStartResponse = await app.inject({
      headers: authorization,
      method: 'POST',
      url: '/sessions/start'
    });
    assert.equal(untrackedSessionStartResponse.statusCode, 201, untrackedSessionStartResponse.body);
    const untrackedSessionId = untrackedSessionStartResponse.json().data.session_id;

    const untrackedSessionCompleteResponse = await app.inject({
      headers: authorization,
      method: 'PUT',
      url: `/sessions/${untrackedSessionId}/complete`
    });
    assert.equal(
      untrackedSessionCompleteResponse.statusCode,
      200,
      untrackedSessionCompleteResponse.body
    );
    assert.equal(untrackedSessionCompleteResponse.json().data.session.status, 'completed');
    assert.equal(untrackedSessionCompleteResponse.json().data.session.distance, 0);
    assert.ok(untrackedSessionCompleteResponse.json().data.session.end_time);

    const unknownSessionCompleteResponse = await app.inject({
      headers: authorization,
      method: 'PUT',
      url: `/sessions/${randomUUID()}/complete`
    });
    assert.equal(
      unknownSessionCompleteResponse.statusCode,
      404,
      unknownSessionCompleteResponse.body
    );

    const historyResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/sessions?limit=10&offset=0'
    });
    assert.equal(historyResponse.statusCode, 200, historyResponse.body);
    const history = historyResponse.json().data.sessions;
    assert.equal(history.length, 3);
    assert.equal(history[0].id, untrackedSessionId);
    assert.ok(history.every((session) => session.status === 'completed'));

    const statsResponse = await app.inject({
      headers: authorization,
      method: 'GET',
      url: '/stats/me'
    });
    assert.equal(statsResponse.statusCode, 200, statsResponse.body);
    assert.equal(statsResponse.json().data.total_sessions, 3);
    assert.ok(statsResponse.json().data.total_distance > 3.9);

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
