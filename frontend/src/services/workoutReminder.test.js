jest.mock('react-native', () => ({ Platform: { OS: 'ios' } }));

jest.mock('expo-notifications', () => ({
  SchedulableTriggerInputTypes: { DAILY: 'daily' },
  cancelScheduledNotificationAsync: jest.fn(),
  getDevicePushTokenAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn()
}));

import * as Notifications from 'expo-notifications';

import { getNativePushDevice, syncWorkoutReminder } from './workoutReminder';

describe('workout reminders', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    Notifications.getAllScheduledNotificationsAsync.mockResolvedValue([]);
  });

  it('schedules the daily reminder with the current workout and deep link', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: true });

    await syncWorkoutReminder({
      settings: { enabled: true, preferred_time: 7, workout_notifications: true },
      workout: { duration: 30, title: 'Course progressive' }
    });

    expect(Notifications.scheduleNotificationAsync).toHaveBeenCalledWith({
      content: {
        body: '30 minutes de course progressive aujourd’hui.',
        data: { kind: 'workout-reminder', url: 'maia://workout-today' },
        title: 'Entraînement du jour'
      },
      trigger: { hour: 7, minute: 0, repeats: true, type: 'daily' }
    });
  });

  it('cancels its existing reminders when workout notifications are disabled', async () => {
    Notifications.getAllScheduledNotificationsAsync.mockResolvedValue([
      { content: { data: { kind: 'workout-reminder' } }, identifier: 'workout-1' }
    ]);

    await syncWorkoutReminder({
      settings: { enabled: false, preferred_time: 18, workout_notifications: true },
      workout: null
    });

    expect(Notifications.cancelScheduledNotificationAsync).toHaveBeenCalledWith('workout-1');
    expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
  });

  it('returns the native token after notification permission is granted', async () => {
    Notifications.getPermissionsAsync.mockResolvedValue({ granted: true });
    Notifications.getDevicePushTokenAsync.mockResolvedValue({ data: 'fcm-device-token' });

    await expect(getNativePushDevice()).resolves.toEqual({
      platform: 'ios',
      token: 'fcm-device-token'
    });
  });
});
