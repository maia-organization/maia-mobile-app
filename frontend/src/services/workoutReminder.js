import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

const REMINDER_KIND = 'workout-reminder';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true
  })
});

export async function requestNotificationPermission() {
  if (Platform.OS === 'web') return false;

  const current = await Notifications.getPermissionsAsync();
  const permission = current.granted ? current : await Notifications.requestPermissionsAsync();
  return permission.granted;
}

async function clearWorkoutReminders() {
  const scheduled = await Notifications.getAllScheduledNotificationsAsync();
  const reminders = scheduled.filter(
    ({ content }) => content.data?.kind === REMINDER_KIND
  );

  await Promise.all(reminders.map(({ identifier }) => Notifications.cancelScheduledNotificationAsync(identifier)));
}

function reminderBody(workout) {
  if (!workout) return "C'est le moment de prendre soin de toi avec ta séance du jour.";
  return `${workout.duration} minutes de ${workout.title.toLowerCase()} aujourd’hui.`;
}

export async function syncWorkoutReminder({ settings, workout }) {
  if (Platform.OS === 'web') return { scheduled: false, unavailable: true };

  await clearWorkoutReminders();

  if (!settings.enabled || !settings.workout_notifications) return { scheduled: false };
  if (!(await requestNotificationPermission())) return { permissionDenied: true, scheduled: false };

  await Notifications.scheduleNotificationAsync({
    content: {
      body: reminderBody(workout),
      data: { kind: REMINDER_KIND, url: 'maia://workout-today' },
      title: 'Entraînement du jour'
    },
    trigger: {
      hour: settings.preferred_time,
      minute: 0,
      repeats: true,
      type: Notifications.SchedulableTriggerInputTypes.DAILY
    }
  });

  return { scheduled: true };
}
