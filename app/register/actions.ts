'use server';

import { db } from '@/db/drizzle';
import { passwordMatchSchema } from '@/validation/passwordMatchSchema';
import { z } from 'zod';
import { hash } from 'bcryptjs';
import { users } from '@/db/usersSchema';

export const registerUser = async ({
  email,
  password,
  passwordConfirm,
}: {
  email: string;
  password: string;
  passwordConfirm: string;
}) => {
  try {
    const newUserSchema = z
      .object({
        email: z.string().email(),
      })
      .and(passwordMatchSchema);

    const newUserValues = newUserSchema.safeParse({
      email,
      password,
      passwordConfirm,
    });

    if (!newUserValues.success) {
      return {
        error: newUserValues.error.issues[0]?.message ?? 'An error occurred',
      };
    }

    const hashedPassword = await hash(password, 10);

    await db.insert(users).values({
      email,
      password: hashedPassword,
    });
  } catch (e: unknown) {
    const error = e as { code?: string };
    if (error.code === '23505') {
      return {
        error: 'An account is already registered with this email address',
      };
    }
    return {
      error: 'An error occurred.',
    };
  }
};
