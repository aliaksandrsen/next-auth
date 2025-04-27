'use server';

// import { db } from '@/db/drizzle';
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
  // const result = await db.select();
  // console.log(' result:', result);

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
