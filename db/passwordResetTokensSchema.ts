import { integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core';
import { users } from './usersSchema';

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
  userId: integer('user_id')
    .references(() => users.id, {
      onDelete: 'cascade',
    })
    .unique(),
  token: text('token'),
  tokenExpiry: timestamp('token_expiry'),
});
