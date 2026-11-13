const { pool } = require('../src/db');
const { sendDueWorkoutReminders } = require('../src/services/workoutReminderWorker');

async function run() {
  try {
    const result = await sendDueWorkoutReminders();
    console.log(
      `Workout reminders: ${result.sent}/${result.attempted} sent, ${result.failed} failed.`
    );
  } catch (error) {
    console.error('Workout reminder delivery failed.', error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
}

void run();
