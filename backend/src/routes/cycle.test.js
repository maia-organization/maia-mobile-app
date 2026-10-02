const mockDb = {
  select: jest.fn(),
  transaction: jest.fn()
};

jest.mock('../db', () => ({ db: mockDb }));

const { buildApp } = require('../app');

const userId = '892ed587-cd78-46d4-8810-8f85e84c6310';
const cycle = { cycleLength: 28, cycleStartDate: '2026-09-01' };

function mockCycleLookup(result) {
  mockDb.select.mockReturnValue({
    from: () => ({
      where: () => ({ limit: jest.fn().mockResolvedValue(result) })
    })
  });
}

describe('cycle routes', () => {
  let app;

  beforeAll(async () => {
    app = buildApp({ logger: false });
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('requires a JWT to view the cycle', async () => {
    const response = await app.inject({ method: 'GET', url: '/cycle/view' });

    expect(response.statusCode).toBe(401);
  });

  test('returns the current cycle phase', async () => {
    mockCycleLookup([cycle]);
    const token = app.jwt.sign({ sub: userId });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'GET',
      url: '/cycle/view'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      data: {
        current_phase: expect.any(String),
        cycle_length: 28,
        cycle_start_date: expect.any(String),
        phase_projections: expect.arrayContaining([
          expect.objectContaining({
            end_date: expect.any(String),
            label: 'Phase menstruelle',
            phase: 'menstrual',
            start_date: expect.any(String)
          }),
          expect.objectContaining({ label: 'Phase ovulatoire', phase: 'ovulatory' })
        ])
      },
      success: true
    });
  });

  test('rejects an invalid cycle update before accessing the database', async () => {
    const token = app.jwt.sign({ sub: userId });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload: { cycle_length: 20, cycle_start_date: '2026-09-01' },
      url: '/cycle'
    });

    expect(response.statusCode).toBe(400);
    expect(mockDb.transaction).not.toHaveBeenCalled();
  });

  test('updates the cycle and profile together', async () => {
    const transaction = { update: jest.fn() };
    const cycleUpdate = {
      returning: jest.fn().mockResolvedValue([{ userId }]),
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis()
    };
    const profileUpdate = {
      set: jest.fn().mockReturnThis(),
      where: jest.fn().mockResolvedValue()
    };
    transaction.update.mockReturnValueOnce(cycleUpdate).mockReturnValueOnce(profileUpdate);
    mockDb.transaction.mockImplementation((callback) => callback(transaction));
    const token = app.jwt.sign({ sub: userId });
    const response = await app.inject({
      headers: { authorization: `Bearer ${token}` },
      method: 'PUT',
      payload: { cycle_length: 30, cycle_start_date: '2026-09-01' },
      url: '/cycle'
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({ data: { cycle_length: 30 }, success: true });
    expect(transaction.update).toHaveBeenCalledTimes(2);
    expect(cycleUpdate.set).toHaveBeenCalledWith(
      expect.objectContaining({
        cycleLength: 30,
        cycleStartDate: '2026-09-01',
        lastUpdated: expect.any(Date)
      })
    );
  });
});
