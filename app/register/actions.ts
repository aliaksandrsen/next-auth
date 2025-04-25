'use server';

import { passwordMatchSchema } from '@/validation/passwordMatchSchema';
import { z } from 'zod';

export const registerUser = async ({
  email,
  password,
  passwordConfirm,
}: {
  email: string;
  password: string;
  passwordConfirm: string;
}) => {
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

  return newUserValues;
};
