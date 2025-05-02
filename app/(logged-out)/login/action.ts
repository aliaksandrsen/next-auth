'use server';

import { signIn } from '@/auth';
import { z } from 'zod';

export const loginWithCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
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
      redirect: false,
    });
  } catch {
    return {
      error: 'Incorrect email or password',
    };
  }
};
