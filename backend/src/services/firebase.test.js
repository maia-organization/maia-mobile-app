const mockCert = jest.fn();
const mockGetApps = jest.fn(() => []);
const mockInitializeApp = jest.fn(() => ({ name: 'maia' }));
const mockSend = jest.fn();
const mockGetMessaging = jest.fn(() => ({ send: mockSend }));

jest.mock('firebase-admin/app', () => ({
  cert: mockCert,
  getApps: mockGetApps,
  initializeApp: mockInitializeApp
}));
jest.mock('firebase-admin/messaging', () => ({ getMessaging: mockGetMessaging }));
jest.mock('../config/env', () => ({
  env: { FIREBASE_PROJECT_ID: 'maia-7a376', FIREBASE_SERVICE_ACCOUNT_PATH: '' }
}));

const { env } = require('../config/env');
const { sendWorkoutReminder, workoutReminderBody } = require('./firebase');

describe('Firebase messaging', () => {
  beforeEach(() => {
    env.FIREBASE_SERVICE_ACCOUNT_PATH = '';
    jest.clearAllMocks();
  });

  test('does not initialize Firebase when no credential path is configured', async () => {
    await expect(sendWorkoutReminder('device-token', null)).resolves.toEqual({
      reason: 'not_configured',
      sent: false
    });
    expect(mockInitializeApp).not.toHaveBeenCalled();
  });

  test('sends a WorkoutToday notification through Firebase', async () => {
    env.FIREBASE_SERVICE_ACCOUNT_PATH = '/run/secrets/firebase-service-account.json';
    mockSend.mockResolvedValue('projects/maia-7a376/messages/123');

    await expect(
      sendWorkoutReminder('device-token', { duration: 30, title: 'Footing récupération' })
    ).resolves.toEqual({ sent: true, messageId: 'projects/maia-7a376/messages/123' });

    expect(mockCert).toHaveBeenCalledWith('/run/secrets/firebase-service-account.json');
    expect(mockSend).toHaveBeenCalledWith({
      data: { screen: 'WorkoutToday' },
      notification: {
        body: '30 minutes de footing récupération aujourd’hui.',
        title: 'Entraînement du jour'
      },
      token: 'device-token'
    });
  });

  test('uses the motivational fallback without a workout', () => {
    expect(workoutReminderBody(null)).toBe(
      "C'est le moment de prendre soin de toi avec ta séance du jour."
    );
  });
});
