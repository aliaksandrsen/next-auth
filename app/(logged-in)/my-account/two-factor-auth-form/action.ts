'use server';

import { auth } from '@/auth';
import { db } from '@/db/drizzle';
import { users } from '@/db/usersSchema';
import { eq } from 'drizzle-orm';
import { authenticator } from 'otplib';

export const get2faSecret = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized',
    };
  }

  const [user] = await db
    .select({ twoFactorSecret: users.twoFactorAuthSecret })
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)));

  if (!user) {
    return {
      error: 'User not found',
    };
  }
  let twoFactorSecret = user.twoFactorSecret;

  if (!user.twoFactorSecret) {
    twoFactorSecret = authenticator.generateSecret();

    await db
      .update(users)
      .set({ twoFactorAuthSecret: twoFactorSecret })
      .where(eq(users.id, parseInt(session.user.id)));
  }

  return {
    twoFactorSecret: authenticator.keyuri(
      session.user.email as string,
      'MyApp',
      twoFactorSecret as string
    ),
  };
};

export const activate2fa = async (token: string) => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized',
    };
  }

  const [user] = await db
    .select({ twoFactorSecret: users.twoFactorAuthSecret })
    .from(users)
    .where(eq(users.id, parseInt(session.user.id)));

  if (!user) {
    return {
      error: 'User not found',
    };
  }

  if (user.twoFactorSecret) {
    const tokenValid = authenticator.check(token, user.twoFactorSecret);

    if (!tokenValid) {
      return {
        error: 'Invalid OTP',
      };
    }

    await db
      .update(users)
      .set({ twoFactorAuthActivated: true })
      .where(eq(users.id, parseInt(session.user.id)));
  }
};

export const disable2fa = async () => {
  const session = await auth();

  if (!session?.user?.id) {
    return {
      error: 'Unauthorized',
    };
  }

  await db
    .update(users)
    .set({
      twoFactorAuthActivated: false,
    })
    .where(eq(users.id, parseInt(session.user.id)));
};
