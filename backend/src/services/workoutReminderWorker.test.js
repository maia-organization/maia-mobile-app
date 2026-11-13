const mockDb = { select: jest.fn() };
const mockSendWorkoutReminder = jest.fn();

jest.mock('../db', () => ({ db: mockDb }));
jest.mock('./firebase', () => ({ sendWorkoutReminder: mockSendWorkoutReminder }));
jest.mock('../config/env', () => ({ env: { REMINDER_TIME_ZONE: 'Europe/Paris' } }));

const { getReminderDateTime, sendDueWorkoutReminders } = require('./workoutReminderWorker');

function recipientsQuery(rows) {
  const query = {
    innerJoin: jest.fn(),
    leftJoin: jest.fn(),
    where: jest.fn().mockResolvedValue(rows)
  };
  query.innerJoin.mockReturnValue(query);
  query.leftJoin.mockReturnValue(query);
  return { from: jest.fn(() => query) };
}

describe('workout reminder worker', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('uses the configured Paris hour for a reminder run', () => {
    expect(getReminderDateTime(new Date('2026-11-13T17:15:00.000Z'))).toEqual({
      date: '2026-11-13',
      hour: 18
    });
  });

  test('sends due device reminders and falls back when no workout is stored', async () => {
    mockDb.select.mockReturnValue(
      recipientsQuery([
        { duration: 30, title: 'Course progressive', token: 'token-with-workout' },
        { duration: null, title: null, token: 'token-without-workout' }
      ])
    );
    mockSendWorkoutReminder.mockResolvedValue({ sent: true });

    await expect(sendDueWorkoutReminders(new Date('2026-11-13T17:15:00.000Z'))).resolves.toEqual({
      attempted: 2,
      failed: 0,
      sent: 2
    });
    expect(mockSendWorkoutReminder).toHaveBeenNthCalledWith(1, 'token-with-workout', {
      duration: 30,
      title: 'Course progressive'
    });
    expect(mockSendWorkoutReminder).toHaveBeenNthCalledWith(2, 'token-without-workout', null);
  });
});
