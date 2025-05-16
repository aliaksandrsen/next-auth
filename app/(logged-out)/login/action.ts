'use server';

import { signIn } from '@/auth';
import { db } from '@/db/drizzle';
import { users } from '@/db/usersSchema';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { compare } from 'bcryptjs';

export const loginWithCredentials = async ({
  email,
  password,
  token,
}: {
  email: string;
  password: string;
  token?: string;
}) => {
  const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(5),
  });

  const loginValidation = loginSchema.safeParse({
    email,
    password,
  });

  if (!loginValidation.success) {
    return {
      error: loginValidation.error.issues[0]?.message ?? 'An error occurred',
    };
  }

  try {
    await signIn('credentials', {
      email,
      password,
      token,
      redirect: false,
    });
  } catch {
    return {
      error: 'Incorrect email or password',
    };
  }
};

export const preLoginCheck = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  const [user] = await db.select().from(users).where(eq(users.email, email));

  if (!user) {
    return {
      error: 'Incorrect credentials',
    };
  } else {
    const passwordCorrect = await compare(password, user.password);
    if (!passwordCorrect) {
      return {
        error: 'Incorrect credentials',
      };
    }
  }

  return {
    twoFactorAuthActivated: user.twoFactorAuthActivated,
  };
};
