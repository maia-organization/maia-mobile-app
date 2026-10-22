const mockDb = { delete: jest.fn(), insert: jest.fn(), select: jest.fn(), update: jest.fn() };

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';
const workoutId = '6a20d397-cd78-46d4-8810-8f85e84c6310';
const profile = {
  cycleLength: 28,
  cycleStartDate: '2026-10-01',
  goal: 'endurance',
  level: 'intermediaire'
};
const record = {
  adaptation: 'Adaptée à la phase folliculaire.',
  duration: 35,
  id: workoutId,
  intensity: 'progressive',
  phase: 'follicular',
  plannedDate: '2099-01-05',
  title: 'Course progressive',
  type: 'progressive'
};

function profileLookup(result = [profile]) {
  return { from: () => ({ where: () => ({ limit: jest.fn().mockResolvedValue(result) }) }) };
}

function recordsLookup(result = [record]) {
  return { from: () => ({ where: jest.fn().mockResolvedValue(result) }) };
}

function request(app, options) {
  return app.inject({
    headers: { authorization: `Bearer ${app.jwt.sign({ sub: userId })}` },
    ...options
  });
}

describe('planning routes', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => jest.resetAllMocks());

  test('requires a JWT to view a weekly planning', async () => {
    const response = await app.inject({ method: 'GET', url: '/planning' });

    expect(response.statusCode).toBe(401);
  });

  test('lists the selected week with a cycle phase recalculated for each session', async () => {
    mockDb.select.mockReturnValueOnce(profileLookup()).mockReturnValueOnce(recordsLookup());

    const response = await request(app, { method: 'GET', url: '/planning?week_start=2099-01-07' });

    expect(response.statusCode).toBe(200);
    expect(response.json().data).toMatchObject({
      sessions: [{ date: '2099-01-05', id: workoutId, phase: expect.any(String) }],
      week_start: '2099-01-05'
    });
  });

  test('rejects an invalid week and returns not found when the profile is absent', async () => {
    const invalidWeek = await request(app, {
      method: 'GET',
      url: '/planning?week_start=not-a-date'
    });
    mockDb.select.mockReturnValueOnce(profileLookup([]));
    const missingProfile = await request(app, {
      method: 'GET',
      url: '/planning?week_start=2099-01-07'
    });

    expect(invalidWeek.statusCode).toBe(400);
    expect(missingProfile.statusCode).toBe(404);
  });

  test('creates a cycle-adapted workout for a valid future date', async () => {
    const returning = jest.fn().mockResolvedValue([record]);
    mockDb.select.mockReturnValueOnce(profileLookup());
    mockDb.insert.mockReturnValue({ values: jest.fn().mockReturnValue({ returning }) });

    const response = await request(app, {
      method: 'POST',
      payload: { planned_date: '2099-01-05', type: 'progressive' },
      url: '/planning'
    });

    expect(response.statusCode).toBe(201);
    expect(response.json().data).toMatchObject({ id: workoutId, type: 'progressive' });
  });

  test('rejects an unknown session choice before accessing the database', async () => {
    const response = await request(app, {
      method: 'POST',
      payload: { planned_date: '2099-01-01', type: 'marathon' },
      url: '/planning'
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({ error: { code: 'VALIDATION_ERROR' }, success: false });
  });

  test('handles an absent profile and a duplicate date when creating a workout', async () => {
    mockDb.select.mockReturnValueOnce(profileLookup([]));
    const missingProfile = await request(app, {
      method: 'POST',
      payload: { planned_date: '2099-01-05', type: 'gentle' },
      url: '/planning'
    });

    mockDb.select.mockReturnValueOnce(profileLookup());
    mockDb.insert.mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest
          .fn()
          .mockRejectedValue(Object.assign(new Error('duplicate'), { code: '23505' }))
      })
    });
    const duplicate = await request(app, {
      method: 'POST',
      payload: { planned_date: '2099-01-05', type: 'gentle' },
      url: '/planning'
    });

    expect(missingProfile.statusCode).toBe(404);
    expect(duplicate.statusCode).toBe(409);
  });

  test('moves a planned workout to another future day', async () => {
    const returning = jest.fn().mockResolvedValue([{ ...record, plannedDate: '2099-01-06' }]);
    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({ where: jest.fn().mockReturnValue({ returning }) })
    });
    mockDb.select.mockReturnValueOnce(profileLookup());

    const response = await request(app, {
      method: 'PUT',
      payload: { planned_date: '2099-01-06' },
      url: `/planning/${workoutId}`
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().data.date).toBe('2099-01-06');
  });

  test('rejects an invalid move and reports a missing planned workout', async () => {
    const invalidMove = await request(app, {
      method: 'PUT',
      payload: { planned_date: '2099-01-06' },
      url: '/planning/not-an-id'
    });
    mockDb.update.mockReturnValue({
      set: jest.fn().mockReturnValue({
        where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([]) })
      })
    });
    const missingWorkout = await request(app, {
      method: 'PUT',
      payload: { planned_date: '2099-01-06' },
      url: `/planning/${workoutId}`
    });

    expect(invalidMove.statusCode).toBe(400);
    expect(missingWorkout.statusCode).toBe(404);
  });

  test('removes only the authenticated user’s planned workout', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: workoutId }]);
    mockDb.delete.mockReturnValue({ where: jest.fn().mockReturnValue({ returning }) });

    const response = await request(app, { method: 'DELETE', url: `/planning/${workoutId}` });

    expect(response.statusCode).toBe(204);
    expect(returning).toHaveBeenCalledTimes(1);
  });

  test('rejects invalid identifiers and reports missing planned workouts when deleting', async () => {
    const invalidId = await request(app, { method: 'DELETE', url: '/planning/not-an-id' });
    mockDb.delete.mockReturnValue({
      where: jest.fn().mockReturnValue({ returning: jest.fn().mockResolvedValue([]) })
    });
    const missingWorkout = await request(app, { method: 'DELETE', url: `/planning/${workoutId}` });

    expect(invalidId.statusCode).toBe(400);
    expect(missingWorkout.statusCode).toBe(404);
  });
});
