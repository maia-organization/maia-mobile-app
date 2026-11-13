const { cert, getApps, initializeApp } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');

const { env } = require('../config/env');

function getFirebaseMessaging() {
  if (!env.FIREBASE_SERVICE_ACCOUNT_PATH) return null;

  const app =
    getApps()[0] ||
    initializeApp({
      credential: cert(env.FIREBASE_SERVICE_ACCOUNT_PATH),
      ...(env.FIREBASE_PROJECT_ID ? { projectId: env.FIREBASE_PROJECT_ID } : {})
    });

  return getMessaging(app);
}

async function sendPushNotification({ body, data, title, token }) {
  const messaging = getFirebaseMessaging();
  if (!messaging) return { sent: false, reason: 'not_configured' };

  const messageId = await messaging.send({
    data,
    notification: { body, title },
    token
  });

  return { sent: true, messageId };
}

function workoutReminderBody(workout) {
  if (!workout) return "C'est le moment de prendre soin de toi avec ta séance du jour.";
  return `${workout.duration} minutes de ${workout.title.toLowerCase()} aujourd’hui.`;
}

async function sendWorkoutReminder(token, workout) {
  return sendPushNotification({
    body: workoutReminderBody(workout),
    data: { screen: 'WorkoutToday' },
    title: 'Entraînement du jour',
    token
  });
}

module.exports = {
  getFirebaseMessaging,
  sendPushNotification,
  sendWorkoutReminder,
  workoutReminderBody
};
