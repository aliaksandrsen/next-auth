'use server';

import { auth } from '@/auth';
import { db } from '@/db/drizzle';
import { users } from '@/db/usersSchema';
import { randomBytes } from 'crypto';
import { eq } from 'drizzle-orm';

export const passwordReset = async (emailAddress: string) => {
  const session = await auth();

  if (!!session?.user?.id) {
    return {
      error: 'You are already logged in.',
    };
  }

  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, emailAddress));

  if (!user) {
    return;
  }

  const passwordResetToken = randomBytes(32).toString('hex');
  console.log(' passwordReset passwordResetToken:', passwordResetToken);
};
