const { and, eq } = require('drizzle-orm');

const { env } = require('../config/env');
const { db } = require('../db');
const {
  notificationSettings,
  pushDevices,
  users,
  workoutRecommendations
} = require('../db/schema');
const { sendWorkoutReminder } = require('./firebase');

function getReminderDateTime(now = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    hour: '2-digit',
    hourCycle: 'h23',
    month: '2-digit',
    timeZone: env.REMINDER_TIME_ZONE,
    year: 'numeric'
  }).formatToParts(now);
  const values = Object.fromEntries(
    parts.filter(({ type }) => type !== 'literal').map(({ type, value }) => [type, value])
  );

  return {
    date: `${values.year}-${values.month}-${values.day}`,
    hour: Number(values.hour)
  };
}

async function sendDueWorkoutReminders(now) {
  const { date, hour } = getReminderDateTime(now);
  const recipients = await db
    .select({
      duration: workoutRecommendations.duration,
      title: workoutRecommendations.title,
      token: pushDevices.token
    })
    .from(pushDevices)
    .innerJoin(users, eq(pushDevices.userId, users.id))
    .innerJoin(notificationSettings, eq(notificationSettings.userId, users.id))
    .leftJoin(
      workoutRecommendations,
      and(
        eq(workoutRecommendations.userId, users.id),
        eq(workoutRecommendations.recommendationDate, date)
      )
    )
    .where(
      and(
        eq(users.notificationEnabled, true),
        eq(notificationSettings.workoutNotifications, true),
        eq(notificationSettings.preferredTime, hour)
      )
    );

  const results = await Promise.allSettled(
    recipients.map(({ duration, title, token }) =>
      sendWorkoutReminder(token, title ? { duration, title } : null)
    )
  );

  return {
    attempted: recipients.length,
    failed: results.filter(({ status }) => status === 'rejected').length,
    sent: results.filter(({ status, value }) => status === 'fulfilled' && value.sent).length
  };
}

module.exports = { getReminderDateTime, sendDueWorkoutReminders };
