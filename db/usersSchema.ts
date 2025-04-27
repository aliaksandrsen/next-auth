import {
  pgTable,
  text,
  timestamp,
  varchar,
  integer,
  boolean,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  email: varchar({ length: 255 }).notNull().unique(),
  password: text('password').notNull(),
  createdAt: timestamp('created_at').defaultNow(),
  twoFactorAuthSecret: text('2fa_secret'),
  twoFactorAuthActivated: boolean('2fa_activated').default(false),
});
