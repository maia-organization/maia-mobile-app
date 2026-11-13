const {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
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

const communityPosts = pgTable('community_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  sessionId: uuid('session_id')
    .notNull()
    .unique()
    .references(() => sessions.id, { onDelete: 'cascade' }),
  message: varchar('message', { length: 500 }),
  visibility: varchar('visibility', { length: 16 }).default('public').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

const postLikes = pgTable(
  'post_likes',
  {
    postId: uuid('post_id')
      .notNull()
      .references(() => communityPosts.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [primaryKey({ columns: [table.postId, table.userId] })]
);

const postComments = pgTable('post_comments', {
  id: uuid('id').defaultRandom().primaryKey(),
  postId: uuid('post_id')
    .notNull()
    .references(() => communityPosts.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  message: varchar('message', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

const conversations = pgTable('conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

const conversationMembers = pgTable(
  'conversation_members',
  {
    conversationId: uuid('conversation_id')
      .notNull()
      .references(() => conversations.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [primaryKey({ columns: [table.conversationId, table.userId] })]
);

const conversationMessages = pgTable('conversation_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  conversationId: uuid('conversation_id')
    .notNull()
    .references(() => conversations.id, { onDelete: 'cascade' }),
  senderId: uuid('sender_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  message: varchar('message', { length: 1000 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

const messageNotifications = pgTable('message_notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  messageId: uuid('message_id')
    .notNull()
    .references(() => conversationMessages.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  readAt: timestamp('read_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

const runningGroups = pgTable('running_groups', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  level: varchar('level', { length: 64 }).notNull(),
  objective: varchar('objective', { length: 255 }).notNull(),
  visibility: varchar('visibility', { length: 16 }).default('public').notNull(),
  createdBy: uuid('created_by')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

const runningGroupMembers = pgTable(
  'running_group_members',
  {
    groupId: uuid('group_id')
      .notNull()
      .references(() => runningGroups.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    joinedAt: timestamp('joined_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [primaryKey({ columns: [table.groupId, table.userId] })]
);

const runningGroupPosts = pgTable('running_group_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  groupId: uuid('group_id')
    .notNull()
    .references(() => runningGroups.id, { onDelete: 'cascade' }),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  message: varchar('message', { length: 500 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});
const userFollows = pgTable(
  'user_follows',
  {
    followerId: uuid('follower_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    followedId: uuid('followed_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [primaryKey({ columns: [table.followerId, table.followedId] })]
);
const blockedUsers = pgTable(
  'blocked_users',
  {
    blockerId: uuid('blocker_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    blockedId: uuid('blocked_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
  },
  (table) => [primaryKey({ columns: [table.blockerId, table.blockedId] })]
);
const contentReports = pgTable('content_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  reporterId: uuid('reporter_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  postId: uuid('post_id')
    .notNull()
    .references(() => communityPosts.id, { onDelete: 'cascade' }),
  reason: varchar('reason', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull()
});

module.exports = {
  cycles,
  communityPosts,
  blockedUsers,
  contentReports,
  conversationMembers,
  conversationMessages,
  conversations,
  messageNotifications,
  runningGroupMembers,
  runningGroupPosts,
  runningGroups,
  notificationSettings,
  postComments,
  postLikes,
  privacySettings,
  sessionFeedback,
  sessions,
  sessionStatus,
  users,
  userFollows,
  plannedWorkouts,
  workoutRecommendations
};
