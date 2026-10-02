const mockDb = {
  select: jest.fn(),
  update: jest.fn()
};

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';
const sessionId = '5b0f6f43-8b4e-4c39-9a3e-2f7d4c1a9e11';

const storedCompletedSession = {
  averagePace: 6,
  distance: 5,
  duration: 1800,
  endTime: new Date('2026-10-02T10:30:00.000Z'),
  id: sessionId,
  startTime: new Date('2026-10-02T10:00:00.000Z'),
  status: 'completed',
  userId
};

const storedCompletedSessionResponse = {
  average_pace: 6,
  distance: 5,
  duration: 1800,
  end_time: '2026-10-02T10:30:00.000Z',
  id: sessionId,
  start_time: '2026-10-02T10:00:00.000Z',
  status: 'completed'
};

function activeSession(startTime) {
  return {
    averagePace: null,
    distance: null,
    duration: null,
    endTime: null,
    id: sessionId,
    startTime,
    status: 'active',
    userId
  };
}

function sessionLookup(result) {
  return {
    from: () => ({
      where: () => ({ limit: jest.fn().mockResolvedValue(result) })
    })
  };
}

function mockSessionUpdate(result) {
  const set = jest.fn(() => ({
    where: () => ({ returning: jest.fn().mockResolvedValue(result) })
  }));
  mockDb.update.mockReturnValueOnce({ set });

  return set;
}

describe('session completion route', () => {
  let app;
  let authorization;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
    authorization = `Bearer ${app.jwt.sign({ sub: userId })}`;
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.resetAllMocks();
  });

  function completeSession(id = sessionId, headers = { authorization }) {
    return app.inject({ headers, method: 'PUT', url: `/sessions/${id}/complete` });
  }

  test('requires a JWT to complete a session', async () => {
    const response = await completeSession(sessionId, {});

    expect(response.statusCode).toBe(401);
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  test('rejects a malformed session identifier before querying the database', async () => {
    const response = await completeSession('not-a-session-id');

    expect(response.statusCode).toBe(400);
    expect(response.json().error.code).toBe('VALIDATION_ERROR');
    expect(mockDb.select).not.toHaveBeenCalled();
  });

  test('returns 404 when the session does not belong to the user', async () => {
    mockDb.select.mockReturnValueOnce(sessionLookup([]));

    const response = await completeSession();

    expect(response.statusCode).toBe(404);
    expect(response.json().error.code).toBe('SESSION_NOT_FOUND');
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  test('completes an active session with its final statistics', async () => {
    const startTime = new Date(Date.now() - 30 * 60 * 1000);
    mockDb.select.mockReturnValueOnce(sessionLookup([activeSession(startTime)]));
    const set = mockSessionUpdate([
      {
        average_pace: null,
        distance: 0,
        duration: 1800,
        end_time: new Date(startTime.getTime() + 1800 * 1000),
        id: sessionId,
        start_time: startTime,
        status: 'completed'
      }
    ]);

    const response = await completeSession();

    expect(response.statusCode).toBe(200);
    expect(set).toHaveBeenCalledWith({
      averagePace: null,
      distance: 0,
      duration: expect.any(Number),
      endTime: expect.any(Date),
      status: 'completed'
    });
    const { duration } = set.mock.calls[0][0];
    expect(duration).toBeGreaterThanOrEqual(1800);
    expect(duration).toBeLessThan(1810);
    expect(response.json().data.session).toMatchObject({
      distance: 0,
      duration: 1800,
      id: sessionId,
      status: 'completed'
    });
  });

  test('returns the stored statistics of a completed session without recomputing them', async () => {
    mockDb.select.mockReturnValueOnce(sessionLookup([storedCompletedSession]));

    const response = await completeSession();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: { session: storedCompletedSessionResponse },
      success: true
    });
    expect(mockDb.update).not.toHaveBeenCalled();
  });

  test('returns the stored statistics when the session is completed concurrently', async () => {
    mockDb.select
      .mockReturnValueOnce(sessionLookup([activeSession(new Date('2026-10-02T10:00:00.000Z'))]))
      .mockReturnValueOnce(sessionLookup([storedCompletedSession]));
    mockSessionUpdate([]);

    const response = await completeSession();

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      data: { session: storedCompletedSessionResponse },
      success: true
    });
  });
});
