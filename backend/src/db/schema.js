const {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  real,
  timestamp,
  uniqueIndex,
  uuid,
  varchar
} = require('drizzle-orm/pg-core');
const { sql } = require('drizzle-orm');

const sessionStatus = pgEnum('session_status', ['active', 'completed']);

const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  birthdate: date('birthdate').notNull(),
  weight: real('weight').notNull(),
  height: real('height').notNull(),
  level: varchar('level', { length: 64 }).notNull(),
  goal: varchar('goal', { length: 128 }).notNull(),
  cycleStartDate: date('cycle_start_date').notNull(),
  cycleLength: integer('cycle_length').notNull(),
  refreshToken: varchar('refresh_token', { length: 512 }),
  notificationEnabled: boolean('notification_enabled').default(true).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

const sessions = pgTable(
  'sessions',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    startTime: timestamp('start_time', { withTimezone: true }).notNull(),
    endTime: timestamp('end_time', { withTimezone: true }),
    distance: real('distance'),
    duration: integer('duration'),
    averagePace: real('average_pace'),
    status: sessionStatus('status').default('active').notNull()
  },
  (table) => [
    uniqueIndex('sessions_one_active_per_user')
      .on(table.userId)
      .where(sql`${table.status} = 'active'`)
  ]
);

const sessionFeedback = pgTable('session_feedback', {
  sessionId: uuid('session_id')
    .primaryKey()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  energy: integer('energy'),
  fatigue: integer('fatigue'),
  motivation: integer('motivation'),
  pain: integer('pain'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull()
});

const workoutRecommendations = pgTable(
  'workout_recommendations',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    recommendationDate: date('recommendation_date').notNull(),
    type: varchar('type', { length: 32 }).notNull(),
    title: varchar('title', { length: 128 }).notNull(),
    duration: integer('duration').notNull(),
    intensity: varchar('intensity', { length: 32 }).notNull(),
    phase: varchar('phase', { length: 32 }).notNull(),
    adaptation: varchar('adaptation', { length: 255 }),
    manuallyAdapted: boolean('manually_adapted').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [
    uniqueIndex('workout_recommendations_user_date_unique').on(
      table.userId,
      table.recommendationDate
    )
  ]
);

const plannedWorkouts = pgTable(
  'planned_workouts',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    plannedDate: date('planned_date').notNull(),
    type: varchar('type', { length: 32 }).notNull(),
    title: varchar('title', { length: 128 }).notNull(),
    duration: integer('duration').notNull(),
    intensity: varchar('intensity', { length: 32 }).notNull(),
    phase: varchar('phase', { length: 32 }).notNull(),
    adaptation: varchar('adaptation', { length: 255 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [uniqueIndex('planned_workouts_user_date_unique').on(table.userId, table.plannedDate)]
);

const cycles = pgTable('cycles', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  cycleStartDate: date('cycle_start_date').notNull(),
  cycleLength: integer('cycle_length').notNull(),
  lastUpdated: timestamp('last_updated', { withTimezone: true }).defaultNow().notNull()
});

const notificationSettings = pgTable('notification_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  workoutNotifications: boolean('workout_notifications').default(true).notNull(),
  cycleNotifications: boolean('cycle_notifications').default(true).notNull(),
  socialNotifications: boolean('social_notifications').default(false).notNull(),
  preferredTime: integer('preferred_time').default(18).notNull()
});

const privacySettings = pgTable('privacy_settings', {
  userId: uuid('user_id')
    .primaryKey()
    .references(() => users.id, { onDelete: 'cascade' }),
  profileVisibility: varchar('profile_visibility', { length: 16 }).default('public').notNull(),
  defaultRunVisibility: varchar('default_run_visibility', { length: 16 })
    .default('followers')
    .notNull(),
  showCycle: boolean('show_cycle').default(false).notNull(),
  showStats: boolean('show_stats').default(true).notNull()
});

module.exports = {
  cycles,
  notificationSettings,
  privacySettings,
  sessionFeedback,
  sessions,
  sessionStatus,
  users,
  plannedWorkouts,
  workoutRecommendations
};
