'use server';

// import { db } from '@/db/drizzle';
import { z } from 'zod';
// import { hash } from 'bcryptjs';
// import { users } from '@/db/usersSchema';

export const loginWithCredentials = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}) => {
  try {
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

    // await db.insert(users).values({
    //   email,
    //   password: hashedPassword,
    // });
  } catch (e: unknown) {
    console.log(' e:', e);
    // const error = e as { code?: string };
    // if (error.code === '23505') {
    //   return {
    //     error: 'An account is already registered with this email address',
    //   };
    // }
    // return {
    //   error: 'An error occurred.',
    // };
  }
};
